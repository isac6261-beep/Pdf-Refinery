import React, { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import { extractTextFromAllPages } from '../services/pdfService';
import { DownloadIcon, FileTextIcon, XIcon } from './Icons';
import Loader from './Loader';

const ExtractTextTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setExtractedText(null);
      setError(null);
      setIsLoading(true);

      try {
        const text = await extractTextFromAllPages(selectedFile);
        setExtractedText(text);
      } catch (err) {
        console.error(err);
        setError("Could not extract text from the PDF. It might be corrupted or empty.");
      } finally {
        setIsLoading(false);
      }
    }
  }, []);
  
  const handleDownload = () => {
    if (!extractedText || !file) return;

    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Derive txt filename from pdf filename
    const txtFilename = file.name.replace(/\.[^/.]+$/, "") + ".txt";
    a.download = txtFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleReset = () => {
      setFile(null);
      setExtractedText(null);
      setError(null);
      setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Extract Text from PDF</h2>
        <p className="text-slate-400">Upload a PDF to extract all its text content into a downloadable text file.</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 text-red-300 hover:text-red-100"><XIcon className="w-5 h-5"/></button>
        </div>
      )}

      {!file && !isLoading && (
        <FileUpload
          onFilesSelect={handleFileSelect}
          multiple={false}
          title="Drag & Drop a PDF to Extract Text"
          description="or click to select a file"
        />
      )}

      {isLoading && <Loader text="Extracting text from all pages..." />}

      {file && !isLoading && extractedText !== null && (
        <div className="bg-slate-800/50 p-6 rounded-lg space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <FileTextIcon className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200">Extraction Complete</h3>
                        <p className="text-slate-400 truncate max-w-xs" title={file.name}>{file.name}</p>
                    </div>
                 </div>
                 <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={handleReset} className="w-full sm:w-auto text-center bg-slate-700 text-slate-200 px-4 py-2 rounded-md hover:bg-slate-600 transition-colors">
                        Process Another PDF
                    </button>
                 </div>
            </div>
            
          <textarea
            value={extractedText}
            readOnly
            className="w-full h-96 bg-slate-800 border border-slate-700 rounded-md p-3 text-slate-300 font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Extracted text from PDF"
          />
          
          <div className="flex justify-center pt-4">
            <button
              onClick={handleDownload}
              className="flex items-center gap-3 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
            >
              <DownloadIcon className="w-6 h-6" />
              <span>Download .txt File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtractTextTool;
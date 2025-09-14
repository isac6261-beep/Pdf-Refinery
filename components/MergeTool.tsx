import React, { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import { mergePdfs } from '../services/pdfService';
// FIX: Import `FileStackIcon` to resolve the "Cannot find name 'FileStackIcon'" error.
import { FileIcon, XIcon, DownloadIcon, FileStackIcon } from './Icons';
import Loader from './Loader';

const MergeTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }, []);
  
  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const [movedItem] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedItem);
      return newFiles;
    });
  }, []);

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least two PDF files to merge.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const mergedPdfBytes = await mergePdfs(files);
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setFiles([]);
    } catch (err) {
      console.error(err);
      setError('An error occurred while merging the PDFs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader text="Merging PDFs..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Merge PDFs</h2>
        <p className="text-slate-400">Combine multiple PDFs into a single document. Drag to reorder.</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <FileUpload
        onFilesSelect={handleFilesSelect}
        multiple={true}
        title="Drag & Drop PDFs to Merge"
        description="or click to select files"
      />

      {files.length > 0 && (
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4 text-slate-200">Files to Merge ({files.length})</h3>
          <ul className="space-y-3">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-slate-700 p-3 rounded-md shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileIcon className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                  <span className="truncate text-slate-300">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => moveFile(index, index - 1)} disabled={index === 0} className="p-1 disabled:opacity-30">&#9650;</button>
                  <button onClick={() => moveFile(index, index + 1)} disabled={index === files.length - 1} className="p-1 disabled:opacity-30">&#9660;</button>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 1 && (
        <div className="flex justify-center">
          <button
            onClick={handleMerge}
            disabled={isLoading}
            className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 disabled:bg-indigo-900 disabled:cursor-not-allowed"
          >
            <FileStackIcon className="w-6 h-6" />
            <span>Merge PDFs</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MergeTool;
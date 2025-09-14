
import React, { useState, useCallback, useEffect } from 'react';
import FileUpload from './FileUpload';
import { getPdfPageCount, extractTextFromPage } from '../services/pdfService';
import { processTextWithAI } from '../services/geminiService';
import { Wand2Icon } from './Icons';
import Loader from './Loader';

const AiEditTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [activePage, setActivePage] = useState<number | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [prompt, setPrompt] = useState('Summarize the following text in three key bullet points.');
  const [aiResult, setAiResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setActivePage(null);
      setExtractedText('');
      setAiResult('');
      setIsLoading(true);
      setError(null);
      getPdfPageCount(selectedFile)
        .then(count => {
          setPageCount(count);
          setIsLoading(false);
          setActivePage(1); // Select the first page by default
        })
        .catch(err => {
          console.error(err);
          setError("Could not read the PDF file. It might be corrupted.");
          setIsLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (file && activePage) {
      setIsLoading(true);
      setExtractedText('');
      setAiResult('');
      extractTextFromPage(file, activePage)
        .then(text => {
          setExtractedText(text);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError(`Could not extract text from page ${activePage}.`);
          setIsLoading(false);
        });
    }
  }, [file, activePage]);

  const handlePromptSubmit = async () => {
    if (!prompt || !extractedText) {
      setError("Prompt and extracted text cannot be empty.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setAiResult('');
    try {
      const result = await processTextWithAI(prompt, extractedText);
      setAiResult(result);
    } catch (err) {
      console.error(err);
      setError("An AI processing error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const presetPrompts = [
      "Summarize this text.",
      "Translate this text to Spanish.",
      "Correct any grammar and spelling mistakes.",
      "Rewrite this in a more professional tone.",
      "Extract the key action items from this text.",
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">AI PDF Assistant</h2>
        <p className="text-slate-400">Extract text from a PDF page and use AI to summarize, translate, or rewrite it.</p>
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md">{error}</div>}

      {!file && (
        <FileUpload
          onFilesSelect={handleFileSelect}
          multiple={false}
          title="Upload a PDF to Edit"
          description="or click to select a file"
        />
      )}
      
      {file && (
        <>
            <div className="bg-slate-800/50 p-4 rounded-lg">
                <label htmlFor="page-select" className="block text-sm font-medium text-slate-300 mb-2">Select a page to analyze:</label>
                <select id="page-select" value={activePage || ''} onChange={(e) => setActivePage(Number(e.target.value))} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-indigo-500 focus:border-indigo-500">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNum => (
                        <option key={pageNum} value={pageNum}>Page {pageNum}</option>
                    ))}
                </select>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-200">Extracted Text (Page {activePage})</h3>
                    <textarea value={extractedText} readOnly className="w-full h-96 bg-slate-800 border border-slate-700 rounded-md p-3 text-slate-300 font-mono text-sm" placeholder={isLoading ? "Extracting text..." : "Text from PDF will appear here."}></textarea>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-200">AI Generated Content</h3>
                    <div className="w-full h-96 bg-slate-800 border border-slate-700 rounded-md p-3 text-slate-300 font-mono text-sm overflow-y-auto" >
                        {isLoading && !aiResult ? <Loader text="AI is thinking..."/> : <pre className="whitespace-pre-wrap break-words">{aiResult || "AI response will appear here."}</pre>}
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                 <h3 className="text-lg font-semibold text-slate-200">Your Prompt</h3>
                 <div className="flex flex-wrap gap-2">
                     {presetPrompts.map(p => (
                         <button key={p} onClick={() => setPrompt(p)} className="bg-slate-700 text-sm text-slate-300 px-3 py-1 rounded-full hover:bg-slate-600 transition-colors">{p}</button>
                     ))}
                 </div>
                 <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-indigo-500 focus:border-indigo-500" rows={3}></textarea>
                 <button onClick={handlePromptSubmit} disabled={isLoading || !extractedText} className="flex items-center gap-2 w-full justify-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 disabled:bg-indigo-900 disabled:cursor-not-allowed">
                     <Wand2Icon className="w-6 h-6" />
                     <span>Generate with AI</span>
                 </button>
            </div>
        </>
      )}
    </div>
  );
};

export default AiEditTool;

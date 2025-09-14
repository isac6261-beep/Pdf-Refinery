
import React, { useState, useEffect, useRef, useCallback } from 'react';
import FileUpload from './FileUpload';
import { getPdfPageCount, renderPdfPageToCanvas, splitPdf } from '../services/pdfService';
import { DownloadIcon, ScissorsIcon } from './Icons';
import Loader from './Loader';

const PageThumbnail: React.FC<{
    file: File;
    pageNumber: number;
    isSelected: boolean;
    onSelect: (pageNumber: number) => void;
}> = React.memo(({ file, pageNumber, isSelected, onSelect }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            renderPdfPageToCanvas(file, pageNumber, canvasRef.current);
        }
    }, [file, pageNumber]);

    return (
        <div onClick={() => onSelect(pageNumber)} className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${isSelected ? 'border-indigo-500 scale-105 shadow-lg' : 'border-slate-700 hover:border-slate-500'}`}>
            <canvas ref={canvasRef} className="w-full h-auto bg-white"></canvas>
            <div className="absolute top-2 right-2 bg-slate-900/50 w-6 h-6 rounded-full flex items-center justify-center">
                <input type="checkbox" readOnly checked={isSelected} className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <p className="absolute bottom-0 w-full text-center bg-slate-900/70 text-white text-sm py-1">{pageNumber}</p>
        </div>
    );
});


const SplitTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = useCallback((files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setSelectedPages([]);
            setPageCount(0);
            setError(null);
        }
    }, []);
    
    useEffect(() => {
        if (file) {
            setIsLoading(true);
            getPdfPageCount(file)
                .then(count => {
                    setPageCount(count);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setError("Could not read the PDF file. It might be corrupted.");
                    setIsLoading(false);
                });
        }
    }, [file]);

    const togglePageSelection = useCallback((pageNumber: number) => {
        setSelectedPages(prev =>
            prev.includes(pageNumber)
                ? prev.filter(p => p !== pageNumber)
                : [...prev, pageNumber].sort((a,b) => a - b)
        );
    }, []);

    const handleSplit = async () => {
        if (!file || selectedPages.length === 0) {
            setError('Please select at least one page to extract.');
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const splitPdfBytes = await splitPdf(file, selectedPages);
            const blob = new Blob([splitPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `split_${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setError('An error occurred while splitting the PDF.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const selectAllPages = () => setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1));
    const clearSelection = () => setSelectedPages([]);

    if (isLoading && !pageCount) {
        return <Loader text="Processing PDF..." />;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-100 mb-2">Split PDF</h2>
                <p className="text-slate-400">Extract pages from a PDF file. Select the pages you want to keep.</p>
            </div>
            
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md">{error}</div>}

            {!file && (
                <FileUpload
                    onFilesSelect={handleFileSelect}
                    multiple={false}
                    title="Drag & Drop a PDF to Split"
                    description="or click to select a file"
                />
            )}
            
            {file && (
                 <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                     <div className="flex justify-between items-center">
                        <p className="text-slate-300 font-medium">Selected: {selectedPages.length} of {pageCount} pages</p>
                        <div className="flex gap-2">
                             <button onClick={selectAllPages} className="bg-slate-700 text-slate-200 px-3 py-1 rounded-md text-sm hover:bg-slate-600">Select All</button>
                             <button onClick={clearSelection} className="bg-slate-700 text-slate-200 px-3 py-1 rounded-md text-sm hover:bg-slate-600">Clear</button>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNum => (
                            <PageThumbnail
                                key={pageNum}
                                file={file}
                                pageNumber={pageNum}
                                isSelected={selectedPages.includes(pageNum)}
                                onSelect={togglePageSelection}
                            />
                        ))}
                    </div>
                 </div>
            )}
            
            {selectedPages.length > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={handleSplit}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 disabled:bg-indigo-900 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="w-6 h-6" />
                        <span>Extract {selectedPages.length} Pages</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default SplitTool;

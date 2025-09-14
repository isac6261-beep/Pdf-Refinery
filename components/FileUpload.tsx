
import React, { useState, useCallback } from 'react';
import { UploadCloudIcon } from './Icons';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  multiple?: boolean;
  title: string;
  description: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelect,
  multiple = false,
  title,
  description,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
      if (files.length > 0) {
        onFilesSelect(files);
      }
    },
    [onFilesSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        onFilesSelect(files);
      }
    },
    [onFilesSelect]
  );

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
        ${isDragging ? 'border-indigo-500 bg-slate-800/80 scale-105' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
    >
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
        <UploadCloudIcon className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="text-xl font-semibold text-slate-200 mb-1">{title}</h3>
        <p className="text-slate-400 mb-4">{description}</p>
        <span className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
          Select File(s)
        </span>
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".pdf"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;

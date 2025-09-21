'use client';

import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

interface DocumentUploadProps {
  onFileSelect: (url: string, file: File) => void;
  loading?: boolean;
}

export function DocumentUpload({ onFileSelect, loading = false }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (loading) return; // Prevent file selection while loading
    
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    // Create a URL for the file
    const url = URL.createObjectURL(file);
    onFileSelect(url, file);
  };

  return (
    <div className="p-8 max-w-2xl w-full mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-teal-500'
        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-teal-50">
            {isDragging ? (
              <Upload className="w-8 h-8 text-teal-600" />
            ) : (
              <FileText className="w-8 h-8 text-teal-600" />
            )}
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              {loading ? 'Uploading...' : 'Upload your PDF document'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {loading 
                ? 'Please wait while we process your document'
                : 'Drag and drop your file here, or click to select'
              }
            </p>
          </div>

          <div className="flex gap-2 text-sm text-gray-500">
            <span className="px-2 py-1 rounded bg-gray-100">PDF</span>
            <span>Up to 10MB</span>
          </div>

          <label className="mt-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <span className={`px-4 py-2 rounded-lg cursor-pointer ${
              loading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}>
              {loading ? 'Uploading...' : 'Select file'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

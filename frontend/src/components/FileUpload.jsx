import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle, Sparkles, Loader2, Plus, CheckCircle2 } from 'lucide-react';

export default function FileUpload({
  files,
  onFilesChange,
  onAnalyze,
  isAnalyzing,
  globalError,
  onClearGlobalError,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localWarning, setLocalWarning] = useState(null);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileSelection = (newFileList) => {
    setLocalWarning(null);
    if (onClearGlobalError) onClearGlobalError();

    const selectedArray = Array.from(newFileList);
    const validPdfs = [];
    const invalidFiles = [];

    selectedArray.forEach((file) => {
      if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
        // Prevent duplicate filenames in current selection
        if (!files.some((f) => f.name === file.name)) {
          validPdfs.push(file);
        }
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setLocalWarning(
        `Only PDF documents are supported. Skipped non-PDF file(s): ${invalidFiles.join(', ')}`
      );
    }

    if (validPdfs.length > 0) {
      onFilesChange([...files, ...validPdfs]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveFile = (indexToRemove) => {
    onFilesChange(files.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAll = () => {
    onFilesChange([]);
    setLocalWarning(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/20 scale-[0.99]'
            : 'border-slate-700 hover:border-indigo-500/70 bg-slate-900/40 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelection(e.target.files);
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-base font-medium text-slate-200">
              Drag & Drop PDF Resumes here, or{' '}
              <span className="text-indigo-400 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports multiple PDF documents • Up to 15MB each
            </p>
          </div>
        </div>
      </div>

      {/* Warnings & Errors */}
      {localWarning && (
        <div className="flex items-start space-x-3 p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <div className="flex-1">{localWarning}</div>
          <button
            onClick={() => setLocalWarning(null)}
            className="text-amber-400 hover:text-amber-200 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {globalError && (
        <div className="flex items-start space-x-3 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">{globalError}</div>
          {onClearGlobalError && (
            <button
              onClick={onClearGlobalError}
              className="text-rose-400 hover:text-rose-200 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Uploaded File Queue List */}
      {files.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Selected Files ({files.length})
            </span>
            <button
              onClick={handleClearAll}
              disabled={isAnalyzing}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 text-sm transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-200 font-medium truncate text-xs sm:text-sm">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFile(idx)}
                  disabled={isAnalyzing}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Action Trigger */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More Resumes</span>
            </button>

            <button
              onClick={onAnalyze}
              disabled={isAnalyzing || files.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting & Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze {files.length} Resume{files.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

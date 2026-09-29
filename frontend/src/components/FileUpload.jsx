import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle, Loader2, Plus } from 'lucide-react';

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
        if (!files.some((f) => f.name === file.name)) {
          validPdfs.push(file);
        }
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setLocalWarning(
        `Only PDF documents are supported. Skipped: ${invalidFiles.join(', ')}`
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
      {/* Upload Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
            : 'border-blue-200/90 hover:border-blue-400 bg-blue-50/20 hover:bg-blue-50/40'
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

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center shadow-xs mb-1">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              Drag & drop resume PDF here, or{' '}
              <span className="text-blue-600 underline underline-offset-2 font-semibold">
                browse files
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports single or multiple PDF documents up to 15MB each
            </p>
          </div>
        </div>
      </div>

      {/* Warnings & Global Errors */}
      {localWarning && (
        <div className="flex items-start space-x-3 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">{localWarning}</div>
          <button
            onClick={() => setLocalWarning(null)}
            className="text-amber-600 hover:text-amber-800 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {globalError && (
        <div className="flex items-start space-x-3 p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">{globalError}</div>
          {onClearGlobalError && (
            <button
              onClick={onClearGlobalError}
              className="text-rose-600 hover:text-rose-800 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Uploaded File Queue List */}
      {files.length > 0 && (
        <div className="bg-white border border-blue-100/80 rounded-2xl p-4 space-y-3 shadow-[0_2px_12px_rgba(37,99,235,0.03)]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Selected Files ({files.length})
            </span>
            <button
              onClick={handleClearAll}
              disabled={isAnalyzing}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl border border-slate-200/70 text-xs transition-colors"
              >
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <div className="p-1 rounded-lg bg-blue-100/60 text-blue-600 flex-shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-800 font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFile(idx)}
                  disabled={isAnalyzing}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors disabled:opacity-50"
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
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Add More Resumes</span>
            </button>

            <button
              onClick={onAnalyze}
              disabled={isAnalyzing || files.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-sm shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Resume{files.length > 1 ? 's' : ''}...</span>
                </>
              ) : (
                <span>Analyze {files.length} Resume{files.length > 1 ? 's' : ''}</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

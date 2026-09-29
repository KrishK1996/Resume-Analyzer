import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle, Loader2, Plus, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

export default function FileUpload({
  files,
  onFilesChange,
  jobDescription,
  onJobDescriptionChange,
  onAnalyze,
  isAnalyzing,
  globalError,
  onClearGlobalError,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localWarning, setLocalWarning] = useState(null);
  const [isJdExpanded, setIsJdExpanded] = useState(false);
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
      {/* Upload Drop Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 shadow-[0_2px_20px_rgba(102,104,246,0.07)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.15)] ${
          isDragOver
            ? 'border-[#6668F6] bg-[#6668F6]/8 dark:bg-[#6668F6]/12 scale-[0.99]'
            : 'border-[#6668F6]/25 dark:border-[#6668F6]/30 hover:border-[#6668F6]/60 dark:hover:border-[#6668F6]/55 bg-[#6668F6]/3 dark:bg-[#6668F6]/5 hover:bg-[#6668F6]/7 dark:hover:bg-[#6668F6]/10'
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
          <div className="w-12 h-12 rounded-2xl bg-[#6668F6]/10 dark:bg-[#6668F6]/15 text-[#6668F6] flex items-center justify-center shadow-xs mb-1 transition-all duration-300">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#0f0f1e] dark:text-[#f0f0ff]">
              Drag &amp; drop resume PDF here, or{' '}
              <span className="text-[#6668F6] underline underline-offset-2 font-semibold">
                browse files
              </span>
            </p>
            <p className="text-xs text-[#0f0f1e]/50 dark:text-[#f0f0ff]/40 mt-1">
              Supports single or multiple PDF documents up to 15MB each
            </p>
          </div>
        </div>
      </div>

      {/* Warnings & Global Errors */}
      {localWarning && (
        <div className="flex items-start space-x-3 p-3.5 bg-[#F6F466]/10 dark:bg-[#F6F466]/8 border border-[#F6F466]/30 dark:border-[#F6F466]/25 rounded-xl text-[#0f0f1e]/80 dark:text-[#F6F466] text-xs transition-all duration-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#F6F466]" />
          <div className="flex-1">{localWarning}</div>
          <button
            onClick={() => setLocalWarning(null)}
            className="text-[#F6F466]/70 hover:text-[#F6F466] p-0.5 transition-all duration-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {globalError && (
        <div className="flex items-start space-x-3 p-3.5 bg-[#F666B0]/10 dark:bg-[#F666B0]/8 border border-[#F666B0]/30 dark:border-[#F666B0]/25 rounded-xl text-[#0f0f1e]/80 dark:text-[#F666B0] text-xs transition-all duration-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#F666B0]" />
          <div className="flex-1">{globalError}</div>
          {onClearGlobalError && (
            <button
              onClick={onClearGlobalError}
              className="text-[#F666B0]/70 hover:text-[#F666B0] p-0.5 transition-all duration-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Optional Job Description Matching Panel */}
      <div className="bg-white dark:bg-[#0d0d1e] border border-[#6668F6]/15 dark:border-[#6668F6]/20 rounded-2xl p-4 shadow-[0_2px_20px_rgba(102,104,246,0.07)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.15)] transition-all duration-300">
        <button
          type="button"
          onClick={() => setIsJdExpanded(!isJdExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#6668F6]/10 dark:bg-[#6668F6]/12 text-[#6668F6] transition-all duration-300">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0f0f1e] dark:text-[#f0f0ff]">
                Compare with Job Description <span className="font-normal text-[#0f0f1e]/40 dark:text-[#f0f0ff]/35">(Optional)</span>
              </p>
              <p className="text-[11px] text-[#0f0f1e]/50 dark:text-[#f0f0ff]/40">
                Paste a Job Description to calculate match scores, matching skills, and gap analysis
              </p>
            </div>
          </div>
          <div className="text-[#0f0f1e]/35 dark:text-[#f0f0ff]/30 hover:text-[#6668F6] dark:hover:text-[#6668F6] p-1 transition-all duration-300">
            {isJdExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isJdExpanded && (
          <div className="mt-3 pt-3 border-t border-[#6668F6]/10 dark:border-[#6668F6]/15 space-y-2">
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
              placeholder="Paste job title, required skills, and key responsibilities here..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#6668F6]/20 dark:border-[#6668F6]/25 bg-[#fafafe] dark:bg-[#0a0a12] text-xs text-[#0f0f1e] dark:text-[#f0f0ff] placeholder-[#0f0f1e]/35 dark:placeholder-[#f0f0ff]/25 focus:outline-none focus:border-[#6668F6] focus:ring-1 focus:ring-[#6668F6]/30 transition-all duration-300"
            />
            <div className="flex items-center justify-between text-[11px] text-[#0f0f1e]/40 dark:text-[#f0f0ff]/30">
              <span>{jobDescription ? `${jobDescription.length} characters entered` : 'Leave empty to perform standard resume extraction'}</span>
              {jobDescription && (
                <button
                  type="button"
                  onClick={() => onJobDescriptionChange('')}
                  className="text-[#0f0f1e]/40 dark:text-[#f0f0ff]/30 hover:text-[#F666B0] dark:hover:text-[#F666B0] transition-all duration-300"
                >
                  Clear Job Description
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Uploaded File Queue List */}
      {files.length > 0 && (
        <div className="bg-white dark:bg-[#0d0d1e] border border-[#6668F6]/15 dark:border-[#6668F6]/20 rounded-2xl p-4 space-y-3 shadow-[0_2px_20px_rgba(102,104,246,0.07)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.15)] transition-all duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-[#6668F6]/10 dark:border-[#6668F6]/15">
            <span className="text-xs font-semibold text-[#0f0f1e]/50 dark:text-[#f0f0ff]/40 uppercase tracking-wider">
              Selected Files ({files.length})
            </span>
            <button
              onClick={handleClearAll}
              disabled={isAnalyzing}
              className="text-xs text-[#0f0f1e]/40 dark:text-[#f0f0ff]/30 hover:text-[#F666B0] dark:hover:text-[#F666B0] transition-all duration-300 disabled:opacity-50"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-2.5 bg-[#fafafe] dark:bg-[#0a0a12] hover:bg-[#6668F6]/5 dark:hover:bg-[#6668F6]/8 rounded-xl border border-[#6668F6]/12 dark:border-[#6668F6]/18 text-xs transition-all duration-300"
              >
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <div className="p-1 rounded-lg bg-[#6668F6]/10 dark:bg-[#6668F6]/12 text-[#6668F6] flex-shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#0f0f1e] dark:text-[#f0f0ff] font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-[#0f0f1e]/40 dark:text-[#f0f0ff]/30">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFile(idx)}
                  disabled={isAnalyzing}
                  className="p-1 text-[#0f0f1e]/30 dark:text-[#f0f0ff]/25 hover:text-[#F666B0] dark:hover:text-[#F666B0] rounded-lg transition-all duration-300 disabled:opacity-50"
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
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#6668F6]/20 dark:border-[#6668F6]/25 hover:bg-[#6668F6]/8 dark:hover:bg-[#6668F6]/10 text-[#0f0f1e]/70 dark:text-[#f0f0ff]/70 text-xs font-medium flex items-center justify-center space-x-1.5 transition-all duration-300 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 text-[#6668F6]" />
              <span>Add More Resumes</span>
            </button>

            <button
              onClick={onAnalyze}
              disabled={isAnalyzing || files.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6668F6] to-[#F666B0] text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-[0_4px_20px_rgba(102,104,246,0.4)] hover:shadow-[0_6px_28px_rgba(102,104,246,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-[0_4px_20px_rgba(102,104,246,0.4)]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{jobDescription?.trim() ? 'Extracting & Matching JD...' : 'Analyzing Resume...'}</span>
                </>
              ) : (
                <span>
                  {jobDescription?.trim()
                    ? `Analyze & Compare ${files.length} Resume${files.length > 1 ? 's' : ''}`
                    : `Analyze ${files.length} Resume${files.length > 1 ? 's' : ''}`}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

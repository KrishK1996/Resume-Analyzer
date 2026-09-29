import React, { useState } from 'react';
import { Code, X, Copy, Check, Download } from 'lucide-react';

export default function JsonModal({ isOpen, onClose, data, filename }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(filename || 'resume').replace(/\.pdf$/i, '')}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Extracted JSON Data</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{filename || 'Document'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* JSON Viewer */}
        <div className="mt-3 flex-1 overflow-auto bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-200 leading-relaxed shadow-inner border border-slate-800/60">
          <pre>{jsonString}</pre>
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a12]/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0d0d1e] border border-[#6668F6]/20 dark:border-[#6668F6]/25 w-full max-w-3xl rounded-2xl p-5 shadow-[0_8px_40px_rgba(102,104,246,0.2)] flex flex-col max-h-[85vh] transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#6668F6]/10 dark:border-[#6668F6]/15 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#6668F6]/10 dark:bg-[#6668F6]/12 text-[#6668F6]">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0f0f1e] dark:text-[#f0f0ff]">Extracted JSON Data</h3>
              <p className="text-xs text-[#0f0f1e]/45 dark:text-[#f0f0ff]/35">{filename || 'Document'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg border border-[#6668F6]/20 dark:border-[#6668F6]/25 bg-white dark:bg-[#0a0a12] hover:bg-[#6668F6]/8 dark:hover:bg-[#6668F6]/10 text-[#0f0f1e]/70 dark:text-[#f0f0ff]/60 text-xs font-medium flex items-center space-x-1.5 transition-all duration-300 shadow-[0_1px_6px_rgba(102,104,246,0.08)]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#66F6AC]" />
                  <span className="text-[#66F6AC] font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6668F6]/60" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg border border-[#6668F6]/20 dark:border-[#6668F6]/25 bg-white dark:bg-[#0a0a12] hover:bg-[#6668F6]/8 dark:hover:bg-[#6668F6]/10 text-[#0f0f1e]/70 dark:text-[#f0f0ff]/60 text-xs font-medium flex items-center space-x-1.5 transition-all duration-300 shadow-[0_1px_6px_rgba(102,104,246,0.08)]"
            >
              <Download className="w-3.5 h-3.5 text-[#6668F6]/60" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#0f0f1e]/35 dark:text-[#f0f0ff]/30 hover:text-[#F666B0] dark:hover:text-[#F666B0] transition-all duration-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* JSON Viewer — always dark terminal bg */}
        <div className="mt-3 flex-1 overflow-auto bg-[#0a0a12] rounded-xl p-4 font-mono text-xs text-[#f0f0ff]/80 leading-relaxed shadow-inner border border-[#6668F6]/15">
          <pre>{jsonString}</pre>
        </div>
      </div>
    </div>
  );
}

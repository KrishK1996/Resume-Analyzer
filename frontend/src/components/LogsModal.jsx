import React, { useState, useEffect } from 'react';
import { Terminal, X, RefreshCw, Download, Check } from 'lucide-react';
import { getSystemLogs } from '../services/api';

export default function LogsModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getSystemLogs(200);
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume_analyzer_operations.log';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a12]/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0d0d1e] border border-[#6668F6]/20 dark:border-[#6668F6]/25 w-full max-w-4xl rounded-2xl p-5 shadow-[0_8px_40px_rgba(102,104,246,0.2)] flex flex-col max-h-[85vh] transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#6668F6]/10 dark:border-[#6668F6]/15 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#6668F6]/10 dark:bg-[#6668F6]/12 text-[#6668F6]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0f0f1e] dark:text-[#f0f0ff]">
                Centralized System Log
              </h3>
              <p className="text-xs text-[#0f0f1e]/45 dark:text-[#f0f0ff]/35">
                Live audit trail of operations, extractions, and diagnostic records
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-1.5 rounded-lg border border-[#6668F6]/20 dark:border-[#6668F6]/25 bg-white dark:bg-[#0a0a12] text-[#6668F6]/70 hover:bg-[#6668F6]/8 dark:hover:bg-[#6668F6]/10 text-xs transition-all duration-300"
              title="Refresh logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg border border-[#6668F6]/20 dark:border-[#6668F6]/25 bg-white dark:bg-[#0a0a12] text-[#0f0f1e]/70 dark:text-[#f0f0ff]/60 text-xs font-medium flex items-center space-x-1.5 transition-all duration-300 hover:bg-[#6668F6]/8 dark:hover:bg-[#6668F6]/10"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#66F6AC]" />
                  <span className="text-[#66F6AC]">Copied</span>
                </>
              ) : (
                <span>Copy</span>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg border border-[#6668F6]/20 dark:border-[#6668F6]/25 bg-white dark:bg-[#0a0a12] text-[#0f0f1e]/70 dark:text-[#f0f0ff]/60 text-xs font-medium flex items-center space-x-1.5 transition-all duration-300 hover:bg-[#6668F6]/8 dark:hover:bg-[#6668F6]/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#0f0f1e]/35 dark:text-[#f0f0ff]/30 hover:text-[#F666B0] dark:hover:text-[#F666B0] transition-all duration-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Log Viewer Screen — always dark terminal bg */}
        <div className="mt-3 flex-1 overflow-auto bg-[#0a0a12] rounded-xl p-4 font-mono text-xs leading-relaxed text-[#f0f0ff]/70 shadow-inner border border-[#6668F6]/15">
          {logs.length === 0 ? (
            <p className="text-[#f0f0ff]/30 italic">No logs recorded yet.</p>
          ) : (
            logs.map((line, idx) => {
              const isError = line.includes('[ERROR]');
              const isWarn = line.includes('[WARNING]');
              const isSuccess = line.includes('SUCCESS') || line.includes('[PDF_TEXT_EXTRACTED]');
              
              // Brand color log levels: pink=error, yellow=warn, mint=success
              let color = 'text-[#f0f0ff]/60';
              if (isError) color = 'text-[#F666B0] font-semibold';
              else if (isWarn) color = 'text-[#F6F466]';
              else if (isSuccess) color = 'text-[#66F6AC]';

              return (
                <div key={idx} className={`${color} whitespace-pre-wrap py-0.5`}>
                  {line}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

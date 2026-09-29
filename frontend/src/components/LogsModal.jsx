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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Centralized System Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live audit trail of operations, extractions, and diagnostic records
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <span>Copy</span>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Log Viewer Screen */}
        <div className="mt-3 flex-1 overflow-auto bg-slate-950 rounded-xl p-4 font-mono text-xs leading-relaxed text-slate-300 shadow-inner">
          {logs.length === 0 ? (
            <p className="text-slate-500 italic">No logs recorded yet.</p>
          ) : (
            logs.map((line, idx) => {
              const isError = line.includes('[ERROR]');
              const isWarn = line.includes('[WARNING]');
              const isSuccess = line.includes('SUCCESS') || line.includes('[PDF_TEXT_EXTRACTED]');
              
              let color = 'text-slate-300';
              if (isError) color = 'text-rose-400 font-semibold';
              else if (isWarn) color = 'text-amber-300';
              else if (isSuccess) color = 'text-emerald-300';

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

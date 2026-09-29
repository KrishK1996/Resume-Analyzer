import React from 'react';
import { FileSearch, Sparkles, Key, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Header({ isKeyConfigured, modelName, onOpenKeyModal }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FileSearch className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">ResumeLens AI</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Groq Powered
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-PDF parsing, strict fact extraction & structured JSON analytics
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-3">
          {/* Key status pill */}
          <button
            onClick={onOpenKeyModal}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isKeyConfigured
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/40 animate-pulse'
            }`}
            title="Click to view or update Groq API Key"
          >
            {isKeyConfigured ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Connected ({modelName || 'Llama 3.3'})</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>API Key Needed</span>
              </>
            )}
            <Key className="w-3 h-3 ml-1 opacity-70" />
          </button>
        </div>
      </div>
    </header>
  );
}

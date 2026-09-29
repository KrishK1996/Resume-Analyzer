import React from 'react';
import { FileText } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-base text-slate-900 tracking-tight leading-none">
              Resume Analyzer
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automated PDF Data Extraction & Structured Parsing
            </p>
          </div>
        </div>

        {/* Clean Application Status */}
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-slate-600">System Ready</span>
        </div>

      </div>
    </header>
  );
}

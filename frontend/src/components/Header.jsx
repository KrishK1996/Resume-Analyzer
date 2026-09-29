import React from 'react';

export default function Header() {
  return (
    <header className="border-b border-blue-100/80 bg-white/90 backdrop-blur sticky top-0 z-30 shadow-[0_1px_8px_rgba(37,99,235,0.03)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 py-1">
          <img
            src="/logo.png"
            alt="Resume Analyzer"
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </div>

        {/* Clean Status Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>

      </div>
    </header>
  );
}

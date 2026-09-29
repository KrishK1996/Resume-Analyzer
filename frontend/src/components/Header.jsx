import React from 'react';
import { Sun, Moon, Terminal } from 'lucide-react';

export default function Header({ isDarkMode, onToggleTheme, onOpenLogsModal }) {
  return (
    <header className="border-b border-blue-100/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-30 shadow-[0_1px_8px_rgba(37,99,235,0.03)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 py-1">
          <img
            src="/logo.png"
            alt="Resume Analyzer"
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </div>

        {/* Header Controls: Logs, Theme Switcher, Online Status */}
        <div className="flex items-center space-x-2.5">
          {/* Centralized Log Viewer Trigger */}
          <button
            onClick={onOpenLogsModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            title="View Centralized Operation Logs"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">System Logs</span>
          </button>

          {/* Theme Toggle (Light / Dark Mode) */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready</span>
          </div>
        </div>

      </div>
    </header>
  );
}

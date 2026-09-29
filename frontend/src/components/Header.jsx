import React from 'react';
import { Sun, Moon, Terminal } from 'lucide-react';

export default function Header({ isDarkMode, onToggleTheme, onOpenLogsModal }) {
  return (
    <header className="border-b border-[#6668F6]/15 dark:border-[#6668F6]/20 bg-white/90 dark:bg-[#0d0d1e]/90 backdrop-blur sticky top-0 z-30 shadow-[0_1px_12px_rgba(102,104,246,0.06)] transition-all duration-300">
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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#6668F6]/20 dark:border-[#6668F6]/25 bg-[#6668F6]/5 dark:bg-[#6668F6]/8 hover:bg-[#6668F6]/10 dark:hover:bg-[#6668F6]/15 text-[#0f0f1e]/70 dark:text-[#f0f0ff]/70 text-xs font-medium transition-all duration-300"
            title="View Centralized Operation Logs"
          >
            <Terminal className="w-3.5 h-3.5 text-[#6668F6]" />
            <span className="hidden sm:inline">System Logs</span>
          </button>

          {/* Theme Toggle (Light / Dark Mode) */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-[#6668F6]/20 dark:border-[#6668F6]/25 bg-[#6668F6]/5 dark:bg-[#6668F6]/8 hover:bg-[#6668F6]/10 dark:hover:bg-[#6668F6]/15 text-[#0f0f1e]/70 dark:text-[#f0f0ff]/70 text-xs transition-all duration-300"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-[#F6F466]" />
            ) : (
              <Moon className="w-4 h-4 text-[#6668F6]" />
            )}
          </button>

          {/* Status Indicator — Ready */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#66F6AC]/10 dark:bg-[#66F6AC]/8 border border-[#66F6AC]/30 dark:border-[#66F6AC]/25 text-[#66F6AC] text-xs font-medium transition-all duration-300">
            <span className="w-2 h-2 rounded-full bg-[#66F6AC] animate-pulse" />
            <span>Ready</span>
          </div>
        </div>

      </div>
    </header>
  );
}

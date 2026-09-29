import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ResumeViewer from './components/ResumeViewer';
import JsonModal from './components/JsonModal';
import LogsModal from './components/LogsModal';
import DynamicBackground from './components/DynamicBackground';
import { analyzeResumes } from './services/api';

export default function App() {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [jsonModalState, setJsonModalState] = useState({ isOpen: false, data: null, filename: '' });
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Light / Dark mode management with persistent storage
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('resume_analyzer_theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('resume_analyzer_theme', theme);
    } catch (e) {
      // Ignore storage write issues
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAnalyze = async () => {
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    setGlobalError(null);

    try {
      const response = await analyzeResumes(files, jobDescription);
      setAnalysisResults(response.results);
    } catch (err) {
      console.error('Analysis failed:', err);
      setGlobalError(
        err.message || 'An error occurred while connecting to the resume processing service.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenJsonModal = (data, filename) => {
    setJsonModalState({
      isOpen: true,
      data,
      filename,
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200 relative overflow-x-hidden">
      {/* Dynamic Animated Text Ribbons in Background */}
      <DynamicBackground />

      {/* Top Navbar with Logo, Theme Switcher & Logs Trigger */}
      <Header
        isDarkMode={theme === 'dark'}
        onToggleTheme={toggleTheme}
        onOpenLogsModal={() => setIsLogsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        
        {/* Intro Banner */}
        <section className="space-y-1.5 pt-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Resume Information Extraction
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Upload candidate PDF resumes to extract structured profiles including contact information,
            skills, work history, education, certifications, and summary. You can also supply a target Job
            Description for automated skill gap analysis. Missing details are preserved as{' '}
            <code className="px-1.5 py-0.5 rounded text-xs bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              null
            </code>.
          </p>
        </section>

        {/* Upload & JD Zone */}
        <section>
          <FileUpload
            files={files}
            onFilesChange={setFiles}
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            globalError={globalError}
            onClearGlobalError={() => setGlobalError(null)}
          />
        </section>

        {/* Structured Results Display */}
        {analysisResults && analysisResults.length > 0 && (
          <section className="pt-2">
            <ResumeViewer
              results={analysisResults}
              onOpenJsonModal={handleOpenJsonModal}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-100/70 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 mt-auto transition-colors relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <p>Resume Analyzer — Fullstack Technical Application</p>
          <p className="text-slate-400 dark:text-slate-500">Python · React · Docker</p>
        </div>
      </footer>

      {/* JSON Viewer Modal */}
      <JsonModal
        isOpen={jsonModalState.isOpen}
        onClose={() => setJsonModalState({ isOpen: false, data: null, filename: '' })}
        data={jsonModalState.data}
        filename={jsonModalState.filename}
      />

      {/* Centralized Operation Logs Modal */}
      <LogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </div>
  );
}

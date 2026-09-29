import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ResumeViewer from './components/ResumeViewer';
import JsonModal from './components/JsonModal';
import { analyzeResumes } from './services/api';

export default function App() {
  const [files, setFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [jsonModalState, setJsonModalState] = useState({ isOpen: false, data: null, filename: '' });

  const handleAnalyze = async () => {
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    setGlobalError(null);

    try {
      const response = await analyzeResumes(files);
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar with Logo */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Intro Banner */}
        <section className="space-y-1.5 pt-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Resume Information Extraction
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Upload candidate PDF resumes to extract structured profiles including contact information,
            skills, work history, education, certifications, and summary. Missing details are preserved as{' '}
            <code className="px-1.5 py-0.5 rounded text-xs bg-slate-200/80 text-slate-700 font-mono">null</code>.
          </p>
        </section>

        {/* Upload Zone */}
        <section>
          <FileUpload
            files={files}
            onFilesChange={setFiles}
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
      <footer className="border-t border-blue-100/70 bg-white py-5 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>Resume Analyzer — Fullstack Technical Application</p>
          <p className="text-slate-400">Python · React · Docker</p>
        </div>
      </footer>

      {/* JSON Viewer Modal */}
      <JsonModal
        isOpen={jsonModalState.isOpen}
        onClose={() => setJsonModalState({ isOpen: false, data: null, filename: '' })}
        data={jsonModalState.data}
        filename={jsonModalState.filename}
      />
    </div>
  );
}

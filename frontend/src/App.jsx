import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ResumeViewer from './components/ResumeViewer';
import ApiKeyModal from './components/ApiKeyModal';
import JsonModal from './components/JsonModal';
import { getHealthStatus, analyzeResumes } from './services/api';
import { ShieldCheck, Cpu, Layers, Cloud, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [health, setHealth] = useState({ groq_api_key_configured: false, groq_model: 'llama-3.3-70b-versatile' });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [jsonModalState, setJsonModalState] = useState({ isOpen: false, data: null, filename: '' });

  // Load server status & Groq API key configuration
  const refreshHealth = async () => {
    try {
      const data = await getHealthStatus();
      setHealth(data);
    } catch (err) {
      console.error('Failed to load health status:', err);
    }
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  const handleAnalyze = async () => {
    if (!files || files.length === 0) return;

    if (!health.groq_api_key_configured) {
      setGlobalError(
        'Groq API Key is not configured yet. Please click "API Key Needed" in the top bar or set GROQ_API_KEY in backend/.env.'
      );
      setIsKeyModalOpen(true);
      return;
    }

    setIsAnalyzing(true);
    setGlobalError(null);

    try {
      const response = await analyzeResumes(files);
      setAnalysisResults(response.results);
    } catch (err) {
      console.error('Analysis failed:', err);
      setGlobalError(
        err.message || 'An unexpected error occurred while communicating with the analysis server.'
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        isKeyConfigured={health.groq_api_key_configured}
        modelName={health.groq_model}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <section className="text-center space-y-3 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Driven Candidate Profile Extraction</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Analyze Resumes with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Zero Hallucinations
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Upload multiple PDF resumes to instantly extract candidate contact information, skills,
            education, work history, and summary in verified structured JSON format. Missing data is
            faithfully preserved as <code className="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded text-xs border border-slate-800">null</code>.
          </p>
        </section>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center space-y-1">
            <div className="w-7 h-7 mx-auto rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-slate-200">Multi-File PDF</p>
            <p className="text-[11px] text-slate-400">Batch processing ready</p>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center space-y-1">
            <div className="w-7 h-7 mx-auto rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-slate-200">Zero False Data</p>
            <p className="text-[11px] text-slate-400">Strict factual extraction</p>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center space-y-1">
            <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">
              <Cpu className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-slate-200">Groq LLM Speed</p>
            <p className="text-[11px] text-slate-400">Sub-second inference</p>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center space-y-1">
            <div className="w-7 h-7 mx-auto rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center text-xs">
              <Cloud className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-slate-200">EC2 & Docker</p>
            <p className="text-[11px] text-slate-400">Cloud containerized</p>
          </div>
        </div>

        {/* Upload & File Selection Area */}
        <div className="max-w-4xl mx-auto">
          <FileUpload
            files={files}
            onFilesChange={setFiles}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            globalError={globalError}
            onClearGlobalError={() => setGlobalError(null)}
          />
        </div>

        {/* Analysis Results Display */}
        {analysisResults && analysisResults.length > 0 && (
          <section className="max-w-5xl mx-auto pt-4">
            <ResumeViewer
              results={analysisResults}
              onOpenJsonModal={handleOpenJsonModal}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 ResumeLens AI • Built with Python, React, Groq, Docker & AWS EC2</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Production Ready</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        isKeyConfigured={health.groq_api_key_configured}
        onKeyUpdated={refreshHealth}
      />

      <JsonModal
        isOpen={jsonModalState.isOpen}
        onClose={() => setJsonModalState({ isOpen: false, data: null, filename: '' })}
        data={jsonModalState.data}
        filename={jsonModalState.filename}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Key, X, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { setApiKey } from '../services/api';

export default function ApiKeyModal({ isOpen, onClose, isKeyConfigured, onKeyUpdated }) {
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setError('Please enter a valid Groq API key.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await setApiKey(keyInput.trim());
      setMessage('Groq API Key saved successfully!');
      if (onKeyUpdated) onKeyUpdated();
      setTimeout(() => {
        onClose();
        setMessage(null);
        setKeyInput('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Groq API Key</h3>
              <p className="text-xs text-slate-400">Configure or update your AI credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-300 space-y-2">
          <p>
            Current Status:{' '}
            <span
              className={`font-semibold ${
                isKeyConfigured ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isKeyConfigured ? 'Active & Configured' : 'Missing / Not set'}
            </span>
          </p>
          <p className="text-slate-400 leading-relaxed">
            You can obtain a free API key instantly from the{' '}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline inline-flex items-center"
            >
              Groq Console <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            . It can also be added directly to the <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">backend/.env</code> file.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center space-x-2">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Enter GROQ API Key (starts with gsk_...)
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !keyInput.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Key</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Download,
  Copy,
  Check,
  Code,
  AlertCircle,
  Calendar,
  Building,
  CheckCircle2,
  Target,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export default function ResumeViewer({ results, onOpenJsonModal }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedItem, setCopiedItem] = useState(null);

  if (!results || results.length === 0) return null;

  const currentResult = results[selectedIndex] || results[0];
  const { filename, status, error_message, character_count, data, job_match } = currentResult;

  const handleCopy = (text, identifier) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedItem(identifier);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleDownloadSingleJson = () => {
    const exportData = {
      ...(data || {}),
      ...(job_match ? { job_match } : {}),
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.pdf$/i, '')}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderNullBadge = (label = 'null') => (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
      {label}
    </span>
  );

  const getScoreBadgeStyles = (score) => {
    if (score >= 75) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-800/70',
        text: 'text-emerald-700 dark:text-emerald-300',
        bar: 'bg-emerald-500 dark:bg-emerald-400',
        label: 'Strong Fit',
      };
    }
    if (score >= 50) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800/70',
        text: 'text-amber-700 dark:text-amber-300',
        bar: 'bg-amber-500 dark:bg-amber-400',
        label: 'Moderate Fit',
      };
    }
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800/70',
      text: 'text-rose-700 dark:text-rose-300',
      bar: 'bg-rose-500 dark:bg-rose-400',
      label: 'Low Match',
    };
  };

  return (
    <div className="w-full space-y-5">
      {/* File Selector Tabs (for Multi-File uploads) */}
      {results.length > 1 && (
        <div className="bg-white dark:bg-slate-900 border border-blue-100/80 dark:border-slate-800 rounded-2xl p-2.5 shadow-[0_2px_12px_rgba(37,99,235,0.03)] transition-colors">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
            Uploaded Resumes ({results.length})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isSuccess = item.status === 'success';
              const displayName = item.data?.full_name || item.filename;

              return (
                <button
                  key={`${item.filename}-${idx}`}
                  onClick={() => setSelectedIndex(idx)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-blue-50/50 dark:hover:bg-slate-750'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSuccess ? (isSelected ? 'bg-white' : 'bg-emerald-500') : 'bg-rose-500'
                    }`}
                  />
                  <span className="max-w-[140px] truncate">{displayName}</span>
                  {item.job_match?.match_score != null && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-500/40 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                      {item.job_match.match_score}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Analysis Card */}
      <div className="bg-white dark:bg-slate-900 border border-blue-100/80 dark:border-slate-800 rounded-2xl shadow-[0_2px_16px_rgba(37,99,235,0.04)] overflow-hidden transition-colors">
        
        {/* Meta Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white dark:from-slate-850 dark:via-slate-850/80 dark:to-slate-900 border-b border-blue-100/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {filename}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    status === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60'
                  }`}
                >
                  {status === 'success' ? 'Completed' : 'Error'}
                </span>
              </div>
              {character_count && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {character_count.toLocaleString()} characters extracted from document
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {status === 'success' && data && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenJsonModal({ ...(data || {}), ...(job_match ? { job_match } : {}) }, filename)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
                title="View JSON format"
              >
                <Code className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>JSON View</span>
              </button>
              <button
                onClick={handleDownloadSingleJson}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
                title="Download JSON file"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Failure Message */}
        {status === 'error' && (
          <div className="p-8 text-center space-y-3 max-w-lg mx-auto my-4">
            <div className="w-11 h-11 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">Processing Failed</h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-2 bg-rose-50/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-3.5 rounded-xl font-mono text-left leading-relaxed">
                {error_message || 'An error occurred while processing this document.'}
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please verify that the PDF is text-readable and not password-protected, then try again.
            </p>
          </div>
        )}

        {/* Structured Results Display */}
        {status === 'success' && data && (
          <div className="p-6 space-y-6">
            
            {/* 1. Candidate Full Name & Contact Details */}
            <div className="p-6 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50/50 dark:from-slate-800/80 dark:via-slate-850 dark:to-slate-900 rounded-2xl border border-blue-100/90 dark:border-slate-800 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[11px] font-semibold text-blue-900/70 dark:text-blue-300 uppercase tracking-wider">
                      Candidate Profile
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {data.full_name ? data.full_name : renderNullBadge('null')}
                  </h3>
                </div>

                {/* Contact items */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {/* Email */}
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs">
                    <Mail className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span className="text-slate-500 dark:text-slate-400">Email:</span>
                    {data.email ? (
                      <div className="flex items-center space-x-1">
                        <a
                          href={`mailto:${data.email}`}
                          className="text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium"
                        >
                          {data.email}
                        </a>
                        <button
                          onClick={() => handleCopy(data.email, 'email')}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
                          title="Copy email"
                        >
                          {copiedItem === 'email' ? (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      renderNullBadge('null')
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs">
                    <Phone className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                    {data.phone ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{data.phone}</span>
                        <button
                          onClick={() => handleCopy(data.phone, 'phone')}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
                          title="Copy phone"
                        >
                          {copiedItem === 'phone' ? (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      renderNullBadge('null')
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span className="text-slate-500 dark:text-slate-400">Location:</span>
                    {data.location ? (
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{data.location}</span>
                    ) : (
                      renderNullBadge('null')
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Job Description Match Card (Rendered if job_match exists) */}
            {job_match && (
              <div className="p-6 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50/50 dark:from-slate-850 dark:via-slate-800/80 dark:to-slate-900 rounded-2xl border border-indigo-200/80 dark:border-slate-750 shadow-xs space-y-5 transition-colors">
                
                {/* Section Header & Score Gauge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                        Job Description Fit Analysis
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Comparative alignment between candidate profile and target JD requirements
                      </p>
                    </div>
                  </div>

                  {/* Match Score Display */}
                  {job_match.match_score != null && (
                    (() => {
                      const scoreStyle = getScoreBadgeStyles(job_match.match_score);
                      return (
                        <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <div className="text-right">
                            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                              Match Score
                            </p>
                            <p className={`text-xs font-bold ${scoreStyle.text}`}>
                              {scoreStyle.label}
                            </p>
                          </div>
                          <div className={`px-2.5 py-1 rounded-xl text-lg font-black border ${scoreStyle.bg} ${scoreStyle.border} ${scoreStyle.text}`}>
                            {job_match.match_score}%
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* Score Progress Bar */}
                {job_match.match_score != null && (
                  <div className="w-full bg-slate-200/70 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getScoreBadgeStyles(job_match.match_score).bar}`}
                      style={{ width: `${Math.min(100, Math.max(0, job_match.match_score))}%` }}
                    />
                  </div>
                )}

                {/* Fit Assessment Summary */}
                {job_match.summary && (
                  <div className="p-3.5 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-indigo-100/70 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-indigo-900 dark:text-indigo-300 mr-1.5">Assessment:</span>
                    {job_match.summary}
                  </div>
                )}

                {/* Side-by-Side: Matching Skills vs. Skill Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matching Skills */}
                  <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/70 dark:border-emerald-800/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Matching Skills ({job_match.matching_skills?.length || 0})</span>
                      </div>
                    </div>
                    {Array.isArray(job_match.matching_skills) && job_match.matching_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {job_match.matching_skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700/60 text-[11px] font-medium"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No direct matching skills identified</p>
                    )}
                  </div>

                  {/* Missing Skills / Gaps */}
                  <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-200/70 dark:border-amber-800/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-amber-800 dark:text-amber-300 font-semibold text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Skill Gaps / Missing ({job_match.missing_skills?.length || 0})</span>
                      </div>
                    </div>
                    {Array.isArray(job_match.missing_skills) && job_match.missing_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {job_match.missing_skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-lg bg-amber-100/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700/60 text-[11px] font-medium"
                          >
                            • {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">No notable skill gaps detected!</p>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {Array.isArray(job_match.recommendations) && job_match.recommendations.length > 0 && (
                  <div className="p-4 bg-white/90 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Actionable Recommendations to Bridge Gaps</span>
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-outside pl-4">
                      {job_match.recommendations.map((rec, rIdx) => (
                        <li key={rIdx} className="leading-relaxed">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 3. Professional Summary */}
            <div className="p-5 bg-slate-50/50 dark:bg-slate-850/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-blue-600 dark:border-l-blue-500 space-y-1.5 transition-colors">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Professional Summary
              </h4>
              {data.professional_summary ? (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                  {data.professional_summary}
                </p>
              ) : (
                <div>{renderNullBadge('null')}</div>
              )}
            </div>

            {/* 4. Skills */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Skills & Competencies
                  </h4>
                  {Array.isArray(data.skills) && data.skills.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                      {data.skills.length}
                    </span>
                  )}
                </div>

                {Array.isArray(data.skills) && data.skills.length > 0 && (
                  <button
                    onClick={() => handleCopy(data.skills.join(', '), 'skills')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1 font-medium"
                  >
                    {copiedItem === 'skills' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {Array.isArray(data.skills) && data.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {data.skills.map((skill, sIdx) => (
                    <span
                      key={`${skill}-${sIdx}`}
                      className="px-3 py-1 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200/70 dark:border-blue-800/70 text-xs font-medium transition-colors"
                    >
                      {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                    </span>
                  ))}
                </div>
              ) : typeof data.skills === 'string' && data.skills.trim() ? (
                <p className="text-xs text-slate-800 dark:text-slate-200">{data.skills}</p>
              ) : (
                <div>{renderNullBadge('null')}</div>
              )}
            </div>

            {/* 5. Work Experience */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Work Experience
                </h4>
                {Array.isArray(data.work_experience) && data.work_experience.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                    {data.work_experience.length}
                  </span>
                )}
              </div>

              {Array.isArray(data.work_experience) && data.work_experience.length > 0 ? (
                <div className="space-y-3.5">
                  {data.work_experience.map((exp, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-850/60 hover:bg-blue-50/20 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {exp.job_title ? exp.job_title : renderNullBadge('null (Job Title)')}
                          </p>
                          <div className="flex items-center space-x-1.5 text-blue-700 dark:text-blue-400 font-medium mt-0.5">
                            <Building className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                            <span>{exp.company ? exp.company : renderNullBadge('null (Company)')}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 w-fit">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{exp.start_date || 'null'} — {exp.end_date || 'null'}</span>
                        </div>
                      </div>

                      {/* Responsibilities */}
                      {Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0 ? (
                        <ul className="mt-2.5 space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-outside pl-4">
                          {exp.responsibilities.map((resp, rIdx) => (
                            <li key={rIdx} className="leading-relaxed">
                              {typeof resp === 'string' ? resp : JSON.stringify(resp)}
                            </li>
                          ))}
                        </ul>
                      ) : typeof exp.responsibilities === 'string' && exp.responsibilities.trim() ? (
                        <p className="mt-2 text-slate-600 dark:text-slate-300 pl-4">{exp.responsibilities}</p>
                      ) : (
                        <div className="pt-1 text-slate-400 dark:text-slate-500">
                          Responsibilities: {renderNullBadge('null')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div>{renderNullBadge('null')}</div>
              )}
            </div>

            {/* 6. Education & Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Education */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Education
                  </h4>
                </div>

                {Array.isArray(data.education) && data.education.length > 0 ? (
                  <div className="space-y-2.5">
                    {data.education.map((edu, edIdx) => (
                      <div
                        key={edIdx}
                        className="p-3 rounded-xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-100/80 dark:border-purple-900/50 text-xs space-y-0.5"
                      >
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {edu && typeof edu === 'object' && edu.degree
                            ? edu.degree
                            : typeof edu === 'string'
                            ? edu
                            : renderNullBadge('null')}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          {edu && typeof edu === 'object' && edu.institution
                            ? edu.institution
                            : renderNullBadge('null')}
                        </p>
                        <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                          Graduation Year:{' '}
                          {edu && typeof edu === 'object' && edu.graduation_year ? (
                            <span>{edu.graduation_year}</span>
                          ) : (
                            renderNullBadge('null')
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>{renderNullBadge('null')}</div>
                )}
              </div>

              {/* Certifications */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Certifications
                  </h4>
                </div>

                {Array.isArray(data.certifications) && data.certifications.length > 0 ? (
                  <div className="space-y-2">
                    {data.certifications.map((cert, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center space-x-2 p-2.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/60 text-xs text-teal-950 dark:text-teal-200 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                        <span>{typeof cert === 'string' ? cert : JSON.stringify(cert)}</span>
                      </div>
                    ))}
                  </div>
                ) : typeof data.certifications === 'string' && data.certifications.trim() ? (
                  <p className="text-xs text-slate-800 dark:text-slate-200">{data.certifications}</p>
                ) : (
                  <div>{renderNullBadge('null')}</div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}

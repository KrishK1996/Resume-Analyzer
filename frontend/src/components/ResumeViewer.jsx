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
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#6668F6]/8 text-[#6668F6]/60 border border-[#6668F6]/20">
      {label}
    </span>
  );

  const getScoreBadgeStyles = (score) => {
    if (score >= 75) {
      return {
        bg: 'bg-[#66F6AC]/10 dark:bg-[#66F6AC]/8',
        border: 'border-[#66F6AC]/30 dark:border-[#66F6AC]/25',
        text: 'text-[#66F6AC]',
        bar: 'bg-[#66F6AC]',
        label: 'Strong Fit',
      };
    }
    if (score >= 50) {
      return {
        bg: 'bg-[#F6F466]/10 dark:bg-[#F6F466]/8',
        border: 'border-[#F6F466]/30 dark:border-[#F6F466]/25',
        text: 'text-[#F6F466]',
        bar: 'bg-[#F6F466]',
        label: 'Moderate Fit',
      };
    }
    return {
      bg: 'bg-[#F666B0]/10 dark:bg-[#F666B0]/8',
      border: 'border-[#F666B0]/30 dark:border-[#F666B0]/25',
      text: 'text-[#F666B0]',
      bar: 'bg-[#F666B0]',
      label: 'Low Match',
    };
  };

  return (
    <div className="w-full space-y-5">
      {/* File Selector Tabs (for Multi-File uploads) */}
      {results.length > 1 && (
        <div className="bg-white dark:bg-[#0d0d1e] border border-[#6668F6]/15 dark:border-[#6668F6]/20 rounded-2xl p-2.5 shadow-[0_2px_20px_rgba(102,104,246,0.07)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.15)] transition-all duration-300">
          <p className="text-[11px] font-semibold text-[#0f0f1e]/45 dark:text-[#f0f0ff]/35 uppercase tracking-wider mb-2 px-1">
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
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300 border ${
                    isSelected
                      ? 'bg-[#6668F6] border-[#6668F6] text-white shadow-[0_2px_12px_rgba(102,104,246,0.35)]'
                      : 'bg-[#fafafe] dark:bg-[#0a0a12] border-[#6668F6]/15 dark:border-[#6668F6]/20 text-[#0f0f1e]/65 dark:text-[#f0f0ff]/55 hover:bg-[#6668F6]/8 dark:hover:bg-[#6668F6]/10'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSuccess ? (isSelected ? 'bg-white' : 'bg-[#66F6AC]') : 'bg-[#F666B0]'
                    }`}
                  />
                  <span className="max-w-[140px] truncate">{displayName}</span>
                  {item.job_match?.match_score != null && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#6668F6]/10 dark:bg-[#6668F6]/12 text-[#6668F6]'}`}>
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
      <div className="bg-white dark:bg-[#0d0d1e] border border-[#6668F6]/15 dark:border-[#6668F6]/20 rounded-2xl shadow-[0_2px_20px_rgba(102,104,246,0.07)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.15)] overflow-hidden transition-all duration-300">
        
        {/* Meta Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#6668F6]/5 via-[#F666B0]/3 to-transparent dark:from-[#6668F6]/8 dark:via-[#F666B0]/4 dark:to-transparent border-b border-[#6668F6]/12 dark:border-[#6668F6]/18 flex flex-wrap items-center justify-between gap-3 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white dark:bg-[#0a0a12] border border-[#6668F6]/20 dark:border-[#6668F6]/25 text-[#6668F6] shadow-[0_2px_8px_rgba(102,104,246,0.12)]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-[#0f0f1e] dark:text-[#f0f0ff] truncate max-w-xs sm:max-w-md">
                  {filename}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    status === 'success'
                      ? 'bg-[#66F6AC]/10 text-[#66F6AC] border border-[#66F6AC]/30'
                      : 'bg-[#F666B0]/10 text-[#F666B0] border border-[#F666B0]/30'
                  }`}
                >
                  {status === 'success' ? 'Completed' : 'Error'}
                </span>
              </div>
              {character_count && (
                <p className="text-[11px] text-[#0f0f1e]/45 dark:text-[#f0f0ff]/35">
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
                className="px-3 py-1.5 rounded-xl border border-[#6668F6]/20 dark:border-[#6668F6]/25 bg-white dark:bg-[#0a0a12] hover:bg-[#6668F6]/8 dark:hover:bg-[#6668F6]/10 text-[#0f0f1e]/70 dark:text-[#f0f0ff]/70 text-xs font-medium flex items-center space-x-1.5 transition-all duration-300 shadow-[0_1px_6px_rgba(102,104,246,0.08)]"
                title="View JSON format"
              >
                <Code className="w-3.5 h-3.5 text-[#6668F6]" />
                <span>JSON View</span>
              </button>
              <button
                onClick={handleDownloadSingleJson}
                className="px-3 py-1.5 rounded-xl border border-[#6668F6]/20 dark:border-[#6668F6]/25 bg-white dark:bg-[#0a0a12] hover:bg-[#6668F6]/8 dark:hover:bg-[#6668F6]/10 text-[#0f0f1e]/70 dark:text-[#f0f0ff]/70 text-xs font-medium flex items-center space-x-1.5 transition-all duration-300 shadow-[0_1px_6px_rgba(102,104,246,0.08)]"
                title="Download JSON file"
              >
                <Download className="w-3.5 h-3.5 text-[#6668F6]" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Failure Message */}
        {status === 'error' && (
          <div className="p-8 text-center space-y-3 max-w-lg mx-auto my-4">
            <div className="w-11 h-11 mx-auto rounded-2xl bg-[#F666B0]/10 border border-[#F666B0]/30 flex items-center justify-center text-[#F666B0] shadow-[0_2px_12px_rgba(246,102,176,0.15)]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F666B0]">Processing Failed</h3>
              <p className="text-xs text-[#F666B0]/80 mt-2 bg-[#F666B0]/8 border border-[#F666B0]/25 p-3.5 rounded-xl font-mono text-left leading-relaxed">
                {error_message || 'An error occurred while processing this document.'}
              </p>
            </div>
            <p className="text-xs text-[#0f0f1e]/45 dark:text-[#f0f0ff]/35">
              Please verify that the PDF is text-readable and not password-protected, then try again.
            </p>
          </div>
        )}

        {/* Structured Results Display */}
        {status === 'success' && data && (
          <div className="p-6 space-y-6">
            
            {/* 1. Candidate Full Name & Contact Details */}
            <div className="p-6 bg-gradient-to-br from-[#6668F6]/6 via-[#F666B0]/3 to-transparent dark:from-[#6668F6]/10 dark:via-[#F666B0]/5 dark:to-transparent rounded-2xl border border-[#6668F6]/15 dark:border-[#6668F6]/20 shadow-[0_2px_20px_rgba(102,104,246,0.07)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.15)] transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <User className="w-4 h-4 text-[#6668F6]" />
                    <span className="text-[11px] font-semibold text-[#6668F6]/70 uppercase tracking-wider">
                      Candidate Profile
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0f0f1e] dark:text-[#f0f0ff] mt-1">
                    {data.full_name ? data.full_name : renderNullBadge('null')}
                  </h3>
                </div>

                {/* Contact items */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {/* Email */}
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0a0a12] border border-[#6668F6]/15 dark:border-[#6668F6]/20 text-[#0f0f1e]/70 dark:text-[#f0f0ff]/60 shadow-[0_1px_6px_rgba(102,104,246,0.06)]">
                    <Mail className="w-3.5 h-3.5 text-[#6668F6]" />
                    <span className="text-[#0f0f1e]/45 dark:text-[#f0f0ff]/35">Email:</span>
                    {data.email ? (
                      <div className="flex items-center space-x-1">
                        <a
                          href={`mailto:${data.email}`}
                          className="text-[#0f0f1e] dark:text-[#f0f0ff] hover:text-[#6668F6] dark:hover:text-[#6668F6] hover:underline font-medium transition-all duration-300"
                        >
                          {data.email}
                        </a>
                        <button
                          onClick={() => handleCopy(data.email, 'email')}
                          className="text-[#0f0f1e]/30 dark:text-[#f0f0ff]/25 hover:text-[#6668F6] dark:hover:text-[#6668F6] ml-1 transition-all duration-300"
                          title="Copy email"
                        >
                          {copiedItem === 'email' ? (
                            <Check className="w-3 h-3 text-[#66F6AC]" />
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
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0a0a12] border border-[#6668F6]/15 dark:border-[#6668F6]/20 text-[#0f0f1e]/70 dark:text-[#f0f0ff]/60 shadow-[0_1px_6px_rgba(102,104,246,0.06)]">
                    <Phone className="w-3.5 h-3.5 text-[#6668F6]" />
                    <span className="text-[#0f0f1e]/45 dark:text-[#f0f0ff]/35">Phone:</span>
                    {data.phone ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-[#0f0f1e] dark:text-[#f0f0ff] font-medium">{data.phone}</span>
                        <button
                          onClick={() => handleCopy(data.phone, 'phone')}
                          className="text-[#0f0f1e]/30 dark:text-[#f0f0ff]/25 hover:text-[#6668F6] dark:hover:text-[#6668F6] ml-1 transition-all duration-300"
                          title="Copy phone"
                        >
                          {copiedItem === 'phone' ? (
                            <Check className="w-3 h-3 text-[#66F6AC]" />
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
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0a0a12] border border-[#6668F6]/15 dark:border-[#6668F6]/20 text-[#0f0f1e]/70 dark:text-[#f0f0ff]/60 shadow-[0_1px_6px_rgba(102,104,246,0.06)]">
                    <MapPin className="w-3.5 h-3.5 text-[#6668F6]" />
                    <span className="text-[#0f0f1e]/45 dark:text-[#f0f0ff]/35">Location:</span>
                    {data.location ? (
                      <span className="text-[#0f0f1e] dark:text-[#f0f0ff] font-medium">{data.location}</span>
                    ) : (
                      renderNullBadge('null')
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Job Description Match Card (Rendered if job_match exists) */}
            {job_match && (
              <div className="p-6 bg-gradient-to-br from-[#6668F6]/6 via-[#66F6AC]/3 to-transparent dark:from-[#6668F6]/10 dark:via-[#66F6AC]/4 dark:to-transparent rounded-2xl border border-[#6668F6]/20 dark:border-[#6668F6]/25 shadow-[0_2px_20px_rgba(102,104,246,0.08)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.18)] space-y-5 transition-all duration-300">
                
                {/* Section Header & Score Gauge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#6668F6]/12 dark:border-[#6668F6]/18">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#6668F6] to-[#F666B0] text-white shadow-[0_2px_12px_rgba(102,104,246,0.35)]">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#6668F6]">
                        Job Description Fit Analysis
                      </h4>
                      <p className="text-[11px] text-[#0f0f1e]/45 dark:text-[#f0f0ff]/35">
                        Comparative alignment between candidate profile and target JD requirements
                      </p>
                    </div>
                  </div>

                  {/* Match Score Display */}
                  {job_match.match_score != null && (
                    (() => {
                      const scoreStyle = getScoreBadgeStyles(job_match.match_score);
                      return (
                        <div className="flex items-center space-x-3 bg-white dark:bg-[#0a0a12] px-4 py-2 rounded-xl border border-[#6668F6]/15 dark:border-[#6668F6]/20 shadow-[0_1px_8px_rgba(102,104,246,0.08)]">
                          <div className="text-right">
                            <p className="text-[10px] uppercase font-semibold text-[#0f0f1e]/40 dark:text-[#f0f0ff]/30 tracking-wider">
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
                  <div className="w-full bg-[#6668F6]/10 dark:bg-[#6668F6]/12 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getScoreBadgeStyles(job_match.match_score).bar}`}
                      style={{ width: `${Math.min(100, Math.max(0, job_match.match_score))}%` }}
                    />
                  </div>
                )}

                {/* Fit Assessment Summary */}
                {job_match.summary && (
                  <div className="p-3.5 bg-white/80 dark:bg-[#0a0a12]/80 rounded-xl border border-[#6668F6]/15 dark:border-[#6668F6]/20 text-xs text-[#0f0f1e]/70 dark:text-[#f0f0ff]/60 leading-relaxed">
                    <span className="font-semibold text-[#6668F6] mr-1.5">Assessment:</span>
                    {job_match.summary}
                  </div>
                )}

                {/* Side-by-Side: Matching Skills vs. Skill Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matching Skills */}
                  <div className="p-4 bg-[#66F6AC]/8 dark:bg-[#66F6AC]/6 rounded-xl border border-[#66F6AC]/25 dark:border-[#66F6AC]/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-[#66F6AC] font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Matching Skills ({job_match.matching_skills?.length || 0})</span>
                      </div>
                    </div>
                    {Array.isArray(job_match.matching_skills) && job_match.matching_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {job_match.matching_skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-lg bg-[#66F6AC]/15 dark:bg-[#66F6AC]/10 text-[#66F6AC] border border-[#66F6AC]/30 dark:border-[#66F6AC]/20 text-[11px] font-medium"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#0f0f1e]/40 dark:text-[#f0f0ff]/30 italic">No direct matching skills identified</p>
                    )}
                  </div>

                  {/* Missing Skills / Gaps */}
                  <div className="p-4 bg-[#F6F466]/8 dark:bg-[#F6F466]/6 rounded-xl border border-[#F6F466]/25 dark:border-[#F6F466]/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-[#F6F466] font-semibold text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Skill Gaps / Missing ({job_match.missing_skills?.length || 0})</span>
                      </div>
                    </div>
                    {Array.isArray(job_match.missing_skills) && job_match.missing_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {job_match.missing_skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-lg bg-[#F6F466]/15 dark:bg-[#F6F466]/10 text-[#F6F466] border border-[#F6F466]/30 dark:border-[#F6F466]/20 text-[11px] font-medium"
                          >
                            • {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#66F6AC] font-medium">No notable skill gaps detected!</p>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {Array.isArray(job_match.recommendations) && job_match.recommendations.length > 0 && (
                  <div className="p-4 bg-white/90 dark:bg-[#0a0a12]/90 rounded-xl border border-[#6668F6]/15 dark:border-[#6668F6]/20 space-y-2">
                    <div className="flex items-center space-x-1.5 text-[#0f0f1e] dark:text-[#f0f0ff] text-xs font-semibold">
                      <Lightbulb className="w-3.5 h-3.5 text-[#F6F466]" />
                      <span>Actionable Recommendations to Bridge Gaps</span>
                    </div>
                    <ul className="text-xs text-[#0f0f1e]/65 dark:text-[#f0f0ff]/55 space-y-1.5 list-disc list-outside pl-4">
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
            <div className="p-5 bg-[#fafafe] dark:bg-[#0a0a12] rounded-2xl border border-[#6668F6]/12 dark:border-[#6668F6]/18 border-l-4 border-l-[#6668F6] space-y-1.5 shadow-[0_2px_20px_rgba(102,104,246,0.07)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.15)] transition-all duration-300">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0f0f1e]/60 dark:text-[#f0f0ff]/50">
                Professional Summary
              </h4>
              {data.professional_summary ? (
                <p className="text-xs sm:text-sm text-[#0f0f1e]/75 dark:text-[#f0f0ff]/65 leading-relaxed pt-0.5">
                  {data.professional_summary}
                </p>
              ) : (
                <div>{renderNullBadge('null')}</div>
              )}
            </div>

            {/* 4. Skills */}
            <div className="p-5 bg-white dark:bg-[#0d0d1e] rounded-2xl border border-[#6668F6]/12 dark:border-[#6668F6]/18 shadow-[0_2px_20px_rgba(102,104,246,0.07)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.15)] space-y-3 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0f0f1e]/60 dark:text-[#f0f0ff]/50">
                    Skills &amp; Competencies
                  </h4>
                  {Array.isArray(data.skills) && data.skills.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#6668F6]/10 text-[#6668F6] border border-[#6668F6]/20">
                      {data.skills.length}
                    </span>
                  )}
                </div>

                {Array.isArray(data.skills) && data.skills.length > 0 && (
                  <button
                    onClick={() => handleCopy(data.skills.join(', '), 'skills')}
                    className="text-xs text-[#6668F6] hover:text-[#6668F6]/70 flex items-center space-x-1 font-medium transition-all duration-300"
                  >
                    {copiedItem === 'skills' ? (
                      <>
                        <Check className="w-3 h-3 text-[#66F6AC]" />
                        <span className="text-[#66F6AC]">Copied</span>
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
                      className="px-3 py-1 rounded-xl bg-[#6668F6]/8 hover:bg-[#6668F6]/14 text-[#6668F6] border border-[#6668F6]/20 text-xs font-medium transition-all duration-300"
                    >
                      {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                    </span>
                  ))}
                </div>
              ) : typeof data.skills === 'string' && data.skills.trim() ? (
                <p className="text-xs text-[#0f0f1e] dark:text-[#f0f0ff]">{data.skills}</p>
              ) : (
                <div>{renderNullBadge('null')}</div>
              )}
            </div>

            {/* 5. Work Experience */}
            <div className="p-5 bg-white dark:bg-[#0d0d1e] rounded-2xl border border-[#6668F6]/12 dark:border-[#6668F6]/18 shadow-[0_2px_20px_rgba(102,104,246,0.07)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.15)] space-y-4 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-[#6668F6]" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0f0f1e]/60 dark:text-[#f0f0ff]/50">
                  Work Experience
                </h4>
                {Array.isArray(data.work_experience) && data.work_experience.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#6668F6]/10 text-[#6668F6] border border-[#6668F6]/20">
                    {data.work_experience.length}
                  </span>
                )}
              </div>

              {Array.isArray(data.work_experience) && data.work_experience.length > 0 ? (
                <div className="space-y-3.5">
                  {data.work_experience.map((exp, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-4 rounded-xl bg-[#fafafe] dark:bg-[#0a0a12] hover:bg-[#6668F6]/5 dark:hover:bg-[#6668F6]/8 border border-[#6668F6]/10 dark:border-[#6668F6]/15 space-y-2 text-xs transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <p className="font-semibold text-[#0f0f1e] dark:text-[#f0f0ff] text-sm">
                            {exp.job_title ? exp.job_title : renderNullBadge('null (Job Title)')}
                          </p>
                          <div className="flex items-center space-x-1.5 text-[#6668F6] font-medium mt-0.5">
                            <Building className="w-3.5 h-3.5" />
                            <span>{exp.company ? exp.company : renderNullBadge('null (Company)')}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[11px] text-[#0f0f1e]/45 dark:text-[#f0f0ff]/35 bg-white dark:bg-[#0d0d1e] px-2.5 py-1 rounded-lg border border-[#6668F6]/12 dark:border-[#6668F6]/18 w-fit">
                          <Calendar className="w-3 h-3 text-[#6668F6]/50" />
                          <span>{exp.start_date || 'null'} — {exp.end_date || 'null'}</span>
                        </div>
                      </div>

                      {/* Responsibilities */}
                      {Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0 ? (
                        <ul className="mt-2.5 space-y-1.5 text-[#0f0f1e]/60 dark:text-[#f0f0ff]/50 list-disc list-outside pl-4">
                          {exp.responsibilities.map((resp, rIdx) => (
                            <li key={rIdx} className="leading-relaxed">
                              {typeof resp === 'string' ? resp : JSON.stringify(resp)}
                            </li>
                          ))}
                        </ul>
                      ) : typeof exp.responsibilities === 'string' && exp.responsibilities.trim() ? (
                        <p className="mt-2 text-[#0f0f1e]/60 dark:text-[#f0f0ff]/50 pl-4">{exp.responsibilities}</p>
                      ) : (
                        <div className="pt-1 text-[#0f0f1e]/35 dark:text-[#f0f0ff]/25">
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
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0d0d1e] border border-[#6668F6]/12 dark:border-[#6668F6]/18 shadow-[0_2px_20px_rgba(102,104,246,0.07)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.15)] space-y-3 transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-[#6668F6]" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0f0f1e]/60 dark:text-[#f0f0ff]/50">
                    Education
                  </h4>
                </div>

                {Array.isArray(data.education) && data.education.length > 0 ? (
                  <div className="space-y-2.5">
                    {data.education.map((edu, edIdx) => (
                      <div
                        key={edIdx}
                        className="p-3 rounded-xl bg-[#6668F6]/5 dark:bg-[#6668F6]/8 border border-[#6668F6]/15 dark:border-[#6668F6]/20 text-xs space-y-0.5"
                      >
                        <p className="font-semibold text-[#0f0f1e] dark:text-[#f0f0ff]">
                          {edu && typeof edu === 'object' && edu.degree
                            ? edu.degree
                            : typeof edu === 'string'
                            ? edu
                            : renderNullBadge('null')}
                        </p>
                        <p className="text-[#0f0f1e]/60 dark:text-[#f0f0ff]/50">
                          {edu && typeof edu === 'object' && edu.institution
                            ? edu.institution
                            : renderNullBadge('null')}
                        </p>
                        <p className="text-[11px] text-[#6668F6]/70 font-medium">
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
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0d0d1e] border border-[#6668F6]/12 dark:border-[#6668F6]/18 shadow-[0_2px_20px_rgba(102,104,246,0.07)] dark:shadow-[0_2px_20px_rgba(102,104,246,0.15)] space-y-3 transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#F666B0]" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0f0f1e]/60 dark:text-[#f0f0ff]/50">
                    Certifications
                  </h4>
                </div>

                {Array.isArray(data.certifications) && data.certifications.length > 0 ? (
                  <div className="space-y-2">
                    {data.certifications.map((cert, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center space-x-2 p-2.5 rounded-xl bg-[#F666B0]/8 dark:bg-[#F666B0]/6 border border-[#F666B0]/20 dark:border-[#F666B0]/15 text-xs text-[#F666B0] font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{typeof cert === 'string' ? cert : JSON.stringify(cert)}</span>
                      </div>
                    ))}
                  </div>
                ) : typeof data.certifications === 'string' && data.certifications.trim() ? (
                  <p className="text-xs text-[#0f0f1e] dark:text-[#f0f0ff]">{data.certifications}</p>
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

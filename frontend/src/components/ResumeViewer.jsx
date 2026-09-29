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
  Sparkles,
  Download,
  Copy,
  Check,
  Code,
  AlertOctagon,
  Calendar,
  Building,
  CheckCircle2,
} from 'lucide-react';

export default function ResumeViewer({ results, onOpenJsonModal }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedItem, setCopiedItem] = useState(null);

  if (!results || results.length === 0) return null;

  const currentResult = results[selectedIndex] || results[0];
  const { filename, status, error_message, character_count, data } = currentResult;

  const handleCopy = (text, identifier) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedItem(identifier);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleDownloadSingleJson = () => {
    const jsonStr = JSON.stringify(data || currentResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.pdf$/i, '')}_extracted.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderNullBadge = (label = 'null') => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-500 border border-slate-700/60">
      {label}
    </span>
  );

  return (
    <div className="w-full space-y-6">
      {/* File Selector Tabs (for Multi-File uploads) */}
      {results.length > 1 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Processed Resumes ({results.length})
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
                  className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSuccess ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                  />
                  <span className="max-w-[150px] truncate">{displayName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Analysis Container */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {/* Top Meta Bar */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-white tracking-wide truncate max-w-xs sm:max-w-md">
                  {filename}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    status === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {status === 'success' ? 'Extracted' : 'Failed'}
                </span>
              </div>
              {character_count && (
                <p className="text-[11px] text-slate-400">
                  {character_count.toLocaleString()} characters parsed from document
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          {status === 'success' && data && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenJsonModal(data, filename)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                title="View full structured JSON"
              >
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>JSON View</span>
              </button>
              <button
                onClick={handleDownloadSingleJson}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                title="Download extracted data as JSON file"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Failed State Display */}
        {status === 'error' && (
          <div className="p-8 text-center space-y-4 max-w-xl mx-auto my-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-rose-300">Analysis Failed</h4>
              <p className="text-xs text-rose-200/80 mt-2 bg-rose-950/30 border border-rose-800/40 p-3.5 rounded-xl font-mono text-left leading-relaxed">
                {error_message || 'An unknown error occurred while processing this file.'}
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Please check if the PDF is password-protected, scanned without OCR text, or corrupted, then try again.
            </p>
          </div>
        )}

        {/* Success State: Detailed Structured Breakdown */}
        {status === 'success' && data && (
          <div className="p-6 space-y-6">
            
            {/* 1. Header Card: Full Name & Contact Info */}
            <div className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/60 rounded-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Candidate Name
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    {data.full_name ? data.full_name : renderNullBadge('null')}
                  </h2>
                </div>

                {/* Contact Badges (Phone, Email, Location) */}
                <div className="flex flex-wrap gap-2.5">
                  {/* Email */}
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-400">Email:</span>
                    {data.email ? (
                      <div className="flex items-center space-x-1">
                        <a
                          href={`mailto:${data.email}`}
                          className="text-slate-200 hover:text-indigo-400 font-medium"
                        >
                          {data.email}
                        </a>
                        <button
                          onClick={() => handleCopy(data.email, 'email')}
                          className="text-slate-500 hover:text-slate-300 ml-1"
                        >
                          {copiedItem === 'email' ? (
                            <Check className="w-3 h-3 text-emerald-400" />
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
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-400">Phone:</span>
                    {data.phone ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-200 font-medium">{data.phone}</span>
                        <button
                          onClick={() => handleCopy(data.phone, 'phone')}
                          className="text-slate-500 hover:text-slate-300 ml-1"
                        >
                          {copiedItem === 'phone' ? (
                            <Check className="w-3 h-3 text-emerald-400" />
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
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-400">Location:</span>
                    {data.location ? (
                      <span className="text-slate-200 font-medium">{data.location}</span>
                    ) : (
                      renderNullBadge('null')
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Professional Summary Section */}
            <div className="p-5 bg-slate-850/50 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Professional Summary
                </h4>
              </div>
              {data.professional_summary ? (
                <p className="text-sm text-slate-300 leading-relaxed pl-6 border-l-2 border-indigo-500/40">
                  {data.professional_summary}
                </p>
              ) : (
                <div className="pl-6">{renderNullBadge('null')}</div>
              )}
            </div>

            {/* 3. Skills Section */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Skills & Competencies
                  </h4>
                  {data.skills && data.skills.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {data.skills.length}
                    </span>
                  )}
                </div>

                {data.skills && data.skills.length > 0 && (
                  <button
                    onClick={() => handleCopy(data.skills.join(', '), 'all_skills')}
                    className="text-xs text-slate-400 hover:text-indigo-400 flex items-center space-x-1"
                  >
                    {copiedItem === 'all_skills' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
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

              {data.skills && data.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {data.skills.map((skill, sIdx) => (
                    <span
                      key={`${skill}-${sIdx}`}
                      className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 text-xs font-medium transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div>{renderNullBadge('null')}</div>
              )}
            </div>

            {/* 4. Work Experience Section */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Briefcase className="w-4 h-4" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Work Experience
                </h4>
                {data.work_experience && data.work_experience.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {data.work_experience.length}
                  </span>
                )}
              </div>

              {data.work_experience && data.work_experience.length > 0 ? (
                <div className="space-y-4">
                  {data.work_experience.map((exp, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h5 className="text-sm font-semibold text-white">
                            {exp.job_title ? exp.job_title : renderNullBadge('null (Job Title)')}
                          </h5>
                          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-medium mt-0.5">
                            <Building className="w-3.5 h-3.5" />
                            <span>
                              {exp.company ? exp.company : renderNullBadge('null (Company)')}
                            </span>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {exp.start_date || 'null'} — {exp.end_date || 'null'}
                          </span>
                        </div>
                      </div>

                      {/* Responsibilities */}
                      {exp.responsibilities && exp.responsibilities.length > 0 ? (
                        <ul className="mt-3 space-y-1.5 text-xs text-slate-300 list-disc list-outside pl-4">
                          {exp.responsibilities.map((resp, rIdx) => (
                            <li key={rIdx} className="leading-relaxed">
                              {resp}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="pt-2 text-xs text-slate-500">
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

            {/* 5. Education & Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Education Card */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <GraduationCap className="w-4 h-4" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Education
                  </h4>
                  {data.education && data.education.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {data.education.length}
                    </span>
                  )}
                </div>

                {data.education && data.education.length > 0 ? (
                  <div className="space-y-3">
                    {data.education.map((edu, edIdx) => (
                      <div
                        key={edIdx}
                        className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-1"
                      >
                        <p className="font-semibold text-slate-200">
                          {edu.degree ? edu.degree : renderNullBadge('null (Degree)')}
                        </p>
                        <p className="text-slate-400">
                          {edu.institution ? edu.institution : renderNullBadge('null (Institution)')}
                        </p>
                        <p className="text-[11px] text-indigo-400">
                          Graduation Year:{' '}
                          {edu.graduation_year ? (
                            <span className="font-medium text-slate-300">
                              {edu.graduation_year}
                            </span>
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

              {/* Certifications Card */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Certifications
                  </h4>
                  {data.certifications && data.certifications.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {data.certifications.length}
                    </span>
                  )}
                </div>

                {data.certifications && data.certifications.length > 0 ? (
                  <div className="space-y-2">
                    {data.certifications.map((cert, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
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

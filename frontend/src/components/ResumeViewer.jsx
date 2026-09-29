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
    a.download = `${filename.replace(/\.pdf$/i, '')}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderNullBadge = (label = 'null') => (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-400 border border-slate-200">
      {label}
    </span>
  );

  return (
    <div className="w-full space-y-5">
      {/* File Selector Tabs (for Multi-File uploads) */}
      {results.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
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
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSuccess ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="max-w-[140px] truncate">{displayName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Analysis Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Meta Bar */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {filename}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    status === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {status === 'success' ? 'Completed' : 'Error'}
                </span>
              </div>
              {character_count && (
                <p className="text-[11px] text-slate-500">
                  {character_count.toLocaleString()} characters extracted
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {status === 'success' && data && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenJsonModal(data, filename)}
                className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
                title="View JSON format"
              >
                <Code className="w-3.5 h-3.5 text-slate-500" />
                <span>JSON View</span>
              </button>
              <button
                onClick={handleDownloadSingleJson}
                className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
                title="Download JSON file"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Failure Message */}
        {status === 'error' && (
          <div className="p-8 text-center space-y-3 max-w-lg mx-auto my-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-900">Processing Failed</h3>
              <p className="text-xs text-red-700 mt-2 bg-red-50/80 border border-red-200 p-3 rounded-lg font-mono text-left leading-relaxed">
                {error_message || 'An error occurred while processing this document.'}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Please verify that the PDF is text-readable and not password-protected, then try again.
            </p>
          </div>
        )}

        {/* Structured Results Display */}
        {status === 'success' && data && (
          <div className="p-6 space-y-6">
            
            {/* 1. Candidate Full Name & Contact Details */}
            <div className="p-5 bg-slate-50/60 rounded-xl border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Full Name
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    {data.full_name ? data.full_name : renderNullBadge('null')}
                  </h3>
                </div>

                {/* Contact items */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {/* Email */}
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Email:</span>
                    {data.email ? (
                      <div className="flex items-center space-x-1">
                        <a
                          href={`mailto:${data.email}`}
                          className="text-slate-800 hover:underline font-medium"
                        >
                          {data.email}
                        </a>
                        <button
                          onClick={() => handleCopy(data.email, 'email')}
                          className="text-slate-400 hover:text-slate-600 ml-1"
                        >
                          {copiedItem === 'email' ? (
                            <Check className="w-3 h-3 text-emerald-600" />
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
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Phone:</span>
                    {data.phone ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-800 font-medium">{data.phone}</span>
                        <button
                          onClick={() => handleCopy(data.phone, 'phone')}
                          className="text-slate-400 hover:text-slate-600 ml-1"
                        >
                          {copiedItem === 'phone' ? (
                            <Check className="w-3 h-3 text-emerald-600" />
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
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Location:</span>
                    {data.location ? (
                      <span className="text-slate-800 font-medium">{data.location}</span>
                    ) : (
                      renderNullBadge('null')
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Professional Summary */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Professional Summary
              </h4>
              {data.professional_summary ? (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3.5 rounded-lg border border-slate-200/80">
                  {data.professional_summary}
                </p>
              ) : (
                <div>{renderNullBadge('null')}</div>
              )}
            </div>

            {/* 3. Skills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Skills
                  </h4>
                  {Array.isArray(data.skills) && data.skills.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                      {data.skills.length}
                    </span>
                  )}
                </div>

                {Array.isArray(data.skills) && data.skills.length > 0 && (
                  <button
                    onClick={() => handleCopy(data.skills.join(', '), 'skills')}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                  >
                    {copiedItem === 'skills' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Copied</span>
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
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {data.skills.map((skill, sIdx) => (
                    <span
                      key={`${skill}-${sIdx}`}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200/80 text-xs font-medium"
                    >
                      {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                    </span>
                  ))}
                </div>
              ) : typeof data.skills === 'string' && data.skills.trim() ? (
                <p className="text-xs text-slate-800">{data.skills}</p>
              ) : (
                <div>{renderNullBadge('null')}</div>
              )}
            </div>

            {/* 4. Work Experience */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Work Experience
                </h4>
                {Array.isArray(data.work_experience) && data.work_experience.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                    {data.work_experience.length}
                  </span>
                )}
              </div>

              {Array.isArray(data.work_experience) && data.work_experience.length > 0 ? (
                <div className="space-y-3">
                  {data.work_experience.map((exp, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-3.5 rounded-lg bg-slate-50/60 border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {exp.job_title ? exp.job_title : renderNullBadge('null')}
                          </p>
                          <p className="text-slate-600 font-medium">
                            {exp.company ? exp.company : renderNullBadge('null')}
                          </p>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {exp.start_date || 'null'} — {exp.end_date || 'null'}
                        </div>
                      </div>

                      {/* Responsibilities */}
                      {Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-slate-600 list-disc list-outside pl-4">
                          {exp.responsibilities.map((resp, rIdx) => (
                            <li key={rIdx} className="leading-relaxed">
                              {typeof resp === 'string' ? resp : JSON.stringify(resp)}
                            </li>
                          ))}
                        </ul>
                      ) : typeof exp.responsibilities === 'string' && exp.responsibilities.trim() ? (
                        <p className="mt-2 text-slate-600 pl-4">{exp.responsibilities}</p>
                      ) : (
                        <div className="pt-1 text-slate-400">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Education */}
              <div className="space-y-2 p-4 rounded-lg bg-slate-50/60 border border-slate-200">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Education
                  </h4>
                </div>

                {Array.isArray(data.education) && data.education.length > 0 ? (
                  <div className="space-y-2.5">
                    {data.education.map((edu, edIdx) => (
                      <div
                        key={edIdx}
                        className="p-2.5 rounded-md bg-white border border-slate-200 text-xs space-y-0.5"
                      >
                        <p className="font-semibold text-slate-800">
                          {edu && typeof edu === 'object' && edu.degree
                            ? edu.degree
                            : typeof edu === 'string'
                            ? edu
                            : renderNullBadge('null')}
                        </p>
                        <p className="text-slate-600">
                          {edu && typeof edu === 'object' && edu.institution
                            ? edu.institution
                            : renderNullBadge('null')}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Graduation Year:{' '}
                          {edu && typeof edu === 'object' && edu.graduation_year ? (
                            <span className="font-medium text-slate-700">
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

              {/* Certifications */}
              <div className="space-y-2 p-4 rounded-lg bg-slate-50/60 border border-slate-200">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Certifications
                  </h4>
                </div>

                {Array.isArray(data.certifications) && data.certifications.length > 0 ? (
                  <div className="space-y-1.5">
                    {data.certifications.map((cert, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 font-medium"
                      >
                        {typeof cert === 'string' ? cert : JSON.stringify(cert)}
                      </div>
                    ))}
                  </div>
                ) : typeof data.certifications === 'string' && data.certifications.trim() ? (
                  <p className="text-xs text-slate-800">{data.certifications}</p>
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

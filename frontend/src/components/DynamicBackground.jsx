import React from 'react';

const TEXT_BLOCK_1 = "RESUME ANALYZER • PDF DATA EXTRACTION • CANDIDATE PROFILING • STRUCTURED PARSING • EDUCATION & SKILLS • ";
const TEXT_BLOCK_2 = "JOB DESCRIPTION MATCHING • SKILL GAP ANALYSIS • ATS OPTIMIZATION • EXPERIENCE MAPPING • FASTAPI • REACT • ";
const TEXT_BLOCK_3 = "ZERO HALLUCINATIONS • VERIFIED EXTRACTION • MULTI FILE UPLOAD • PYTHON • DOCKER CONTAINER • AWS EC2 • ";
const TEXT_BLOCK_4 = "AUTOMATED RESUME SCREENING • QUALIFICATION AUDIT • RECRUITMENT INTELLIGENCE • JSON OUTPUT • ";

export default function DynamicBackground() {
  // Repeat string to ensure seamless loop
  const repeatText = (text) => text.repeat(6);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 flex flex-col justify-around py-6 opacity-[0.040] dark:opacity-[0.055] transition-opacity duration-300"
    >
      {/* Row 1: Moves Left — Violet */}
      <div className="overflow-hidden whitespace-nowrap">
        <div className="animate-marquee-left text-xs sm:text-sm font-black tracking-[0.25em] text-[#6668F6]">
          <span>{repeatText(TEXT_BLOCK_1)}</span>
          <span>{repeatText(TEXT_BLOCK_1)}</span>
        </div>
      </div>

      {/* Row 2: Moves Right — Mint */}
      <div className="overflow-hidden whitespace-nowrap">
        <div className="animate-marquee-right text-xs sm:text-sm font-black tracking-[0.25em] text-[#66F6AC]">
          <span>{repeatText(TEXT_BLOCK_2)}</span>
          <span>{repeatText(TEXT_BLOCK_2)}</span>
        </div>
      </div>

      {/* Row 3: Moves Left — Yellow */}
      <div className="overflow-hidden whitespace-nowrap">
        <div className="animate-marquee-left-fast text-xs sm:text-sm font-black tracking-[0.25em] text-[#F6F466]">
          <span>{repeatText(TEXT_BLOCK_3)}</span>
          <span>{repeatText(TEXT_BLOCK_3)}</span>
        </div>
      </div>

      {/* Row 4: Moves Right — Pink */}
      <div className="overflow-hidden whitespace-nowrap">
        <div className="animate-marquee-right-fast text-xs sm:text-sm font-black tracking-[0.25em] text-[#F666B0]">
          <span>{repeatText(TEXT_BLOCK_4)}</span>
          <span>{repeatText(TEXT_BLOCK_4)}</span>
        </div>
      </div>
    </div>
  );
}

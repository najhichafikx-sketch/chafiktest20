'use client';

import { Sparkles } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="flex items-center justify-between px-6 border-b border-[#1e1e22]" style={{ backgroundColor: '#111114', height: 76 }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#1e1e22] flex items-center justify-center">
          <Sparkles size={18} className="text-[#d4a827]" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#e8e6e0]">Create AI Thumbnail</h1>
          <p className="text-[11px] text-[#9a9890]">Generate professional thumbnails using AI</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a2e]" style={{ backgroundColor: '#111114' }}>
          <span className="text-[11px] font-bold text-[#d4a827]">AI POWERED</span>
          <span className="text-xs">⚡</span>
        </div>
        <button className="px-4 py-1.5 rounded-lg text-[11px] font-bold" style={{ backgroundColor: '#d4a827', color: '#0d0d0f' }}>
          Start now &rarr;
        </button>
      </div>
    </div>
  );
}

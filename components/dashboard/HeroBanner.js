'use client';

import { Sparkles } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="flex items-center justify-between px-6 border-b" style={{ backgroundColor: '#111114', height: 76, borderColor: '#1e1e22' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1e1e22' }}>
          <Sparkles size={18} className="text-[#d4a827]" />
        </div>
        <div>
          <h1 className="text-base font-bold" style={{ color: '#e8e6e0' }}>Create AI Thumbnail</h1>
          <p className="text-[11px]" style={{ color: '#9a9890' }}>Generate professional thumbnails using AI</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border" style={{ backgroundColor: '#111114', borderColor: '#2a2a2e' }}>
          <span className="text-[11px] font-bold text-[#d4a827]">AI POWERED</span>
          <span className="text-xs">⚡</span>
        </div>
        <button className="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-colors" style={{ backgroundColor: '#d4a827', color: '#0d0d0f' }}
          onMouseEnter={e => e.target.style.backgroundColor = '#c49a20'}
          onMouseLeave={e => e.target.style.backgroundColor = '#d4a827'}>
          Start now &rarr;
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Download, RotateCcw, Wand2 } from 'lucide-react';

const STATUS = [
  { icon: '🎨', text: 'Generating background...' },
  { icon: '✂️', text: 'Removing background...' },
  { icon: '✨', text: 'Applying effects...' },
  { icon: '🖼️', text: 'Compositing layers...' },
  { icon: '🎯', text: 'Final touches...' },
];

export default function CanvasPreview({ loading, result, onDownload, onRedo, progress }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading) { setStep(0); return; }
    const t = setInterval(() => setStep(i => (i + 1) % STATUS.length), 2500);
    return () => clearInterval(t);
  }, [loading]);

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#0d0d0f' }}>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl rounded-xl flex flex-col items-center justify-center overflow-hidden relative transition-all duration-500"
          style={{ aspectRatio: '16 / 9', backgroundColor: '#111114', border: '1px solid #1e1e22' }}>
          {loading ? (
            <div className="flex flex-col items-center px-8 w-full max-w-sm">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(212,168,39,0.1)' }}>
                <Wand2 size={24} className="text-[#d4a827]" />
              </div>
              <div className="w-full mb-4">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1e1e22' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: '#d4a827' }} />
                </div>
              </div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-base">{STATUS[step].icon}</span>
                <p className="text-[13px] font-medium" style={{ color: '#e8e6e0' }}>{STATUS[step].text}</p>
              </div>
              <p className="text-[11px]" style={{ color: '#5a5a62' }}>This may take a few seconds...</p>
            </div>
          ) : result ? (
            <div className="w-full h-full relative group">
              <img src={result} alt="Generated thumbnail" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <button onClick={onDownload}
                  className="px-4 py-2 rounded-xl flex items-center gap-2 text-[12px] font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#e8e6e0', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Download size={14} /> Download
                </button>
                <button onClick={onRedo}
                  className="px-4 py-2 rounded-xl flex items-center gap-2 text-[12px] font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#e8e6e0', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <RotateCcw size={14} /> Redo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center animate-in fade-in duration-700">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(212,168,39,0.08)', border: '1px solid rgba(212,168,39,0.1)' }}>
                <Sparkles size={26} className="text-[#d4a827]" />
              </div>
              <h2 className="text-xl font-extrabold mb-1 tracking-tight" style={{ color: '#e8e6e0' }}>Ready to create</h2>
              <p className="text-[12px]" style={{ color: '#9a9890', maxWidth: 240, lineHeight: 1.6 }}>
                Configure your settings on the left to generate your next thumbnail.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

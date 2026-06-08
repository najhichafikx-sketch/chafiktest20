'use client';

import { Sparkles, Download, RotateCcw } from 'lucide-react';

const LOADING_MESSAGES = [
  'Generating background...',
  'Removing background...',
  'Applying effects...',
  'Compositing layers...',
  'Final touches...',
];

export default function CanvasPreview({ loading, loadingMessage, result, onDownload, onRedo, progress }) {
  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#0d0d0f' }}>
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="w-full max-w-4xl rounded-xl border flex flex-col items-center justify-center overflow-hidden relative"
          style={{
            aspectRatio: '16 / 9',
            backgroundColor: '#111114',
            borderColor: '#1e1e22',
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center px-8 w-full">
              <div className="w-12 h-12 rounded-xl bg-[#1e1e22] flex items-center justify-center mb-5">
                <Sparkles size={22} className="text-[#d4a827]" />
              </div>
              <div className="w-full max-w-xs mb-4">
                <div className="h-1.5 rounded-full" style={{ backgroundColor: '#1e1e22' }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: '#d4a827' }}
                  />
                </div>
              </div>
              <p className="text-[12px] text-[#9a9890]">{loadingMessage}</p>
            </div>
          ) : result ? (
            <div className="w-full h-full relative group">
              <img src={result} alt="Generated thumbnail" className="w-full h-full object-contain" />
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={onDownload}
                  className="p-2 rounded-lg flex items-center gap-1.5 text-[11px] font-bold"
                  style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#e8e6e0', backdropFilter: 'blur(4px)' }}
                >
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={onRedo}
                  className="p-2 rounded-lg flex items-center gap-1.5 text-[11px] font-bold"
                  style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#e8e6e0', backdropFilter: 'blur(4px)' }}
                >
                  <RotateCcw size={14} /> Redo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center animate-in fade-in duration-1000">
              <div className="w-14 h-14 rounded-xl bg-[#1e1e22] flex items-center justify-center mb-5">
                <Sparkles size={24} className="text-[#d4a827]" />
              </div>
              <h2 className="text-xl font-bold text-[#e8e6e0] mb-1">Ready to create</h2>
              <p className="text-[12px]" style={{ color: '#9a9890', maxWidth: 220, lineHeight: 1.5 }}>
                Configure your settings on the left to generate your next thumbnail.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { Sparkles, Download, RotateCcw, Wand2, AlertCircle } from 'lucide-react';

const LOADING_STEPS = [
  'Generating background...',
  'Removing background...',
  'Applying effects...',
  'Compositing layers...',
  'Final touches...',
];

export default function CanvasPreview({ loading, result, error, onDownload, onRedo, progress, dimension = '16:9' }) {
  const [stepIdx, setStepIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!loading) {
      startTransition(() => setStepIdx(0));
      return;
    }
    timerRef.current = setInterval(() => {
      setStepIdx((i) => (i + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const isVertical = dimension === '9:16';

  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto"
      style={{ backgroundColor: '#0d0d0f' }}
    >
      <div
        className="flex-1 flex items-center justify-center"
        style={{ padding: 32, minHeight: 460 }}
      >
        <div
          className="relative w-full flex items-center justify-center"
          style={{
            maxWidth: isVertical ? 360 : 820,
            width: '100%',
            aspectRatio: isVertical ? '9 / 16' : '16 / 9',
            maxHeight: 'calc(100vh - 480px)',
            backgroundColor: '#111114',
            border: '1px solid #1e1e22',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div
              className="flex flex-col items-center"
              style={{ padding: 32, maxWidth: 320, width: '100%' }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: 'rgba(212, 168, 39, 0.1)',
                  border: '1px solid rgba(212, 168, 39, 0.2)',
                  marginBottom: 20,
                }}
              >
                <Wand2 size={24} style={{ color: '#d4a827' }} />
              </div>
              <div
                className="w-full"
                style={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#1e1e22',
                  marginBottom: 16,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: '#d4a827',
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <p
                className="font-semibold"
                style={{ fontSize: 14, color: '#e8e6e0', marginBottom: 4 }}
              >
                {LOADING_STEPS[stepIdx]}
              </p>
              <p style={{ fontSize: 12, color: '#5a5a62' }}>
                {progress}% complete
              </p>
            </div>
          ) : error ? (
            <div
              className="flex flex-col items-center text-center"
              style={{ padding: 32, maxWidth: 360 }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={26} style={{ color: '#ef4444' }} />
              </div>
              <h3
                className="font-extrabold"
                style={{ fontSize: 16, color: '#e8e6e0', marginBottom: 6 }}
              >
                Generation failed
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: '#9a9890',
                  marginBottom: 16,
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}
              >
                {error}
              </p>
              <button
                onClick={onRedo}
                className="font-bold transition-colors"
                style={{
                  fontSize: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 7,
                  backgroundColor: '#1e1e22',
                  color: '#e8e6e0',
                  border: '1px solid #2a2a2e',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
            </div>
          ) : result ? (
            <>
              <img
                src={result}
                alt="Generated thumbnail"
                className="w-full h-full"
                style={{ objectFit: 'contain' }}
              />
              <div
                className="absolute flex"
                style={{ top: 12, right: 12, gap: 6 }}
              >
                <button
                  onClick={onDownload}
                  className="flex items-center gap-1.5 font-semibold transition-colors"
                  style={{
                    fontSize: 12,
                    paddingTop: 7,
                    paddingBottom: 7,
                    paddingLeft: 10,
                    paddingRight: 10,
                    borderRadius: 7,
                    backgroundColor: 'rgba(13, 13, 15, 0.85)',
                    color: '#e8e6e0',
                    border: '1px solid #2a2a2e',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(13, 13, 15, 1)';
                    e.currentTarget.style.borderColor = '#d4a827';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(13, 13, 15, 0.85)';
                    e.currentTarget.style.borderColor = '#2a2a2e';
                  }}
                >
                  <Download size={13} />
                  Download
                </button>
                <button
                  onClick={onRedo}
                  className="flex items-center gap-1.5 font-semibold transition-colors"
                  style={{
                    fontSize: 12,
                    paddingTop: 7,
                    paddingBottom: 7,
                    paddingLeft: 10,
                    paddingRight: 10,
                    borderRadius: 7,
                    backgroundColor: 'rgba(13, 13, 15, 0.85)',
                    color: '#e8e6e0',
                    border: '1px solid #2a2a2e',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(13, 13, 15, 1)';
                    e.currentTarget.style.borderColor = '#d4a827';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(13, 13, 15, 0.85)';
                    e.currentTarget.style.borderColor = '#2a2a2e';
                  }}
                >
                  <RotateCcw size={13} />
                  Redo
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center" style={{ padding: 24 }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  backgroundColor: 'rgba(212, 168, 39, 0.08)',
                  border: '1px solid rgba(212, 168, 39, 0.15)',
                  marginBottom: 16,
                }}
              >
                <Sparkles size={28} style={{ color: '#d4a827' }} />
              </div>
              <h2
                className="font-extrabold"
                style={{ fontSize: 20, color: '#e8e6e0', marginBottom: 6 }}
              >
                Ready to create
              </h2>
              <p style={{ fontSize: 13, color: '#9a9890', maxWidth: 280 }}>
                Fill the panel on the left and click Create to generate your AI thumbnail
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

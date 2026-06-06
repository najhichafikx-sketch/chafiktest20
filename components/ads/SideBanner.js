'use client';

import { useEffect, useRef, useState } from 'react';

const SIDE_KEY = 'chafik_side_dismissed';

export default function SideBanner({ side = 'left' }) {
  const ref = useRef(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1200) return;
    if (sessionStorage.getItem(SIDE_KEY)) return;
    if (window.__sideBannerLoaded) return;
    window.__sideBannerLoaded = true;
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible || !ref.current) return;
    const s = document.createElement('script');
    s.src = 'https://nap5k.com/tag.min.js';
    s.async = true;
    s.dataset.zone = '11103207';
    s.dataset.cfasync = 'false';
    ref.current.appendChild(s);
  }, [visible]);

  if (!visible || dismissed) return null;

  const pos = side === 'left'
    ? { left: '16px' }
    : { right: '16px' };

  return (
    <div
      style={{
        position: 'fixed',
        ...pos,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 150,
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: '14px',
        padding: '10px 8px 8px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
        maxWidth: '180px',
      }}
    >
      <button
        onClick={() => {
          setDismissed(true);
          if (typeof window !== 'undefined') sessionStorage.setItem(SIDE_KEY, '1');
        }}
        aria-label="Close ad"
        style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '2px solid rgba(10,10,15,0.9)',
          background: '#ef4444',
          color: 'white',
          fontSize: '11px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          lineHeight: 1,
          padding: 0,
        }}
      >✕</button>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: '#94a3b8',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 6,
        }}
      >
        Sponsored
      </div>
      <div ref={ref} style={{ width: 160, minHeight: 300 }} />
    </div>
  );
}

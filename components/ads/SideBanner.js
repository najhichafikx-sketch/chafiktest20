'use client';

import { useEffect, useRef, useState, startTransition } from 'react';

const ADSTERRA_KEY = 'a64a753a91e1df2d14eac4534cea9820';
const SIDE_KEY = 'chafik_side_dismissed';
const ADSTERRA_CDNS = [
  'https://cdns.gtagserv.com',
  'https://www.highperformanceformat.com',
  'https://www.profitabledisplaynetwork.com',
];

function loadAdsterra(container) {
  if (!container) return;
  let idx = 0;
  let stopped = false;
  let timeoutId;

  const cleanup = () => {
    container.innerHTML = '';
    if (timeoutId) clearTimeout(timeoutId);
  };

  const tryNext = () => {
    if (stopped || idx >= ADSTERRA_CDNS.length) return;
    const cdn = ADSTERRA_CDNS[idx++];
    const config = document.createElement('script');
    config.type = 'text/javascript';
    config.text = `window.atOptions={'key':'${ADSTERRA_KEY}','format':'iframe','height':250,'width':300,'params':{}};`;
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = `${cdn}/${ADSTERRA_KEY}/invoke.js`;
    s.async = false;
    s.dataset.cfasync = 'false';
    s.onerror = () => { if (stopped) return; cleanup(); tryNext(); };
    s.onload = () => {
      if (stopped) return;
      timeoutId = window.setTimeout(() => {
        if (!container.querySelector('iframe')) { cleanup(); tryNext(); }
      }, 2500);
    };
    container.appendChild(config);
    container.appendChild(s);
  };

  tryNext();
  return () => { stopped = true; cleanup(); };
}

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
    startTransition(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (!visible || !ref.current) return;
    const cleanup = loadAdsterra(ref.current);
    return cleanup;
  }, [visible]);

  if (!visible || dismissed) return null;

  const pos = side === 'left' ? { left: '12px' } : { right: '12px' };

  return (
    <div
      style={{
        position: 'fixed',
        ...pos,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 150,
        lineHeight: 0,
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
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.9)',
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
          zIndex: 2,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}
      >✕</button>
      <div ref={ref} style={{ width: 300, height: 250, display: 'block' }} />
    </div>
  );
}

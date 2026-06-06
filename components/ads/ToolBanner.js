'use client';

import { useEffect, useRef, useState } from 'react';
import { isMobile } from '@/lib/ads';

const ADSTERRA_KEY = 'a64a753a91e1df2d14eac4534cea9820';
const CDNS = [
  'https://cdns.gtagserv.com',
  'https://www.highperformanceformat.com',
  'https://www.profitabledisplaynetwork.com',
];

export default function ToolBanner({ slotId = 'tool-top' }) {
  const hostRef = useRef(null);
  const [size, setSize] = useState({ w: 728, h: 90 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSize(isMobile() ? { w: 300, h: 250 } : { w: 728, h: 90 });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hostRef.current) return;

    window.__adsterraSlotsLoaded = window.__adsterraSlotsLoaded || {};
    if (window.__adsterraSlotsLoaded[slotId]) return;
    window.__adsterraSlotsLoaded[slotId] = true;

    const host = hostRef.current;
    let idx = 0;
    let timeoutId;
    let stopped = false;

    const cleanup = () => {
      host.innerHTML = '';
      if (timeoutId) clearTimeout(timeoutId);
    };

    const tryNext = () => {
      if (stopped || idx >= CDNS.length) return;
      const cdn = CDNS[idx++];

      const config = document.createElement('script');
      config.type = 'text/javascript';
      config.text = `window.atOptions={'key':'${ADSTERRA_KEY}','format':'iframe','height':${size.h},'width':${size.w},'params':{}};`;

      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = `${cdn}/${ADSTERRA_KEY}/invoke.js`;
      s.async = false;
      s.dataset.cfasync = 'false';
      s.onerror = () => {
        if (stopped) return;
        cleanup();
        tryNext();
      };
      s.onload = () => {
        if (stopped) return;
        timeoutId = window.setTimeout(() => {
          if (!host.querySelector('iframe')) {
            cleanup();
            tryNext();
          }
        }, 2500);
      };

      host.appendChild(config);
      host.appendChild(s);
    };

    tryNext();
    return () => {
      stopped = true;
      cleanup();
    };
  }, [slotId, size.w, size.h]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '14px 0' }}>
      <div
        ref={hostRef}
        data-adsterra-slot={slotId}
        style={{ width: size.w, minHeight: size.h, maxWidth: '100%' }}
      />
    </div>
  );
}

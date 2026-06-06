'use client';

import { useEffect, useRef, useState } from 'react';
import { isMobile } from '@/lib/ads';

const ADSTERRA_KEY = 'a64a753a91e1df2d14eac4534cea9820';
const CDNS = [
  'https://cdns.gtagserv.com',
  'https://www.highperformanceformat.com',
  'https://www.profitabledisplaynetwork.com',
];

export default function HeaderBanner({ excludePaths = ['/'] } = {}) {
  const hostRef = useRef(null);
  const [size, setSize] = useState({ w: 728, h: 90 });
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSize(isMobile() ? { w: 320, h: 50 } : { w: 728, h: 90 });
  }, []);

  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setShow(!excludePaths.includes(window.location.pathname));
  }, [excludePaths]);

  if (!show) return null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hostRef.current) return;

    window.__adsterraSlotsLoaded = window.__adsterraSlotsLoaded || {};
    if (window.__adsterraSlotsLoaded['header']) return;
    window.__adsterraSlotsLoaded['header'] = true;

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
        console.warn('[adsterra-header] failed:', cdn);
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
  }, [size.w, size.h]);

  return (
    <div
      style={{
        position: sticky ? 'sticky' : 'static',
        top: sticky ? 0 : 'auto',
        zIndex: 40,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px 8px',
        background: 'rgba(99,102,241,0.04)',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
      }}
    >
      <div
        ref={hostRef}
        data-adsterra-slot="header"
        style={{ width: size.w, height: size.h, maxWidth: '100%' }}
      />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

const ADSTERRA_KEY = 'a64a753a91e1df2d14eac4534cea9820';
const CDNS = [
  'https://cdns.gtagserv.com',
  'https://www.highperformanceformat.com',
  'https://www.profitabledisplaynetwork.com',
];

export default function AdsterraBanner({ slotId = 'top-banner' }) {
  const hostRef = useRef(null);
  const [size, setSize] = useState({ width: 728, height: 90 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mobile = window.innerWidth < 768;
    setSize(mobile ? { width: 300, height: 250 } : { width: 728, height: 90 });
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

    const hasAdIframe = () => !!host.querySelector('iframe');

    const cleanupHost = () => {
      host.innerHTML = '';
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const tryNext = () => {
      if (idx >= CDNS.length) return;
      const cdn = CDNS[idx++];

      const config = document.createElement('script');
      config.type = 'text/javascript';
      config.text = `window.atOptions = {'key':'${ADSTERRA_KEY}','format':'iframe','height':${size.height},'width':${size.width},'params':{}};`;

      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = `${cdn}/${ADSTERRA_KEY}/invoke.js`;
      s.async = false;
      s.dataset.cfasync = 'false';
      s.onerror = () => {
        console.warn('[adsterra] failed:', cdn);
        cleanupHost();
        tryNext();
      };
      s.onload = () => {
        timeoutId = setTimeout(() => {
          if (!hasAdIframe()) {
            cleanupHost();
            tryNext();
          }
        }, 2500);
      };

      host.appendChild(config);
      host.appendChild(s);
    };

    tryNext();
  }, [slotId, size.width, size.height]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '10px 0',
        minHeight: size.height,
      }}
    >
      <div ref={hostRef} data-adsterra-slot={slotId} style={{ width: size.width, minHeight: size.height, maxWidth: '100%' }} />
    </div>
  );
}

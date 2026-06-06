'use client';

import { useEffect, useRef, useState } from 'react';

const ADSTERRA_KEY = 'a64a753a91e1df2d14eac4534cea9820';
const MONETAG_MULTITAG_SRC = 'https://quge5.com/88/tag.min.js';
const MONETAG_MULTITAG_ZONE = '246361';
const ADSTERRA_CDNS = [
  'https://cdns.gtagserv.com',
  'https://www.highperformanceformat.com',
  'https://www.profitabledisplaynetwork.com',
];

export default function BannerSlot({ slotId = 'site-default' }) {
  const adsterraHostRef = useRef(null);
  const monetagHostRef = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__bannerSlotsLoaded === undefined) {
      window.__bannerSlotsLoaded = {};
    }
    if (window.__bannerSlotsLoaded[slotId]) return;
    window.__bannerSlotsLoaded[slotId] = true;
    setShow(true);
  }, [slotId]);

  useEffect(() => {
    if (!show || !adsterraHostRef.current) return;

    const host = adsterraHostRef.current;
    let idx = 0;
    let timeoutId;
    let stopped = false;

    const cleanup = () => {
      host.innerHTML = '';
      if (timeoutId) clearTimeout(timeoutId);
    };

    const tryNext = () => {
      if (stopped || idx >= ADSTERRA_CDNS.length) return;
      const cdn = ADSTERRA_CDNS[idx++];

      const config = document.createElement('script');
      config.type = 'text/javascript';
      config.text = `window.atOptions={'key':'${ADSTERRA_KEY}','format':'iframe','height':90,'width':728,'params':{}};`;

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
  }, [show]);

  useEffect(() => {
    if (!show || !monetagHostRef.current) return;

    const host = monetagHostRef.current;
    const s = document.createElement('script');
    s.src = MONETAG_MULTITAG_SRC;
    s.async = true;
    s.dataset.zone = MONETAG_MULTITAG_ZONE;
    s.dataset.cfasync = 'false';
    host.appendChild(s);
  }, [show]);

  if (!show) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        padding: '20px 0',
        margin: '32px 0',
        background: 'rgba(99,102,241,0.03)',
        borderTop: '1px solid rgba(99,102,241,0.12)',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          maxWidth: 728,
          width: '100%',
          padding: '0 12px',
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: '#64748b',
            fontWeight: 600,
          }}
        >
          Sponsored
        </span>

        <div
          ref={adsterraHostRef}
          data-adsterra-slot={slotId}
          style={{ width: 728, maxWidth: '100%', minHeight: 90 }}
        />

        <div
          ref={monetagHostRef}
          data-monetag-slot={slotId}
          style={{ width: 728, maxWidth: '100%', minHeight: 60, display: 'none' }}
        />
      </div>
    </div>
  );
}

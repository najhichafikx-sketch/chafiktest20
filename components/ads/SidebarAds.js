'use client';

import { useEffect, useRef, useState } from 'react';
import { isDesktopWide } from '@/lib/ads';

const ADSTERRA_KEY = 'a64a753a91e1df2d14eac4534cea9820';
const CDNS = [
  'https://cdns.gtagserv.com',
  'https://www.highperformanceformat.com',
  'https://www.profitabledisplaynetwork.com',
];

function StickySide({ side, slotId, w, h }) {
  const hostRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hostRef.current) return;
    if (!isDesktopWide()) return;

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
      config.text = `window.atOptions={'key':'${ADSTERRA_KEY}','format':'iframe','height':${h},'width':${w},'params':{}};`;
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
  }, [slotId, w, h]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        [side]: 12,
        zIndex: 30,
        width: w,
        minHeight: h,
        background: 'rgba(99,102,241,0.04)',
        border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: 8,
      }}
    >
      <div ref={hostRef} data-adsterra-slot={slotId} style={{ width: w, height: h }} />
    </div>
  );
}

export default function SidebarAds() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setShow(isDesktopWide());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!show) return null;

  return (
    <>
      <StickySide side="left" slotId="side-left" w={160} h={600} />
      <StickySide side="right" slotId="side-right" w={160} h={600} />
    </>
  );
}

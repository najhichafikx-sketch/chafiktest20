'use client';

import { useEffect, useRef } from 'react';

const MONETAG_MULTITAG_SRC = 'https://quge5.com/88/tag.min.js';
const MONETAG_MULTITAG_ZONE = '246361';

export default function MonetagBanner({ slotId = 'monetag-300x250' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hostRef.current) return;

    window.__monetagSlotsLoaded = window.__monetagSlotsLoaded || {};
    if (window.__monetagSlotsLoaded[slotId]) return;
    window.__monetagSlotsLoaded[slotId] = true;

    const script = document.createElement('script');
    script.src = MONETAG_MULTITAG_SRC;
    script.async = true;
    script.dataset.zone = MONETAG_MULTITAG_ZONE;
    script.dataset.cfasync = 'false';

    hostRef.current.appendChild(script);
  }, [slotId]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '10px 0' }}>
      <div
        ref={hostRef}
        data-monetag-slot={slotId}
        style={{ width: 300, minHeight: 250, maxWidth: '100%' }}
      />
    </div>
  );
}

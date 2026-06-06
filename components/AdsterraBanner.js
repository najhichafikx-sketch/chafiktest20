'use client';

import { useEffect } from 'react';

const ADSTERRA_KEY = 'a64a753a91e1df2d14eac4534cea9820';
const CDNS = [
  'https://www.profitabledisplaynetwork.com',
  'https://www.highperformanceformat.com',
  'https://cdns.gtagserv.com',
];

export default function AdsterraBanner() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__adsterraTried) return;
    window.__adsterraTried = true;

    const config = document.createElement('script');
    config.type = 'text/javascript';
    config.text = `atOptions = {'key' : '${ADSTERRA_KEY}','format' : 'iframe','height' : 90,'width' : 728,'params' : {}};`;
    document.head.appendChild(config);

    let idx = 0;
    const tryNext = () => {
      if (idx >= CDNS.length) return;
      const cdn = CDNS[idx++];
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = `${cdn}/${ADSTERRA_KEY}/invoke.js`;
      s.async = true;
      s.dataset.cfasync = 'false';
      s.onerror = () => {
        console.warn('[adsterra] failed:', cdn);
        tryNext();
      };
      document.body.appendChild(s);
    };
    tryNext();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10px 0', minHeight: 100, background: 'rgba(99,102,241,0.03)', borderTop: '1px solid rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
      <ins id="adsterra-anchor" style={{ display: 'inline-block', width: 728, height: 90, maxWidth: '100%' }}></ins>
    </div>
  );
}

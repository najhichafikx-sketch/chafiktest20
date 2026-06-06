'use client';

import { useEffect } from 'react';

export default function AdsterraBanner() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__adsterraBannerLoaded) return;
    window.__adsterraBannerLoaded = true;

    const config = document.createElement('script');
    config.type = 'text/javascript';
    config.text = `atOptions = {'key' : 'a64a753a91e1df2d14eac4534cea9820','format' : 'iframe','height' : 90,'width' : 728,'params' : {}};`;
    document.head.appendChild(config);

    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://www.profitabledisplaynetwork.com/a64a753a91e1df2d14eac4534cea9820/invoke.js';
    s.async = true;
    s.dataset.cfasync = 'false';
    document.body.appendChild(s);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '14px 0', minHeight: 110, background: 'linear-gradient(180deg, rgba(99,102,241,0.04), rgba(99,102,241,0.01))', borderTop: '1px solid rgba(99,102,241,0.12)', borderBottom: '1px solid rgba(99,102,241,0.12)', margin: '8px 0' }}>
      <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Advertisement</span>
      <ins id="adsterra-anchor" style={{ display: 'inline-block', width: 728, height: 90, maxWidth: '100%' }}></ins>
    </div>
  );
}

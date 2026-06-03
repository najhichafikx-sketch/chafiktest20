'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { trackAdImpression, trackAdClick } from '@/lib/ga4';

const AD_VARIANTS = {
  sidebar: [{ size: '300x250' }, { size: '160x600' }, { size: '300x600' }],
  content_top: [{ size: '728x90' }, { size: '468x60' }],
  content_bottom: [{ size: '728x90' }, { size: '468x60' }],
  header: [{ size: '728x90' }, { size: '468x60' }],
  footer: [{ size: '728x90' }, { size: '468x60' }],
  popup: [{ size: '300x250' }, { size: '320x480' }],
  in_tool: [{ size: '468x60' }, { size: '728x90' }],
  loading_state: [{ size: '300x250' }, { size: '468x60' }],
  mid_result: [{ size: '300x250' }, { size: '468x60' }]
};

function getVariant(location) {
  const variants = AD_VARIANTS[location];
  if (!variants) return null;

  const stored = localStorage.getItem(`ad_variant_${location}`);
  if (stored) return variants[parseInt(stored)];

  const idx = Math.floor(Math.random() * variants.length);
  localStorage.setItem(`ad_variant_${location}`, String(idx));

  return variants[idx];
}

async function track(sessionId, eventType, data) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({
        event_type: eventType,
        page_url: window.location.pathname,
        metadata: data
      })
    });
  } catch {}
}

export default function AdManager({ location, toolId }) {
  const [adData, setAdData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [variant, setVariant] = useState(null);

  const containerRef = useRef(null);
  const sessionId = useRef('');
  const tracked = useRef(false);

  useEffect(() => {
    sessionId.current =
      localStorage.getItem('session_id') || crypto.randomUUID();

    localStorage.setItem('session_id', sessionId.current);
    setVariant(getVariant(location));
  }, [location]);

  useEffect(() => {
    fetch('/api/ads')
      .then(r => r.json())
      .then(data => {
        if (data.success) setAdData(data.ads[location] || null);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [location]);

  const injectAd = (html, container) => {
    if (!container) return;

    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    // render HTML
    Array.from(wrapper.childNodes).forEach(node => {
      if (node.nodeName !== 'SCRIPT') {
        container.appendChild(node.cloneNode(true));
      }
    });

    // execute scripts properly
    wrapper.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');

      if (oldScript.src) {
        newScript.src = oldScript.src;
        newScript.async = true;
      } else {
        newScript.textContent = oldScript.textContent;
      }

      document.body.appendChild(newScript);
    });
  };

  useEffect(() => {
    if (!adData?.enabled || !adData?.code || !containerRef.current) return;

    const el = containerRef.current;

    const runAd = () => {
      if (tracked.current) return;

      injectAd(adData.code, el);
      tracked.current = true;

      const meta = {
        slot: location,
        toolId,
        variant: variant?.size || 'default',
        url: window.location.pathname
      };

      track(sessionId.current, 'ad_impression', meta);
      trackAdImpression(meta);
    };

    // 🔥 guaranteed execution
    runAd();
    setTimeout(runAd, 1500);
    setTimeout(runAd, 3000);
  }, [adData, location, toolId, variant]);

  const handleClick = useCallback(() => {
    const meta = {
      slot: location,
      toolId,
      variant: variant?.size || 'default',
      url: window.location.pathname
    };

    track(sessionId.current, 'ad_click', meta);
    trackAdClick(meta);
  }, [location, toolId, variant]);

  if (!loaded) {
    return <div style={{ minHeight: 90 }} />;
  }

  if (!adData?.enabled || !adData?.code) return null;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{
        minHeight: 1,
        overflow: 'hidden',
        textAlign: 'center',
        cursor: 'pointer'
      }}
    />
  );
}
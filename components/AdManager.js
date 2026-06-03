'use client';

import { useEffect, useRef, useCallback } from 'react';

const RETRY_DELAYS = [500, 2000, 5000];

export default function AdManager({ location, toolId }) {
  const ref = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  const injectAd = useCallback((code) => {
    if (!ref.current) return;

    // extract HTML (non-script content)
    const htmlPart = code.replace(/<script[\s\S]*?<\/script>/gi, '');
    const scriptMatches = code.match(/<script[\s\S]*?<\/script>/gi) || [];

    // set HTML container content first
    if (htmlPart.trim()) {
      ref.current.innerHTML = htmlPart;
    }

    // append scripts to document.body in order
    scriptMatches.forEach((tag) => {
      const srcMatch = tag.match(/src\s*=\s*"([^"]+)"/);
      const isAsync = /async/gi.test(tag);
      const script = document.createElement('script');

      if (srcMatch) {
        script.src = srcMatch[1];
        if (isAsync) script.async = true;
      } else {
        const raw = tag.replace(/<\/?script[^>]*>/gi, '');
        script.textContent = raw;
      }

      document.body.appendChild(script);
    });
  }, []);

  const loadAd = useCallback(() => {
    if (!mountedRef.current) return;

    fetch('/api/ads')
      .then(r => r.json())
      .then(data => {
        if (!mountedRef.current) return;
        if (!data.success) return;

        const ad = data.ads?.[location];
        if (!ad?.enabled || !ad?.code) return;

        injectAd(ad.code);
      })
      .catch(() => {});
  }, [location, injectAd]);

  useEffect(() => {
    mountedRef.current = true;

    // initial load
    loadAd();

    // sequential retries
    let attempt = 0;
    function nextRetry() {
      if (!mountedRef.current) return;
      const delay = RETRY_DELAYS[attempt];
      if (delay === undefined) return;
      attempt += 1;
      timerRef.current = setTimeout(() => {
        loadAd();
        nextRetry();
      }, delay);
    }
    nextRetry();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loadAd]);

  return (
    <div
      ref={ref}
      style={{
        minHeight: 90,
        width: '100%',
        textAlign: 'center',
        overflow: 'hidden'
      }}
    />
  );
}

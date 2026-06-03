'use client';

import { useEffect, useRef, useState } from 'react';

export default function AdSlot({ location }) {
  const ref = useRef(null);
  const [done, setDone] = useState(false);
  const [html, setHtml] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ads?location=${location}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.success && data.html) setHtml(data.html);
        setDone(true);
      })
      .catch(() => { if (!cancelled) setDone(true); });
    return () => { cancelled = true; };
  }, [location]);

  useEffect(() => {
    if (!html || !ref.current) return;

    const container = ref.current;
    const scriptTags = html.match(/<script[\s\S]*?<\/script>/gi) || [];
    const htmlPart = html.replace(/<script[\s\S]*?<\/script>/gi, '').trim();

    container.innerHTML = htmlPart;

    scriptTags.forEach(tag => {
      const srcMatch = tag.match(/src\s*=\s*"([^"]+)"/);
      const script = document.createElement('script');
      script.setAttribute('data-cfasync', 'false');
      if (srcMatch) {
        script.src = srcMatch[1];
        script.async = true;
      } else {
        const raw = tag.replace(/<\/?script[^>]*>/gi, '');
        script.textContent = raw;
      }
      document.body.appendChild(script);
    });
  }, [html]);

  if (done && !html) return null;
  if (!html) return null;

  return (
    <div
      ref={ref}
      className="ad-slot"
      data-location={location}
      style={{ width: '100%', textAlign: 'center', overflow: 'hidden', margin: '16px 0', minHeight: 1 }}
    />
  );
}

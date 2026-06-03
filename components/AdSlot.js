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
    if (!html) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    wrapper.querySelectorAll('script').forEach(s => {
      const script = document.createElement('script');
      if (s.src) {
        script.src = s.src;
        script.async = true;
      } else {
        script.textContent = s.textContent;
      }
      document.head.appendChild(script);
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

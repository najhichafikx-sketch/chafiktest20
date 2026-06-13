'use client';

import { useEffect } from 'react';

export default function BlogViewTracker({ slug }) {
  useEffect(() => {
    fetch('/api/blog/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        path: window.location.pathname,
        referrer: document.referrer || ''
      })
    })
    .then(res => {
      if (!res.ok) console.warn('[track-view] API returned', res.status);
    })
    .catch(err => console.warn('[track-view] Fetch failed:', err));
  }, [slug]);

  return null;
}
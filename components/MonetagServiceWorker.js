'use client';

import { useEffect } from 'react';

export default function MonetagServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (window.__swRegistered) return;
    window.__swRegistered = true;
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => {
        window.__swRegistered = false;
      });
  }, []);

  return null;
}

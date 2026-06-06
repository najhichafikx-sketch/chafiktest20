'use client';

import { useEffect } from 'react';
import { fireInPagePushDelayed } from '@/lib/ads';

export default function InPagePushDelayed() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === '/') return;
    fireInPagePushDelayed();
  }, []);
  return null;
}

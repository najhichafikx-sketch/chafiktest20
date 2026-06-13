'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip admin and API routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
      return;
    }

    // Extract slug from blog paths for backward compatibility
    let slug = '';
    if (pathname.startsWith('/blog/')) {
      slug = pathname.replace('/blog/', '');
    }

    fetch('/api/blog/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: slug || pathname,
        path: pathname,
        referrer: document.referrer || ''
      })
    })
    .then(res => {
      if (!res.ok) console.warn('[page-view] API returned', res.status);
    })
    .catch(err => console.warn('[page-view] Fetch failed:', err));
  }, [pathname]);

  return null;
}
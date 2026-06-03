'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin-login'); return; }
    fetch('/api/admin/status', { headers: { 'Authorization': `Bearer ${t}` } })
      .then(r => { if (r.status === 401) { localStorage.removeItem('admin_token'); router.push('/admin-login'); } else setAuthed(true); })
      .catch(() => setAuthed(true));
  }, [router]);

  if (!authed) return <div className="section" style={{ paddingTop: '120px', textAlign: 'center' }}>Loading...</div>;

  return (
    <section className="section" style={{ paddingTop: '100px' }}>
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 className="section-title" style={{ marginBottom: 0 }}>Admin Panel</h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/admin" className="btn btn-secondary btn-sm">Dashboard</Link>
            <Link href="/admin/tools" className="btn btn-secondary btn-sm">Tools</Link>
            <Link href="/admin/ads" className="btn btn-secondary btn-sm">Ads</Link>
            <Link href="/admin/blog" className="btn btn-secondary btn-sm">Blog</Link>
            <Link href="/admin/analytics" className="btn btn-secondary btn-sm">Analytics</Link>
            <Link href="/admin/settings" className="btn btn-secondary btn-sm">Settings</Link>
            <Link href="/admin/api-settings" className="btn btn-secondary btn-sm">API Keys</Link>
            <Link href="/admin/platforms-views" className="btn btn-secondary btn-sm">Platforms</Link>
            <Link href="/admin/ad-diagnostics" className="btn btn-secondary btn-sm">Ad Diag</Link>
            <Link href="/admin/prompts" className="btn btn-secondary btn-sm">Prompts</Link>
            <Link href="/admin/users" className="btn btn-secondary btn-sm">Users</Link>
            <Link href="/admin/revenue-dashboard" className="btn btn-secondary btn-sm">Revenue</Link>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

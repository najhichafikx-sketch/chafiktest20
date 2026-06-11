'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Wrench, DollarSign, BarChart3,
  Settings, Key, Globe, Newspaper, MessageSquare,
  Users, LogOut, Upload
} from 'lucide-react';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tools', label: 'Tools', icon: Wrench },
  { href: '/admin/revenue-dashboard', label: 'Revenue', icon: DollarSign },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/api-settings', label: 'API Keys', icon: Key },
  { href: '/admin/platforms-views', label: 'Platforms', icon: Globe },
  { type: 'divider' },
  { type: 'label', label: 'Content' },
  { href: '/admin/blog', label: 'Blog Articles', icon: Newspaper },
  { href: '/admin/prompts', label: 'Prompt Articles', icon: MessageSquare },
  { href: '/admin/auto-publisher', label: 'Auto-Publisher', icon: Upload },
  { type: 'divider' },
  { href: '/admin/users', label: 'Users', icon: Users },
];

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
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: '100vh' }}>
      <aside style={{
        background: 'var(--bg-glass)',
        borderRight: '1px solid var(--bg-glass-border)',
        padding: '24px 12px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, paddingLeft: 8 }}>Chafiktech</h2>
        </Link>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {links.map((item, i) => {
            if (item.type === 'divider') {
              return <hr key={i} style={{ borderColor: 'var(--bg-glass-border)', margin: '8px 0' }} />;
            }
            if (item.type === 'label') {
              return (
                <div key={i} style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                  color: 'var(--text-secondary)', padding: '4px 8px', marginBottom: 2
                }}>
                  {item.label}
                </div>
              );
            }
            const Icon = item.icon;
            return (
              <Link
                key={i}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  fontSize: 14, fontWeight: 500,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--bg-glass-border)', marginTop: 'auto' }}>
          <button
            className="btn btn-outline btn-sm"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
            onClick={() => { localStorage.removeItem('admin_token'); router.push('/admin-login'); }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <main style={{ padding: 0 }}>
        {children}
      </main>
    </div>
  );
}

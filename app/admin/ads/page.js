'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminAdsPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [ads, setAds] = useState([]);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [editCode, setEditCode] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin-login'); return; }
    setToken(t);
    fetchAds(t);
  }, [router]);

  async function fetchAds(t) {
    const res = await fetch('/api/admin/ads', {
      headers: { 'Authorization': `Bearer ${t}` }
    });
    if (res.status === 401) { localStorage.removeItem('admin_token'); router.push('/admin-login'); return; }
    const data = await res.json();
    if (data.success) setAds(data.ads);
  }

  async function handleToggle(ad, enabled) {
    setMessage('');
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, location: ad.location, enabled, code: ad.code })
      });
      const data = await res.json();
      if (data.success) setAds(prev => prev.map(a => a.location === ad.location ? { ...a, enabled } : a));
      setMessage(data.message);
    } catch { setMessage('Save failed'); }
  }

  async function handleSaveCode(ad) {
    setMessage('');
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, location: ad.location, enabled: ad.enabled, code: editCode })
      });
      const data = await res.json();
      if (data.success) setAds(prev => prev.map(a => a.location === ad.location ? { ...a, code: editCode } : a));
      setMessage(data.message);
      setEditing(null);
    } catch { setMessage('Save failed'); }
  }

  function getLocationDescription(loc) {
    const descs = {
      header: 'Banner at top of every page (below navbar)',
      sidebar: 'Sidebar ad on desktop (auto-hidden on mobile)',
      content_top: 'In-content ad above tool results',
      content_bottom: 'In-content ad below tool results',
      footer: 'Footer banner at bottom of every page',
      popup: 'Floating popup ad (bottom-right corner)'
    };
    return descs[loc] || '';
  }

  return (
    <section className="section" style={{ paddingTop: '100px' }}>
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Ad Settings</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage Adsterra ad placements across all pages</p>
          </div>
          <Link href="/admin" className="btn btn-secondary btn-sm">Back to Dashboard</Link>
        </div>

        {message && (
          <div style={{ padding: 12, marginBottom: 16, borderRadius: 8, background: 'var(--bg-glass)', color: message.includes('saved') ? 'var(--neon-green)' : '#ef4444' }}>
            {message}
          </div>
        )}

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>Ad Placements ({ads.length})</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bg-glass-border)' }}>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Script Code</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(ad => (
                  <tr key={ad.location} style={{ borderBottom: '1px solid var(--bg-glass-border)' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{ad.location.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {getLocationDescription(ad.location)}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleToggle(ad, !ad.enabled)}
                        style={{
                          padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                          fontWeight: 600, fontSize: '0.85rem',
                          background: ad.enabled ? 'var(--neon-green)' : '#ef4444',
                          color: ad.enabled ? '#000' : '#fff'
                        }}
                      >
                        {ad.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      {editing === ad.location ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 350 }}>
                          <textarea
                            value={editCode}
                            onChange={e => setEditCode(e.target.value)}
                            rows={4}
                            style={{
                              padding: '8px 12px', borderRadius: 6, border: '1px solid var(--bg-glass-border)',
                              background: 'var(--bg-card)', color: 'var(--text-primary)',
                              fontSize: '0.8rem', fontFamily: 'monospace', resize: 'vertical'
                            }}
                            placeholder="Paste Adsterra script code here..."
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleSaveCode(ad)}>Save</button>
                            <button className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                          {ad.code ? ad.code.substring(0, 80) + '...' : 'No code set'}
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(ad.location); setEditCode(ad.code); }}>
                        Edit Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card" style={{ marginTop: 24 }}>
          <div className="dashboard-card-header">
            <h3>Global Ad Scripts</h3>
          </div>
          <div style={{ padding: '12px 0' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 12 }}>
              These scripts are loaded on every page via next/script with afterInteractive strategy.
            </p>
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 8, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              pl29606008.effectivecpmnetwork.com<br/>
              pl29606009.effectivecpmnetwork.com
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle = { padding: '12px 16px' };

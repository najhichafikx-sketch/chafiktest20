'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [maintenance, setMaintenance] = useState(false);
  const [globalPrompt, setGlobalPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchSettings(t) {
    const res = await fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${t}` }
    });
    if (res.status === 401) { localStorage.removeItem('admin_token'); router.push('/admin-login'); return; }
    const data = await res.json();
    if (data.success) {
      setMaintenance(data.settings.maintenance_mode);
      setGlobalPrompt(data.settings.global_system_prompt || '');
    }
  }

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin-login'); return; }
    startTransition(() => setToken(t));
    startTransition(() => fetchSettings(t));
  }, [router]);

  async function handleSave(key, value) {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      const data = await res.json();
      setMessage(data.message);
    } catch { setMessage('Save failed'); }
    finally { setLoading(false); }
  }

  return (
    <section className="section" style={{ paddingTop: '100px' }}>
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Site Settings</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Configure global site preferences</p>
          </div>
          <Link href="/admin" className="btn btn-secondary btn-sm">Back to Dashboard</Link>
        </div>

        {message && (
          <div style={{ padding: 12, marginBottom: 16, borderRadius: 8, background: 'var(--bg-glass)', color: message.includes('saved') ? 'var(--neon-green)' : '#ef4444' }}>
            {message}
          </div>
        )}

        <div className="dashboard-card" style={{ marginBottom: 24 }}>
          <div className="dashboard-card-header">
            <h3>Maintenance Mode</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Enable Maintenance Mode</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                When enabled, only admins can access the site
              </div>
            </div>
            <button
              onClick={() => { setMaintenance(!maintenance); handleSave('maintenance_mode', !maintenance); }}
              disabled={loading}
              style={{
                padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem',
                background: maintenance ? '#ef4444' : 'var(--neon-green)',
                color: maintenance ? '#fff' : '#000',
                opacity: loading ? 0.5 : 1
              }}
            >
              {maintenance ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>Global System Prompt</h3>
          </div>
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              This prompt is prepended to all AI generation requests
            </div>
            <textarea
              value={globalPrompt}
              onChange={e => setGlobalPrompt(e.target.value)}
              rows={6}
              style={{
                width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--bg-glass-border)',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem',
                resize: 'vertical', fontFamily: 'monospace'
              }}
              placeholder="Enter a global system prompt for all AI tools..."
            />
            <button
              className="btn btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => handleSave('global_system_prompt', globalPrompt)}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Prompt'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

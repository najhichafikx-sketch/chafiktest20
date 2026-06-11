'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminToolsPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [tools, setTools] = useState([]);
  const [models, setModels] = useState([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState({});

  async function fetchTools(t) {
    const res = await fetch('/api/admin/tools', {
      headers: { 'Authorization': `Bearer ${t}` }
    });
    if (res.status === 401) { localStorage.removeItem('admin_token'); router.push('/admin-login'); return; }
    const data = await res.json();
    if (data.success) {
      setTools(data.tools);
      setModels(data.availableModels || []);
    }
  }

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin-login'); return; }
    startTransition(() => setToken(t));
    startTransition(() => fetchTools(t));
  }, [router]);

  async function handleToggle(tool, enabled) {
    setSaving(p => ({ ...p, [tool.tool_id]: true }));
    setMessage('');
    try {
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_id: tool.tool_id, enabled, model: tool.model, system_prompt: tool.system_prompt })
      });
      const data = await res.json();
      if (data.success) {
        setTools(prev => prev.map(t => t.tool_id === tool.tool_id ? { ...t, enabled } : t));
      }
      setMessage(data.message);
    } catch { setMessage('Save failed'); }
    finally { setSaving(p => ({ ...p, [tool.tool_id]: false })); }
  }

  async function handleSave(tool, field, value) {
    setSaving(p => ({ ...p, [tool.tool_id]: true }));
    setMessage('');
    try {
      const updated = { ...tool, [field]: value };
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) setTools(prev => prev.map(t => t.tool_id === tool.tool_id ? updated : t));
      setMessage(data.message);
    } catch { setMessage('Save failed'); }
    finally { setSaving(p => ({ ...p, [tool.tool_id]: false })); }
  }

  return (
    <section className="section" style={{ paddingTop: '100px' }}>
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Tool Settings</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Enable/disable tools and configure models</p>
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
            <h3>All Tools ({tools.length})</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bg-glass-border)' }}>
                  <th style={thStyle}>Tool</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Model</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tools.map(tool => (
                  <tr key={tool.tool_id} style={{ borderBottom: '1px solid var(--bg-glass-border)' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{tool.tool_id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tool.tool_id}</div>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleToggle(tool, !tool.enabled)}
                        disabled={saving[tool.tool_id]}
                        style={{
                          padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                          fontWeight: 600, fontSize: '0.85rem',
                          background: tool.enabled ? 'var(--neon-green)' : '#ef4444',
                          color: tool.enabled ? '#000' : '#fff',
                          opacity: saving[tool.tool_id] ? 0.5 : 1
                        }}
                      >
                        {tool.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={tool.model}
                        onChange={e => handleSave(tool, 'model', e.target.value)}
                        disabled={saving[tool.tool_id]}
                        style={{
                          padding: '4px 8px', borderRadius: 6, border: '1px solid var(--bg-glass-border)',
                          background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem'
                        }}
                      >
                        {models.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      {saving[tool.tool_id] && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saving...</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle = { padding: '12px 16px' };

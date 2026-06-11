'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function ApiSettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin-login'); return; }
    startTransition(() => setToken(t));
    fetchStatus(t);
  }, [router]);

  async function fetchStatus(t) {
    const res = await fetch('/api/admin/settings/openrouter', {
      headers: { 'Authorization': `Bearer ${t}` }
    });
    if (res.status === 401) { localStorage.removeItem('admin_token'); router.push('/admin-login'); return; }
    const data = await res.json();
    setStatus(data);
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings/openrouter', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      const data = await res.json();
      setMessage(data.message);
      if (data.success) {
        setApiKey('');
        fetchStatus(token);
      }
    } catch {
      setMessage('Failed to save API key');
    } finally {
      setLoading(false);
    }
  }

  async function handleTest() {
    const keyToTest = apiKey || (status?.isConfigured ? '****' : '');
    if (!keyToTest || keyToTest === '****') {
      setTestResult('No API key to test');
      return;
    }
    setTestResult('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings/openrouter/test', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest })
      });
      const data = await res.json();
      setTestResult(data.message);
    } catch {
      setTestResult('Test failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" style={{ paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-badge">🔑 API Settings</span>
          <h1 className="section-title">OpenRouter Configuration</h1>
          <p className="section-subtitle">Configure your OpenRouter API key for AI generation</p>
        </div>

        {status && (
          <div className="glass-card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span>Status:</span>
              <span style={{ color: status.isConfigured ? 'var(--neon-green)' : '#ef4444', fontWeight: 600 }}>
                {status.isConfigured ? '✓ Configured' : '✗ Not configured'}
              </span>
            </div>
            {status.maskedKey && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>API Key:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{status.maskedKey}</span>
              </div>
            )}
          </div>
        )}

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">OpenRouter API Key</label>
              <input className="form-input" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-or-v1-..." required />
            </div>
            {message && <p style={{ color: message.includes('success') || message.includes('saved') ? 'var(--neon-green)' : '#ef4444', marginBottom: 16, fontSize: '0.9rem' }}>{message}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Key'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleTest} disabled={loading}>
                Test Connection
              </button>
            </div>
          </form>
          {testResult && (
            <p style={{ marginTop: 16, color: testResult.includes('successful') ? 'var(--neon-green)' : '#ef4444', fontWeight: 600 }}>
              {testResult}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

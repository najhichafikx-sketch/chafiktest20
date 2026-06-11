'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AutoPublisherClient() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [stats, setStats] = useState({ total: 0, today: 0, published: 0, estimatedRevenue: '0.00' });
  const [articles, setArticles] = useState([]);
  const [running, setRunning] = useState(false);
  const [articleCount, setArticleCount] = useState(5);
  const [dryRun, setDryRun] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin-login'); return; }
    startTransition(() => setToken(t));
  }, [router]);

  useEffect(() => {
    if (token) refreshData(token);
  }, [token]);

  async function refreshData(t) {
    try {
      const res = await fetch('/api/admin/auto-publisher/status', {
        headers: { 'Authorization': `Bearer ${t || token}` }
      });
      if (res.status === 401) { localStorage.removeItem('admin_token'); router.push('/admin-login'); return; }
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      if (data.articles) setArticles(data.articles);
    } catch (err) {
      console.error('Failed to refresh:', err);
    }
  }

  async function runNow() {
    if (running) return;

    if (!confirm(`Generate ${articleCount} articles? ${dryRun ? '(DRY RUN - will not publish)' : '(Will publish to chafiktech.com)'}`)) {
      return;
    }

    setRunning(true);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `Starting run for ${articleCount} articles...` }]);

    try {
      const res = await fetch('/api/admin/auto-publisher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ articlesPerDay: articleCount, dryRun })
      });

      const data = await res.json();

      if (data.success) {
        setLastRun(data.results);
        setLogs(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString(), msg: `Published: ${data.results.published}` },
          { time: new Date().toLocaleTimeString(), msg: `Drafts: ${data.results.draft || 0}` },
          { time: new Date().toLocaleTimeString(), msg: `Failed: ${data.results.failed}` }
        ]);
        await refreshData(token);
      } else {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `Network error: ${err.message}` }]);
    } finally {
      setRunning(false);
    }
  }

  async function unpublishArticle(id) {
    if (!confirm('Unpublish this article?')) return;

    try {
      const res = await fetch(`/api/admin/auto-publisher/article/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) await refreshData(token);
    } catch (err) {
      alert('Failed to unpublish: ' + err.message);
    }
  }

  return (
    <AdminLayout>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            Auto-Publisher
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Automated daily trending article generator. Hidden from regular users.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <StatCard label="Total Articles" value={stats.total || 0} icon="📚" color="#00d4ff" />
          <StatCard label="Published" value={stats.published || 0} icon="✅" color="#00ff88" />
          <StatCard label="Today" value={stats.today || 0} icon="📅" color="#7b2ff7" />
          <StatCard label="Est. Monthly Revenue" value={`$${stats.estimatedRevenue || 0}`} icon="💰" color="#ffaa00" />
        </div>

        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Manual Control</h2>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                Articles to generate
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={articleCount}
                onChange={(e) => setArticleCount(parseInt(e.target.value) || 5)}
                style={{
                  width: '80px',
                  padding: '10px',
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#e5e5e5',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                />
                <span>Dry run (don't publish)</span>
              </label>
            </div>

            <button
              onClick={runNow}
              disabled={running}
              style={{
                padding: '10px 24px',
                background: running ? '#555' : 'linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: running ? 'not-allowed' : 'pointer',
                opacity: running ? 0.6 : 1
              }}
            >
              {running ? 'Running...' : 'Run Now'}
            </button>

            <button
              onClick={() => refreshData(token)}
              style={{
                padding: '10px 16px',
                background: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                color: '#e5e5e5',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>

          {lastRun && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#0a0a0a', borderRadius: '6px', fontSize: '13px' }}>
              <strong>Last run:</strong> {lastRun.published} published, {lastRun.failed} failed, {lastRun.draft || 0} drafts
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', marginBottom: '24px', maxHeight: '200px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Live Logs</h3>
            {logs.slice(-20).map((log, i) => (
              <div key={i} style={{ fontSize: '12px', fontFamily: 'monospace', color: '#888', marginBottom: '4px' }}>
                <span style={{ color: '#00d4ff' }}>[{log.time}]</span> {log.msg}
              </div>
            ))}
          </div>
        )}

        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2a2a' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Articles</h2>
          </div>

          {articles.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#888' }}>
              No articles yet. Click "Run Now" to generate your first batch.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Words</th>
                  <th style={thStyle}>SEO</th>
                  <th style={thStyle}>Published</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                    <td style={tdStyle}>
                      <a href={`/blog/${a.slug}`} target="_blank" style={{ color: '#00d4ff', textDecoration: 'none' }}>
                        {a.title}
                      </a>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: a.status === 'published' ? 'rgba(0,255,136,0.1)' : 'rgba(255,170,0,0.1)',
                        color: a.status === 'published' ? '#00ff88' : '#ffaa00'
                      }}>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>
                      {a.source || 'manual'}
                    </td>
                    <td style={tdStyle}>{a.word_count || '--'}</td>
                    <td style={tdStyle}>{a.seo_score || '--'}/100</td>
                    <td style={{ ...tdStyle, fontSize: '12px', color: '#888' }}>
                      {a.published_at ? new Date(a.published_at).toLocaleDateString() : '--'}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => unpublishArticle(a.id)}
                        style={{
                          padding: '4px 10px',
                          background: 'transparent',
                          border: '1px solid #ff4444',
                          borderRadius: '4px',
                          color: '#ff4444',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Unpublish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '11px',
  color: '#888',
  textTransform: 'uppercase',
  fontWeight: 500
};

const tdStyle = {
  padding: '12px 16px',
  fontSize: '13px',
  color: '#e5e5e5'
};

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

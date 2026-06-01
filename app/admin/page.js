'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin-login'); return; }
    setToken(t);
    fetchStatus(t);
    fetchLogs(t);
  }, [router]);

  async function fetchStatus(t) {
    const res = await fetch('/api/admin/status', {
      headers: { 'Authorization': `Bearer ${t}` }
    });
    if (res.status === 401) { localStorage.removeItem('admin_token'); router.push('/admin-login'); return; }
    const data = await res.json();
    setStatus(data);
  }

  async function fetchLogs(t) {
    const res = await fetch('/api/admin/logs', {
      headers: { 'Authorization': `Bearer ${t}` }
    });
    const data = await res.json();
    setLogs(Array.isArray(data) ? data : []);
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    router.push('/admin-login');
  }

  if (!status) return <div className="section" style={{ paddingTop: '120px', textAlign: 'center' }}>Loading...</div>;

  return (
    <section className="section" style={{ paddingTop: '100px' }}>
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>System overview and management</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/admin/tools" className="btn btn-secondary btn-sm">Tools</Link>
            <Link href="/admin/ads" className="btn btn-secondary btn-sm">Ads</Link>
            <Link href="/admin/analytics" className="btn btn-secondary btn-sm">Analytics</Link>
            <Link href="/admin/settings" className="btn btn-secondary btn-sm">Settings</Link>
            <Link href="/admin/api-settings" className="btn btn-secondary btn-sm">API Keys</Link>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="dashboard-stats">
          <StatCard icon="🔧" label="Total Tools" value={status.totalTools || 0} iconClass="purple" />
          <StatCard icon="✅" label="Active Tools" value={status.activeTools || 0} iconClass="green" />
          <StatCard icon="🔄" label="Mock Tools" value={status.mockTools || 0} iconClass={status.mockTools > 0 ? 'down' : 'green'} />
          <StatCard icon="📡" label="API Status" value={status.apiStatus || 'Offline'} iconClass={status.apiStatus === 'Online' ? 'green' : 'down'} />
        </div>

        <div className="dashboard-card" style={{ marginTop: 24 }}>
          <div className="dashboard-card-header">
            <h3>System Status</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <InfoRow label="System Health" value={status.systemHealth} />
            <InfoRow label="Missing Keys" value={status.missingKeys} />
            <InfoRow label="Uptime" value={`${Math.floor(status.uptime || 0)}s`} />
          </div>
        </div>

        <div className="dashboard-card" style={{ marginTop: 24 }}>
          <div className="dashboard-card-header">
            <h3>Recent Activity Logs</h3>
          </div>
          {logs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No logs yet</p>
          ) : (
            <div className="activity-list">
              {logs.slice(0, 20).map((log, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-icon">{log.level === 'ERROR' ? '❌' : log.level === 'WARN' ? '⚠️' : '✅'}</div>
                  <div className="activity-details">
                    <h4>{log.message}</h4>
                    <p>{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, iconClass }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-card-icon ${iconClass}`}>{icon}</div>
        <span className={`stat-card-badge ${String(value) === 'Offline' || Number(value) > 0 ? 'up' : 'down'}`}>
          {String(value) === 'Online' ? '↑ Live' : String(value) === 'Offline' ? '↓ Offline' : ''}
        </span>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg-glass-border)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

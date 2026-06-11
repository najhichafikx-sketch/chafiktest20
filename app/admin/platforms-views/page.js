'use client';

import { useState, useEffect, startTransition } from 'react';
import AdminLayout from '@/components/AdminLayout';

const SETTINGS_KEYS = {
  registration_bonus: { label: 'Registration Bonus (credits)', type: 'number', min: 0, default: 10 },
  credit_cost_per_minute: { label: 'Credit Cost per Video Minute', type: 'number', min: 1, default: 2 },
  watch_reward_per_minute: { label: 'Watch Reward per Minute', type: 'number', min: 1, default: 1 },
  watch_bonus_completion: { label: 'Completion Bonus (credits)', type: 'number', min: 0, default: 2 },
  min_watch_seconds: { label: 'Minimum Watch Seconds', type: 'number', min: 1, default: 10 },
  anti_abuse_min_seconds: { label: 'Anti-Abuse Min Seconds', type: 'number', min: 1, default: 5 },
  max_daily_watch_earnings: { label: 'Max Daily Watch Earnings', type: 'number', min: 1, default: 50 },
  queue_batch_size: { label: 'Queue Batch Size', type: 'number', min: 5, default: 20 },
  new_user_visibility_boost: { label: 'New User Visibility Boost', type: 'number', min: 0, max: 1, step: 0.1, default: 0.5 }
};

export default function AdminPlatformsViewsPage() {
  const [token, setToken] = useState(null);
  const [tab, setTab] = useState('settings');
  const [settings, setSettings] = useState({});
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [grantUserId, setGrantUserId] = useState('');
  const [grantAmount, setGrantAmount] = useState(10);
  const [grantDesc, setGrantDesc] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    startTransition(() => setToken(t));
    if (t) { fetchSettings(t); fetchVideos(t); }
  }, []);

  async function fetchSettings(t) {
    const res = await fetch('/api/admin/platforms/settings', { headers: { Authorization: `Bearer ${t}` } });
    if (res.status === 401) return;
    const data = await res.json();
    if (data.success) { setSettings(data.settings || {}); setStats(data.stats); }
  }

  async function fetchVideos(t) {
    const res = await fetch('/api/admin/platforms/videos', { headers: { Authorization: `Bearer ${t}` } });
    if (res.status === 401) return;
    const data = await res.json();
    if (data.success) { setVideos(data.videos || []); setUsers(data.users || []); }
  }

  async function handleSaveSetting(key, value) {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/platforms/settings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: Number(value) })
      });
      const data = await res.json();
      setMessage(data.success ? '✅ Saved' : '❌ ' + (data.error || 'Failed'));
      if (data.success) setSettings(p => ({ ...p, [key]: Number(value) }));
    } catch { setMessage('❌ Network error'); }
    finally { setSaving(false); }
  }

  async function handleGrantCredits() {
    if (!grantUserId || !grantAmount) return;
    setMessage('');
    try {
      const res = await fetch('/api/admin/platforms/credits', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: grantUserId, action: 'grant', amount: Number(grantAmount), description: grantDesc || 'Admin grant' })
      });
      const data = await res.json();
      setMessage(data.success ? `✅ ${data.message}` : '❌ ' + (data.error || 'Failed'));
      if (data.success) fetchSettings(token);
    } catch { setMessage('❌ Network error'); }
  }

  async function handleVideoAction(videoId, action) {
    try {
      const res = await fetch('/api/admin/platforms/videos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, action })
      });
      const data = await res.json();
      setMessage(data.success ? `✅ ${data.message}` : '❌ ' + (data.error || 'Failed'));
      if (data.success) fetchVideos(token);
    } catch { setMessage('❌ Network error'); }
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { id: 'settings', label: '⚙️ Settings' },
            { id: 'videos', label: '🎬 Videos' },
            { id: 'users', label: '👥 Users' },
            { id: 'credits', label: '💰 Credits' },
            { id: 'stats', label: '📊 Stats' }
          ].map(t => (
            <button key={t.id} className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {message && (
          <div style={{ padding: '8px 16px', borderRadius: 8, marginBottom: 16, background: message.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: message.startsWith('✅') ? 'var(--neon-green)' : '#ef4444', fontSize: '0.85rem' }}>{message}</div>
        )}

        {tab === 'settings' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Credit System Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(SETTINGS_KEYS).map(([key, cfg]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, minWidth: 200 }}>{cfg.label}</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      className="form-input"
                      type={cfg.type}
                      min={cfg.min}
                      max={cfg.max}
                      step={cfg.step}
                      style={{ width: 120 }}
                      value={settings[key] ?? cfg.default}
                      onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveSetting(key, settings[key] ?? cfg.default)} disabled={saving}>Save</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'videos' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Video Moderation ({videos.length})</h3>
            {videos.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No videos submitted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {videos.map(v => (
                  <div key={v.id} className="glass-card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, wordBreak: 'break-all' }}>{v.title || v.url?.substring(0, 50)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{v.id} · {v.category} · {v.language} · {v.duration_minutes}min</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Views: {v.views} · Reviews: {v.reviews} · Priority: {v.priority?.toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, background: v.status === 'active' ? 'rgba(34,197,94,0.15)' : v.status === 'flagged' ? 'rgba(239,68,68,0.15)' : 'rgba(100,100,100,0.15)', color: v.status === 'active' ? 'var(--neon-green)' : v.status === 'flagged' ? '#ef4444' : 'var(--text-muted)' }}>{v.status}</span>
                      {v.status !== 'flagged' && <button className="btn btn-outline btn-sm" onClick={() => handleVideoAction(v.id, 'flag')}>Flag</button>}
                      {v.status !== 'active' && <button className="btn btn-outline btn-sm" onClick={() => handleVideoAction(v.id, 'approve')}>Approve</button>}
                      <button className="btn btn-outline btn-sm" style={{ color: '#ef4444' }} onClick={() => handleVideoAction(v.id, 'delete')}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Users ({users.length})</h3>
            {users.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No users yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {users.map(u => (
                  <div key={u.id} className="glass-card" style={{ padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <div style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{u.id?.substring(0, 24)}...</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>💳 {u.credits}</span>
                      <span>📈 {u.total_earned}</span>
                      <span>📉 {u.total_spent}</span>
                      <span>🎬 {u.videos_submitted}</span>
                      <span>💬 {u.feedback_given}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'credits' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Grant / Manage Credits</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
              <div className="form-group">
                <label className="form-label">User ID</label>
                <input className="form-input" type="text" placeholder="Enter user ID..." value={grantUserId} onChange={e => setGrantUserId(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input className="form-input" type="number" min={1} value={grantAmount} onChange={e => setGrantAmount(parseInt(e.target.value) || 1)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" type="text" placeholder="Reason..." value={grantDesc} onChange={e => setGrantDesc(e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleGrantCredits}>Grant Credits</button>
            </div>
          </div>
        )}

        {tab === 'stats' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {[
                { label: 'Total Users', value: stats.total_users },
                { label: 'Active Videos', value: stats.active_videos },
                { label: 'Total Credits', value: stats.total_credits },
                { label: 'Today Txns', value: stats.today_transactions },
                { label: 'Today Earned', value: stats.today_credits_earned },
                { label: 'Today Spent', value: Math.abs(stats.today_credits_spent) }
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{s.label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

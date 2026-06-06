'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Wrench, Megaphone, DollarSign, BarChart3,
  Settings, Key, Globe, SearchX, FileText, Newspaper,
  MessageSquare, Users, LogOut, Brain, CheckCircle2, XCircle, Eye, EyeOff
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);

  const [aiKeyInput, setAiKeyInput] = useState('');
  const [aiKeyVisible, setAiKeyVisible] = useState(false);
  const [aiKeyConfigured, setAiKeyConfigured] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiTestResult, setAiTestResult] = useState('');
  const [aiTesting, setAiTesting] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin-login'); return; }
    setToken(t);
    fetchStatus(t);
    fetchLogs(t);
    fetchAiSettings(t);
  }, [router]);

  async function fetchStatus(t) {
    const res = await fetch('/api/admin/status', {
      headers: { 'Authorization': `Bearer ${t}` }
    });
    if (res.status === 401) { localStorage.removeItem('admin_token'); router.push('/admin-login'); return; }
    const data = await res.json();
    setStatus(data);
    if (typeof data.dailyLandingPageUsage === 'number') {
      setDailyUsage(data.dailyLandingPageUsage);
    }
  }

  async function fetchLogs(t) {
    const res = await fetch('/api/admin/logs', {
      headers: { 'Authorization': `Bearer ${t}` }
    });
    const data = await res.json();
    setLogs(Array.isArray(data) ? data : []);
  }

  async function fetchAiSettings(t) {
    try {
      const res = await fetch('/api/admin/settings/openrouter', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      const data = await res.json();
      if (data.success) {
        setAiKeyConfigured(!!data.isConfigured);
      }
    } catch (e) {}
  }

  async function handleSaveKey(e) {
    e?.preventDefault();
    if (!aiKeyInput.trim() || aiSaving) return;
    setAiSaving(true);
    setAiMessage('');
    try {
      const res = await fetch('/api/admin/settings/openrouter', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: aiKeyInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setAiMessage('✅ ' + (data.message || 'تم الحفظ'));
        setAiKeyInput('');
        setAiKeyConfigured(true);
        fetchStatus(token);
      } else {
        setAiMessage('❌ ' + (data.message || 'فشل الحفظ'));
      }
    } catch (e) {
      setAiMessage('❌ Network error');
    } finally {
      setAiSaving(false);
    }
  }

  async function handleTestConnection() {
    if (aiTesting) return;
    setAiTesting(true);
    setAiTestResult('');
    try {
      const keyToTest = aiKeyInput.trim() || '****';
      const res = await fetch('/api/admin/settings/openrouter/test', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest })
      });
      const data = await res.json();
      if (data.success) {
        setAiTestResult('✓ الاتصال ناجح');
      } else {
        setAiTestResult('✗ فشل الاتصال');
      }
    } catch {
      setAiTestResult('✗ فشل الاتصال');
    } finally {
      setAiTesting(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    router.push('/admin-login');
  }

  if (!status) return (
    <div style={{ paddingTop: '120px', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div className="spinner-border" role="status" />
      <p className="mt-2">Loading dashboard...</p>
    </div>
  );

  const navCards = [
    { icon: Wrench, label: 'Tools', desc: 'Manage AI tools and configurations', href: '/admin/tools', color: '#8b5cf6' },
    { icon: DollarSign, label: 'Revenue', desc: 'Revenue statistics and reports', href: '/admin/revenue-dashboard', color: '#10b981' },
    { icon: BarChart3, label: 'Analytics', desc: 'Traffic and engagement metrics', href: '/admin/analytics', color: '#3b82f6' },
    { icon: Settings, label: 'Settings', desc: 'General site configuration', href: '/admin/settings', color: '#6b7280' },
    { icon: Key, label: 'API Keys', desc: 'Manage API credentials', href: '/admin/api-settings', color: '#ec4899' },
    { icon: Globe, label: 'Platforms', desc: 'Connected platform management', href: '/admin/platforms-views', color: '#14b8a6' },
    { icon: FileText, label: 'Content', desc: 'Content management overview', href: '/admin/blog', color: '#a855f7' },
    { icon: Newspaper, label: 'Blog Articles', desc: 'Write and manage blog posts', href: '/admin/blog-articles', color: '#2563eb' },
    { icon: MessageSquare, label: 'Prompt Articles', desc: 'Create and manage prompts', href: '/admin/prompts', color: '#06b6d4' },
    { icon: Users, label: 'Users', desc: 'User account management', href: '/admin/users', color: '#84cc16' },
  ];

  const aiConnected = status?.apiStatus === 'Online';

  const aiInputStyle = {
    flex: 1,
    padding: '10px 14px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--bg-glass-border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    direction: 'ltr'
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>System overview and management</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatBox icon={Wrench} label="Total Tools" value={status.totalTools || 0} color="#8b5cf6" />
        <StatBox icon={BarChart3} label="Active Tools" value={status.activeTools || 0} color="#10b981" />
        <StatBox icon={Settings} label="Mock Tools" value={status.mockTools || 0} color={status.mockTools > 0 ? '#f59e0b' : '#10b981'} />
        <StatBox icon={Globe} label="API Status" value={status.apiStatus || 'Offline'} color={status.apiStatus === 'Online' ? '#10b981' : '#ef4444'} />
        <StatBox icon={LayoutDashboard} label="Uptime" value={`${Math.floor(status.uptime || 0)}s`} color="#3b82f6" />
        <StatBox icon={SearchX} label="Missing Keys" value={status.missingKeys || 0} color={status.missingKeys > 0 ? '#ef4444' : '#10b981'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 20 }}>
        {navCards.map((card, i) => (
          <Link key={i} href={card.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--bg-glass-border)',
              borderRadius: 12,
              padding: 24,
              cursor: 'pointer',
              transition: 'all 0.2s',
              height: '100%'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${card.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16
              }}>
                <card.icon size={24} color={card.color} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px 0' }}>{card.label}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--bg-glass-border)',
        borderRadius: 12,
        marginTop: 24,
        padding: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Brain size={20} color="#a855f7" />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>إعدادات الذكاء الاصطناعي</h3>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}>AI Settings</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: aiConnected ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: aiConnected ? '#10b981' : '#ef4444', border: `1px solid ${aiConnected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            {aiConnected ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {aiConnected ? 'متصل ✓' : 'غير مُعيَّن'}
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.6 }}>
          OpenRouter API Key — مفتاح الـ AI الذي يستخدمه الموقع لإنشاء المحتوى. يُدار مركزياً ولا يظهر للمستخدمين.
        </p>

        <form onSubmit={handleSaveKey} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
              <input
                type={aiKeyVisible ? 'text' : 'password'}
                value={aiKeyInput}
                onChange={e => setAiKeyInput(e.target.value)}
                placeholder="sk-or-v1-..."
                style={{ ...aiInputStyle, paddingRight: 44, width: '100%' }}
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={() => setAiKeyVisible(v => !v)}
                aria-label={aiKeyVisible ? 'Hide' : 'Show'}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                  cursor: 'pointer', padding: 4, display: 'flex'
                }}
              >
                {aiKeyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={aiSaving || !aiKeyInput.trim()}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 14, fontWeight: 600 }}
            >
              {aiSaving ? '⏳ جاري الحفظ...' : '💾 حفظ'}
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={aiTesting}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 14, fontWeight: 600 }}
            >
              {aiTesting ? '⏳ جاري الاختبار...' : '🔌 Test Connection'}
            </button>
          </div>

          {aiMessage && (
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: aiMessage.startsWith('✅') ? '#10b981' : '#ef4444',
              padding: '8px 12px', background: aiMessage.startsWith('✅') ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              borderRadius: 8, border: `1px solid ${aiMessage.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
            }}>
              {aiMessage}
            </div>
          )}

          {aiTestResult && (
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: aiTestResult.startsWith('✓') ? '#10b981' : '#ef4444',
              padding: '8px 12px', background: aiTestResult.startsWith('✓') ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              borderRadius: 8, border: `1px solid ${aiTestResult.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
            }}>
              {aiTestResult}
            </div>
          )}
        </form>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', background: 'var(--bg-tertiary)',
          border: '1px solid var(--bg-glass-border)', borderRadius: 8,
          fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)'
        }}>
          <span>📊 إجمالي الطلبات اليوم:</span>
          <strong style={{ color: 'var(--text-primary)', fontSize: 16 }}>{dailyUsage}</strong>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--bg-glass-border)',
        borderRadius: 12,
        marginTop: 24,
        padding: 24
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0' }}>Recent Activity Logs</h3>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No logs yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {logs.slice(0, 20).map((log, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8
              }}>
                <span style={{ fontSize: 18 }}>
                  {log.level === 'ERROR' ? '❌' : log.level === 'WARN' ? '⚠️' : '✅'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{log.message}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-glass)',
      border: '1px solid var(--bg-glass-border)',
      borderRadius: 12,
      padding: 20,
      textAlign: 'center'
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 8px'
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

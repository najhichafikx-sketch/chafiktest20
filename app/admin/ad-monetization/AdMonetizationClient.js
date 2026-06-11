'use client';

import { useEffect, useState, useCallback, startTransition } from 'react';
import { ADS_CONFIG, AD_SLOTS } from '@/lib/adSystem';

const TIMEFRAMES = [
  { id: '24h', label: '24 hours' },
  { id: '7d', label: '7 days' }
];

function StatCard({ label, value, hint, color = '#6c63ff' }) {
  return (
    <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16, flex: '1 1 180px', minWidth: 160 }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Bar({ value, max, color = '#6c63ff' }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div style={{ background: '#0f0f1a', height: 6, borderRadius: 3, overflow: 'hidden', minWidth: 80 }}>
      <div style={{ width: pct + '%', height: '100%', background: color, transition: 'width 0.4s' }} />
    </div>
  );
}

function BreakdownTable({ title, data, valueKey, labelKey = 'name', color = '#6c63ff' }) {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, v]) => v[valueKey] || 0));
  return (
    <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
      <h3 style={{ margin: '0 0 12px', color: '#fff', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h3>
      {entries.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>No data yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.sort((a, b) => (b[1][valueKey] || 0) - (a[1][valueKey] || 0)).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#cbd5e1', minWidth: 90 }}>{k}</span>
              <Bar value={v[valueKey] || 0} max={max} color={color} />
              <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 50, textAlign: 'right' }}>{v[valueKey] || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdMonetizationClient() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await fetch(`/api/ads/stats?tf=${timeframe}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setStats(data.stats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeframe]);

  useEffect(() => {
    startTransition(() => setLoading(true));
    startTransition(() => load());
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const summary = stats?.last24h || { impressions: 0, clicks: 0, revenue: 0, rpm: 0, ctr: 0, pageViews: 0, blocked: 0, uniqueVisitors: 0, uniqueSessions: 0 };

  return (
    <div style={{ padding: 24, color: '#e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: '#fff' }}>💰 Ad Monetization</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13 }}>Smart ad controller analytics & configuration</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {TIMEFRAMES.map(t => (
            <button key={t.id} onClick={() => setTimeframe(t.id)}
              style={{ background: timeframe === t.id ? 'linear-gradient(135deg, #6c63ff, #f72585)' : '#2d2d4e', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
          <button onClick={() => { setRefreshing(true); load(); }} disabled={refreshing}
            style={{ background: '#2d2d4e', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: refreshing ? 'wait' : 'pointer' }}>
            {refreshing ? '⏳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 10, padding: 14, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 36, textAlign: 'center' }}>
          <div style={{ width: 50, height: 50, border: '4px solid #2d2d4e', borderTopColor: '#6c63ff', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading ad analytics...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <StatCard label="Revenue (est.)" value={'$' + summary.revenue.toFixed(2)} hint="Based on CPM model" color="#10b981" />
            <StatCard label="RPM" value={'$' + summary.rpm.toFixed(2)} hint="Per 1,000 page views" color="#f72585" />
            <StatCard label="Impressions" value={summary.impressions} hint={`${summary.clicks} clicks`} color="#6c63ff" />
            <StatCard label="CTR" value={summary.ctr + '%'} hint="Click-through rate" color="#fbbf24" />
            <StatCard label="Page Views" value={summary.pageViews} hint={`${summary.uniqueVisitors} unique visitors`} color="#a5b4fc" />
            <StatCard label="Blocked" value={summary.blocked} hint="Anti-annoyance blocks" color="#ef4444" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginBottom: 18 }}>
            <BreakdownTable title="By Network" data={stats?.byNetwork} valueKey="impressions" color="#6c63ff" />
            <BreakdownTable title="By Device" data={stats?.byDevice} valueKey="impressions" color="#10b981" />
            <BreakdownTable title="By Page Type" data={stats?.byPageType} valueKey="impressions" color="#fbbf24" />
            <BreakdownTable title="By Ad Type" data={stats?.byAdType} valueKey="impressions" color="#f72585" />
          </div>

          {stats?.blockReasons && Object.keys(stats.blockReasons).length > 0 && (
            <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16, marginBottom: 18 }}>
              <h3 style={{ margin: '0 0 12px', color: '#fff', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Block Reasons</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(stats.blockReasons).map(([k, v]) => (
                  <div key={k} style={{ background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 6, padding: '6px 10px', fontSize: 11 }}>
                    <span style={{ color: '#94a3b8' }}>{k}:</span> <span style={{ color: '#fca5a5', fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16, marginBottom: 18 }}>
            <h3 style={{ margin: '0 0 12px', color: '#fff', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>⚙️ Active Configuration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 12 }}>
              <div><span style={{ color: '#94a3b8' }}>Enabled:</span> <span style={{ color: ADS_CONFIG.enabled ? '#10b981' : '#ef4444', fontWeight: 700 }}>{String(ADS_CONFIG.enabled)}</span></div>
              <div><span style={{ color: '#94a3b8' }}>Version:</span> <span style={{ color: '#fff' }}>{ADS_CONFIG.version}</span></div>
              <div><span style={{ color: '#94a3b8' }}>Popunder cap:</span> <span style={{ color: '#fff' }}>{ADS_CONFIG.frequency.popunderHours}h</span></div>
              <div><span style={{ color: '#94a3b8' }}>New user grace:</span> <span style={{ color: '#fff' }}>{ADS_CONFIG.timing.newUserGraceSeconds}s</span></div>
              <div><span style={{ color: '#94a3b8' }}>Social bar delay:</span> <span style={{ color: '#fff' }}>{ADS_CONFIG.timing.socialBarDelayMs}ms</span></div>
              <div><span style={{ color: '#94a3b8' }}>Popunder probability:</span> <span style={{ color: '#fff' }}>{Math.round(ADS_CONFIG.probability.popunderOnInteraction * 100)}%</span></div>
              <div><span style={{ color: '#94a3b8' }}>Mobile reduction:</span> <span style={{ color: '#fff' }}>{Math.round(ADS_CONFIG.probability.mobileAdReduction * 100)}%</span></div>
              <div><span style={{ color: '#94a3b8' }}>A/B Testing:</span> <span style={{ color: ADS_CONFIG.abTesting.enabled ? '#10b981' : '#64748b', fontWeight: 700 }}>{String(ADS_CONFIG.abTesting.enabled)}</span></div>
              <div><span style={{ color: '#94a3b8' }}>Bounce protection:</span> <span style={{ color: ADS_CONFIG.bounceProtection.enabled ? '#10b981' : '#64748b', fontWeight: 700 }}>{String(ADS_CONFIG.bounceProtection.enabled)}</span></div>
              <div><span style={{ color: '#94a3b8' }}>Respect DNT:</span> <span style={{ color: ADS_CONFIG.antiAnnoyance.respectDoNotTrack ? '#10b981' : '#64748b', fontWeight: 700 }}>{String(ADS_CONFIG.antiAnnoyance.respectDoNotTrack)}</span></div>
            </div>
          </div>

          <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', color: '#fff', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>📌 Ad Slots</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
              {Object.entries(AD_SLOTS).map(([id, cfg]) => (
                <div key={id} style={{ background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 6, padding: 10, fontSize: 11 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 12 }}>{id}</div>
                  <div style={{ color: '#94a3b8', marginTop: 2 }}>page: {cfg.page}</div>
                  <div style={{ color: '#94a3b8' }}>network: {cfg.network}</div>
                  <div style={{ color: '#64748b', marginTop: 2 }}>{cfg.sizes.map(s => `${s[0]}x${s[1]}`).join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

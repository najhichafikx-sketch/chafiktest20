'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

const FLAG_CODES = {
  'Morocco': '🇲🇦', 'Algeria': '🇩🇿', 'Tunisia': '🇹🇳', 'Libya': '🇱🇾', 'Egypt': '🇪🇬',
  'Saudi Arabia': '🇸🇦', 'UAE': '🇦🇪', 'Qatar': '🇶🇦', 'Kuwait': '🇰🇼', 'Bahrain': '🇧🇭', 'Oman': '🇴🇲',
  'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'France': '🇫🇷', 'Spain': '🇪🇸', 'Germany': '🇩🇪',
  'Italy': '🇮🇹', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪', 'Switzerland': '🇨🇭',
  'Canada': '🇨🇦', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷', 'Argentina': '🇦🇷',
  'India': '🇮🇳', 'China': '🇨🇳', 'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Australia': '🇦🇺', 'Russia': '🇷🇺',
  'Turkey': '🇹🇷', 'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Ireland': '🇮🇪',
  'Nigeria': '🇳🇬', 'South Africa': '🇿🇦', 'Senegal': '🇸🇳', 'Ghana': '🇬🇭',
  'Israel': '🇮🇱', 'Jordan': '🇯🇴', 'Lebanon': '🇱🇧', 'Palestine': '🇵🇸', 'Iraq': '🇮🇶', 'Syria': '🇸🇾',
  'Yemen': '🇾🇪', 'Sudan': '🇸🇩', 'Mauritania': '🇲🇷'
};

export default function BlogStatsPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin-login'); return; }
    startTransition(() => setToken(t));
  }, [router]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/blog-stats', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxCountry = Math.max(...(stats?.topCountries || []).map(c => c.count), 1);

  return (
    <AdminLayout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
          Blog Statistics
        </h1>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>
        ) : !stats ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No data yet</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <StatCard label="Views Today" value={stats.today || 0} color="#00d4ff" />
              <StatCard label="Last 7 Days" value={stats.last7Total || 0} color="#00ff88" />
              <StatCard label="All Time Views" value={stats.allTime || 0} color="#7b2ff7" />
              <StatCard label="Countries" value={(stats.topCountries || []).length} color="#ffaa00" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Daily Views (7 Days)</h2>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px' }}>
                  {(stats.dailyViews || []).map((d, i) => {
                    const maxCount = Math.max(...(stats.dailyViews || []).map(x => x.count), 1);
                    const pct = (d.count / maxCount) * 100;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{d.count}</span>
                        <div style={{
                          width: '100%', height: `${pct}%`, minHeight: '4px', borderRadius: '4px 4px 0 0',
                          background: 'linear-gradient(180deg, #00d4ff, #7b2ff7)',
                          transition: 'height 0.3s'
                        }} />
                        <span style={{ fontSize: '10px', color: '#666', marginTop: '6px' }}>{days[new Date(d.date + 'T00:00:00').getDay()]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Views by Country (7 Days)</h2>
                {(stats.topCountries || []).length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No data yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(stats.topCountries || []).map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>{FLAG_CODES[c.country] || '🌍'}</span>
                        <span style={{ fontSize: '13px', color: '#e5e5e5', minWidth: '110px' }}>{c.country}</span>
                        <div style={{ flex: 1, height: '20px', background: '#2a2a2a', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${(c.count / maxCountry) * 100}%`, height: '100%',
                            background: 'linear-gradient(90deg, #7b2ff7, #00d4ff)',
                            borderRadius: '10px', transition: 'width 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                            paddingRight: '6px', minWidth: '30px'
                          }}>
                            <span style={{ fontSize: '10px', color: '#fff', fontWeight: 600 }}>{c.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Top Articles (7 Days)</h2>
              {stats.topArticles?.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No views recorded yet</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Article</th>
                      <th style={thStyle}>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.topArticles || []).map((a, i) => (
                      <tr key={a.slug} style={{ borderBottom: '1px solid #2a2a2a' }}>
                        <td style={tdStyle}>{i + 1}</td>
                        <td style={tdStyle}>
                          <a href={`/blog/${a.slug}`} target="_blank" style={{ color: '#00d4ff', textDecoration: 'none' }}>
                            {a.slug}
                          </a>
                        </td>
                        <td style={tdStyle}>{a.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 500 };
const tdStyle = { padding: '10px 12px', fontSize: '13px', color: '#e5e5e5' };

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
      <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

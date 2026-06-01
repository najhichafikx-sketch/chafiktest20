'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d);
        else setError(d.message || 'Failed to load analytics');
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="alert alert-danger">{error}</div>
      </AdminLayout>
    );
  }

  const { stats, topTools, adPerformance, dailyTraffic, toolRevenue } = data || {};
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AdminLayout>
      <h1 className="h3 mb-4">Analytics Dashboard</h1>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center p-3">
            <h5>Page Views (7d)</h5>
            <h2 className="text-primary">{stats?.pageViews7d || 0}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-3">
            <h5>Tool Usage (7d)</h5>
            <h2 className="text-success">{stats?.toolUsage7d || 0}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-3">
            <h5>Ad Impressions (7d)</h5>
            <h2 className="text-warning">{stats?.adImpressions7d || 0}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-3">
            <h5>Overall CTR</h5>
            <h2 className="text-danger">{stats?.overallCTR || '0%'}</h2>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card p-3">
            <h5 className="card-title">Top Tools</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Uses (7d)</th>
                  </tr>
                </thead>
                <tbody>
                  {topTools?.length > 0 ? topTools.map((t, i) => (
                    <tr key={t.tool_id || i}>
                      <td>{t.tool_id || t.metadata?.toolId || 'Unknown'}</td>
                      <td>{t.count ? parseInt(t.count).toLocaleString() : parseInt(t.usage_count).toLocaleString()}</td>
                    </tr>
                  )) : <tr><td colSpan="2" className="text-muted">No data yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h5 className="card-title">Ad Performance (CTR per Slot)</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {adPerformance?.length > 0 ? adPerformance.map((a, i) => (
                    <tr key={a.slot || i}>
                      <td>{a.slot}</td>
                      <td>{a.impressions}</td>
                      <td>{a.clicks}</td>
                      <td>{a.ctr}</td>
                    </tr>
                  )) : <tr><td colSpan="4" className="text-muted">No data yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card p-3">
            <h5 className="card-title">Daily Traffic (7 Days)</h5>
            <div className="d-flex align-items-end gap-3" style={{ height: 150 }}>
              {(dailyTraffic || []).slice().reverse().map((d, i) => {
                const maxCount = Math.max(...(dailyTraffic || []).map(t => t.count), 1);
                const pct = (d.count / maxCount) * 100;
                return (
                  <div key={i} className="d-flex flex-column align-items-center flex-grow-1">
                    <small className="mb-1">{d.count}</small>
                    <div
                      className="bg-primary rounded"
                      style={{ width: '100%', height: `${pct}%`, minHeight: 4 }}
                    />
                    <small className="mt-1">{days[new Date(d.date).getDay()]}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card p-3">
            <h5 className="card-title">Tool Ad Revenue</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {toolRevenue?.length > 0 ? toolRevenue.map((t, i) => (
                    <tr key={t.tool_id || i}>
                      <td>{t.tool_id}</td>
                      <td>{t.impressions}</td>
                      <td>{t.clicks}</td>
                    </tr>
                  )) : <tr><td colSpan="3" className="text-muted">No data yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

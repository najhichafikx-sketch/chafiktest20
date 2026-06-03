'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

const SLOT_INFO = {
  header: 'Top of every page (728x90)',
  sidebar: 'Right sidebar (160x300)',
  content_top: 'Above tool results',
  content_bottom: 'Below tool results',
  footer: 'Bottom of every page (728x90)',
  popup: 'Popup on page load',
  in_tool: 'Inside tool interface (320x50)',
  loading_state: 'During tool loading (320x50)',
  mid_result: 'Middle of tool results'
};

export default function AdDiagnostics() {
  const router = useRouter();
  const [status, setStatus] = useState({ slots: {}, scripts: {}, csp: 'checking', lastRender: null, loading: true, error: null });
  const [forceRefresh, setForceRefresh] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }
    fetch('/api/ads', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const slots = {};
          const scripts = {};
          for (const [loc, config] of Object.entries(d.ads)) {
            slots[loc] = { enabled: config.enabled, hasCode: !!config.code, codePreview: config.code ? config.code.substring(0, 80) + '...' : 'MISSING' };
            scripts[loc] = config.code && config.code.includes('<script') ? 'INJECTED' : 'MISSING';
          }
          const expected = ['header','sidebar','content_top','content_bottom','footer','popup','in_tool','loading_state','mid_result'];
          for (const loc of expected) {
            if (!slots[loc]) slots[loc] = { enabled: false, hasCode: false, codePreview: 'NOT CONFIGURED' };
            if (!scripts[loc]) scripts[loc] = 'NOT CONFIGURED';
          }
          const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
          let csp = 'OK (no CSP meta found)';
          if (cspMeta) {
            const c = cspMeta.getAttribute('content');
            if (c.includes('highperformanceformat.com') || c.includes('effectivecpmnetwork.com')) csp = 'Adsterra domains ALLOWED';
            else csp = 'BLOCKING - missing Adsterra domains';
          }
          const adElements = document.querySelectorAll('[id*="container-"], [id*="ad-"], iframe[src*="highperformanceformat"], iframe[src*="effectivecpmnetwork"]');
          setStatus({ slots, scripts, csp, lastRender: new Date().toISOString(), loading: false, error: null, adElementsFound: adElements.length });
        }
      })
      .catch(e => setStatus(s => ({ ...s, loading: false, error: e.message })));
  }, [router, forceRefresh]);

  if (status.loading) return <AdminLayout><div className="text-center py-5"><div className="spinner-border" role="status" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Ad Diagnostics</h1>
        <div>
          <span className="badge bg-secondary me-2">Last Check: {status.lastRender ? new Date(status.lastRender).toLocaleTimeString() : 'N/A'}</span>
          <button className="btn btn-sm btn-outline-primary" onClick={() => { setStatus(s => ({ ...s, loading: true })); setForceRefresh(f => f + 1); }}>Refresh</button>
        </div>
      </div>

      {status.error && <div className="alert alert-danger">Error: {status.error}</div>}

      <div className="row mb-4">
        <div className="col-md-3 mb-2">
          <div className="card text-center p-3">
            <div className="h4 mb-0">{Object.values(status.slots).filter(s => s.enabled).length}/9</div>
            <small className="text-muted">Active Slots</small>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card text-center p-3">
            <div className="h4 mb-0">{Object.values(status.scripts).filter(s => s === 'INJECTED').length}/9</div>
            <small className="text-muted">Scripts Injected</small>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card text-center p-3">
            <div className={`h4 mb-0 ${status.csp.includes('BLOCKING') ? 'text-danger' : 'text-success'}`}>CSP</div>
            <small className="text-muted">{status.csp}</small>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card text-center p-3">
            <div className="h4 mb-0">{status.adElementsFound || 0}</div>
            <small className="text-muted">DOM Elements Found</small>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between">
          <span>All Ad Slots</span>
          <span className="badge bg-info">Diagnostics Only — No Changes Made</span>
        </div>
        <div className="table-responsive">
          <table className="table table-sm m-0">
            <thead>
              <tr>
                <th>Slot</th>
                <th>Description</th>
                <th>Status</th>
                <th>Script</th>
                <th>Code Preview</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(status.slots).map(([loc, info]) => (
                <tr key={loc} className={!info.enabled ? 'table-warning' : ''}>
                  <td><code>{loc}</code></td>
                  <td><small>{SLOT_INFO[loc] || ''}</small></td>
                  <td>
                    <span className={`badge ${info.enabled ? 'bg-success' : 'bg-secondary'}`}>
                      {info.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${status.scripts[loc] === 'INJECTED' ? 'bg-success' : status.scripts[loc] === 'MISSING' ? 'bg-danger' : 'bg-secondary'}`}>
                      {status.scripts[loc] || 'N/A'}
                    </span>
                  </td>
                  <td><small className="text-muted">{info.codePreview}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, newToday: 0, newThisWeek: 0, newThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState('');
  const perPage = 15;

  function loadUsers() {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }
    fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) { setUsers(d.users || []); setStats(d.stats || {}); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadUsers(); }, [router]);

  async function handleToggleStatus(user) {
    const token = localStorage.getItem('admin_token');
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, status: newStatus })
    });
    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    setMsg(`User ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
    setTimeout(() => setMsg(''), 3000);
  }

  async function handleDelete(user) {
    if (!confirm(`Delete user ${user.email}?`)) return;
    const token = localStorage.getItem('admin_token');
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id })
    });
    setUsers(users.filter(u => u.id !== user.id));
    setMsg('User deleted');
    setTimeout(() => setMsg(''), 3000);
  }

  function exportCsv() {
    const headers = ['ID','Email','Name','Status','Total Generations','Last Login','Created'];
    const rows = filtered.map(u => [u.id, u.email, u.name, u.status, u.total_generations || 0, u.last_login || '', u.created_at || '']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.email || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q);
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <AdminLayout><div className="text-center py-5"><div className="spinner-border" role="status" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">User Management</h1>
        <button className="btn btn-sm btn-outline-secondary" onClick={exportCsv}>Export CSV</button>
      </div>

      {msg && <div className="alert alert-info py-2 small">{msg}</div>}

      <div className="row mb-3 g-2">
        <div className="col-md-3">
          <div className="card text-center p-2"><div className="h5 mb-0">{stats.total}</div><small className="text-muted">Total Users</small></div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-2"><div className="h5 mb-0">{stats.active}</div><small className="text-muted">Active Users</small></div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-2"><div className="h5 mb-0">{stats.newToday}</div><small className="text-muted">Today</small></div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-2"><div className="h5 mb-0">{stats.newThisWeek}</div><small className="text-muted">This Week</small></div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-md-5">
              <input className="form-control form-control-sm" placeholder="Search by email or name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="col-md-2 text-muted small pt-2">{filtered.length} users</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-sm m-0">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Status</th>
                <th>Generations</th>
                <th>Last Login</th>
                <th>Registered</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan="7" className="text-muted text-center py-3">No users found</td></tr>
              ) : paged.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name || '-'}</td>
                  <td>
                    <span className={`badge bg-${u.status === 'active' ? 'success' : 'secondary'}`}>{u.status || 'active'}</span>
                  </td>
                  <td>{u.total_generations || 0}</td>
                  <td>{u.last_login ? new Date(u.last_login).toLocaleDateString() : '-'}</td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className={`btn btn-outline-${u.status === 'active' ? 'warning' : 'success'}`}
                        onClick={() => handleToggleStatus(u)}>
                        {u.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-outline-danger" onClick={() => handleDelete(u)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination pagination-sm justify-content-center">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(p)}>{p}</button>
              </li>
            ))}
            <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
            </li>
          </ul>
        </nav>
      )}
    </AdminLayout>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

export default function AdminPrompts() {
  const router = useRouter();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }
    fetch('/api/admin/prompts', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setPrompts(d.prompts || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function handleDelete(id, slug) {
    if (!confirm(`Delete prompt "${slug}"?`)) return;
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/prompts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setPrompts(prompts.filter(p => p.id !== id));
  }

  const categories = [...new Set(prompts.map(p => p.category).filter(Boolean))];
  const filtered = prompts.filter(p => {
    if (filterCat && p.category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q);
    }
    return true;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <AdminLayout><div className="text-center py-5"><div className="spinner-border" role="status" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Prompt Management</h1>
        <Link href="/admin/prompts/edit/new" className="btn btn-primary btn-sm">+ New Prompt</Link>
      </div>

      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="Search prompts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-2 text-muted small">{filtered.length} prompts</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-sm m-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Category</th>
                <th>Tool</th>
                <th>Views</th>
                <th>Status</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan="7" className="text-muted text-center py-3">No prompts found</td></tr>
              ) : paged.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.title}</strong></td>
                  <td><code>{p.slug}</code></td>
                  <td>{p.category}</td>
                  <td>{p.tool || '-'}</td>
                  <td>{p.views || 0}</td>
                  <td><span className={`badge bg-${p.status === 'published' ? 'success' : 'warning'}`}>{p.status || 'published'}</span></td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Link href={`/admin/prompts/edit/${p.id}`} className="btn btn-outline-primary">Edit</Link>
                      <button className="btn btn-outline-danger" onClick={() => handleDelete(p.id, p.slug)}>Del</button>
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

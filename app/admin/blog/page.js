'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminBlog() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }
    fetch('/api/admin/blog', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setPosts(d.posts || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function handleDelete(id, slug) {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/blog/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setPosts(posts.filter(p => p.id !== id));
  }

  async function handleDuplicate(post) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch('/api/admin/blog', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: post.slug + '-copy-' + Date.now(),
        title: post.title + ' (Copy)',
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: Array.isArray(post.tags) ? post.tags : [],
        author: post.author,
        featured_image: post.featured_image,
        meta_description: post.meta_description,
        reading_time: post.reading_time,
        status: 'draft'
      })
    });
    const data = await res.json();
    if (data.success) {
      const updated = await (await fetch('/api/admin/blog', { headers: { 'Authorization': `Bearer ${token}` } })).json();
      if (updated.success) setPosts(updated.posts);
    }
  }

  async function handleToggleStatus(post) {
    const token = localStorage.getItem('admin_token');
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
  }

  const filtered = posts.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <AdminLayout><div className="text-center py-5"><div className="spinner-border" role="status" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Blog Management</h1>
        <a href="/admin/blog/edit/new" className="btn btn-primary btn-sm">+ New Post</a>
      </div>

      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <input className="form-control form-control-sm" placeholder="Search title, slug, category, tags..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="col-md-2 text-muted small">{filtered.length} posts found</div>
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
                <th>Status</th>
                <th>Published</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan="6" className="text-muted text-center py-3">No posts found</td></tr>
              ) : paged.map(post => (
                <tr key={post.id}>
                  <td><strong>{post.title}</strong></td>
                  <td><code>{post.slug}</code></td>
                  <td>{post.category}</td>
                  <td>
                    <button className={`badge border-0 bg-${post.status === 'published' ? 'success' : 'warning'}`}
                      onClick={() => handleToggleStatus(post)}
                      title="Click to toggle status">
                      {post.status}
                    </button>
                  </td>
                  <td>{post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <a href={`/admin/blog/edit/${post.slug || post.id}`} className="btn btn-outline-primary">Edit</a>
                      <button className="btn btn-outline-info" onClick={() => handleDuplicate(post)} title="Duplicate">Copy</button>
                      <button className="btn btn-outline-danger" onClick={() => handleDelete(post.id, post.slug)}>Del</button>
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
              <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
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

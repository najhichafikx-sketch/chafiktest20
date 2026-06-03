'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit3, Trash2, Search, ImageIcon } from 'lucide-react';

export default function AdminBlog() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 12;

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

  const filtered = posts.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <AdminLayout><div className="text-center py-5"><div className="spinner-border" role="status" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ padding: '32px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Blog Articles</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Manage your blog posts</p>
          </div>
          <a href="/admin/blog/edit/new" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> New Post
          </a>
        </div>

        <div style={{
          background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
          borderRadius: 10, padding: 16, marginBottom: 24
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-muted)' }} />
              <input className="form-control form-control-sm" style={{ paddingLeft: 32 }}
                placeholder="Search articles..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select form-select-sm" style={{ width: 140 }}
              value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{filtered.length} posts</span>
          </div>
        </div>

        {paged.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p>No posts found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {paged.map(post => (
              <div key={post.id} style={{
                background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                borderRadius: 12, overflow: 'hidden',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ height: 160, background: '#1a1a2e', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {post.featured_image ? (
                    <img src={post.featured_image} alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div style=\'color:#666\'><svg width=\'32\' height=\'32\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\'/><circle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'/><path d=\'M21 15l-5-5L5 21\'/></svg></div>'; }}
                    />
                  ) : (
                    <ImageIcon size={36} style={{ color: '#444' }} />
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className={`badge bg-${post.status === 'published' ? 'success' : 'warning'}`}
                      style={{ fontSize: 11, padding: '2px 8px' }}>
                      {post.status}
                    </span>
                    {post.category && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{post.category}</span>}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px 0', lineHeight: 1.3 }}>{post.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                    {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not published'}
                    {post.reading_time ? ` · ${post.reading_time} min read` : ''}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`/admin/blog/edit/${post.slug || post.id}`} className="btn btn-outline-primary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Edit3 size={14} /> Edit
                    </a>
                    <button className="btn btn-outline-danger btn-sm"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                      onClick={() => handleDelete(post.id, post.slug)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-4">
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
      </div>
    </AdminLayout>
  );
}

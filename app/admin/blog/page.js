'use client';
import { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { startTransition(() => { setErr('Not authenticated'); setLoading(false); }); return; }
    fetch('/api/admin/blog', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) startTransition(() => setPosts(d.posts || []));
        else startTransition(() => setErr(d.message || 'Failed to load'));
      })
      .catch(() => startTransition(() => setErr('Network error')))
      .finally(() => startTransition(() => setLoading(false)));
  }, []);

  async function handleToggleStatus(id, currentStatus) {
    const token = localStorage.getItem('admin_token');
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const d = await res.json();
      if (d.success) setPosts(posts.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch {}
  }

  async function handleDelete(id, slug) {
    if (!confirm(`Delete "${slug}"?`)) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setPosts(posts.filter(p => p.id !== id));
    } catch {}
  }

  if (loading) return <AdminLayout><div className="text-center py-5"><div className="spinner-border" role="status" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ padding: '32px 40px', background: '#f0f2f8', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1a1a2e' }}>Blog Articles</h1>
          <Link href="/admin/blog/edit/new" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> New Article
          </Link>
        </div>

        {err && <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 6, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 }}>{err}</div>}

        <div style={{ background: '#fff', borderRadius: 6, border: '1px solid #e0e4e8', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e4e8' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13, background: '#f8f9fb' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13, background: '#f8f9fb' }}>Slug</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13, background: '#f8f9fb' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13, background: '#f8f9fb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 14 }}>No articles yet.</td></tr>
              ) : posts.map((post, i) => (
                <tr key={post.id} style={{ borderBottom: i < posts.length - 1 ? '1px solid #e8eaed' : 'none' }}>
                  <td style={{ padding: '16px', color: '#1a1a2e', fontWeight: 600, fontSize: 14 }}>{post.title}</td>
                  <td style={{ padding: '16px', color: '#888', fontFamily: 'monospace', fontSize: 13 }}>{post.slug}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ display: 'inline-block', background: post.status === 'published' ? '#10b981' : '#9ca3af', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 12, textTransform: 'capitalize' }}>{post.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Link href={`/admin/blog/edit/${post.slug || post.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#888', fontSize: 13, textDecoration: 'none' }}>
                        <ExternalLink size={13} /> Edit
                      </Link>
                      <button onClick={() => handleToggleStatus(post.id, post.status)} style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', background: '#fff', border: '1px solid #d0d4dc', borderRadius: 4, color: '#333', textAlign: 'left' }}>
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => handleDelete(post.id, post.slug)} style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', background: '#fff', border: '1px solid #d0d4dc', borderRadius: 4, color: '#dc2626', textAlign: 'left' }}>
                        <Trash2 size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminBlog() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm(`Delete "${slug}"?`)) return;
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/blog/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setPosts(posts.filter(p => p.id !== id));
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="h3" style={{ margin: 0 }}>Blog Management</h1>
        <a href="/admin/blog/edit/new" className="btn btn-primary btn-sm">New Post</a>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-sm" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Category</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan="6" className="text-muted text-center py-3">No posts yet</td></tr>
              ) : posts.map(post => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td><code>{post.slug}</code></td>
                  <td>{post.category}</td>
                  <td><span className={`badge bg-${post.status === 'published' ? 'success' : 'warning'}`}>{post.status}</span></td>
                  <td>{post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <a href={`/admin/blog/edit/${post.slug}`} className="btn btn-sm btn-outline me-1">Edit</a>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(post.id, post.slug)}>Delete</button>
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

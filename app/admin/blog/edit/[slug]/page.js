'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;
  const isNew = slug === 'new';

  const [form, setForm] = useState({
    slug: '', title: '', content: '', excerpt: '', category: 'General',
    tags: '', author: 'Chafiktech Ai', meta_description: '',
    reading_time: 5, status: 'draft', featured_image: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isNew) return;
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }

    fetch(`/api/admin/blog?slug=${slug}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.posts.length > 0) {
          const p = d.posts.find(x => x.slug === slug);
          if (p) {
            setForm({
              slug: p.slug || '', title: p.title || '', content: p.content || '',
              excerpt: p.excerpt || '', category: p.category || 'General',
              tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '',
              author: p.author || 'Chafiktech Ai',
              meta_description: p.meta_description || '',
              reading_time: p.reading_time || 5,
              status: p.status || 'draft',
              featured_image: p.featured_image || ''
            });
          }
        }
      })
      .catch(() => {});
  }, [slug, isNew, router]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }

    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      reading_time: parseInt(form.reading_time) || 5
    };

    try {
      let res;
      if (isNew) {
        res = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/admin/blog/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        setMessage('Saved successfully!');
        if (isNew) router.push(`/admin/blog/edit/${form.slug}`);
      } else {
        setMessage('Error: ' + (data.message || 'Save failed'));
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <h1 className="h3 mb-4">{isNew ? 'New Blog Post' : 'Edit Blog Post'}</h1>
      {message && <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>{message}</div>}
      <form onSubmit={handleSave}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Slug</label>
            <input className="form-control" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required placeholder="my-article-slug" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Title</label>
            <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Article Title" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Category</label>
            <input className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="SEO, Marketing, AI..." />
          </div>
          <div className="col-md-4">
            <label className="form-label">Author</label>
            <input className="form-control" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Read Time (min)</label>
            <input type="number" className="form-control" value={form.reading_time} onChange={e => setForm({...form, reading_time: e.target.value})} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Meta Description</label>
            <textarea className="form-control" rows="2" value={form.meta_description} onChange={e => setForm({...form, meta_description: e.target.value})} placeholder="SEO meta description (150-160 chars)" maxLength={160} />
          </div>
          <div className="col-12">
            <label className="form-label">Excerpt</label>
            <textarea className="form-control" rows="2" value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} placeholder="Short summary for blog listing" />
          </div>
          <div className="col-12">
            <label className="form-label">Tags (comma separated)</label>
            <input className="form-control" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="SEO, AI, content marketing" />
          </div>
          <div className="col-12">
            <label className="form-label">Content (HTML)</label>
            <textarea className="form-control" rows="20" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="<h2>Introduction</h2><p>Your article content here...</p>" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : (isNew ? 'Create Post' : 'Update Post')}
          </button>
          <a href="/admin/blog" className="btn btn-outline ms-2">Cancel</a>
        </div>
      </form>
    </AdminLayout>
  );
}

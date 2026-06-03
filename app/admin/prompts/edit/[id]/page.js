'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function PromptEditor() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const [form, setForm] = useState({
    slug: '', title: '', cover_image: '', category: 'General',
    tool: '', usage_guide: '', content: '', status: 'published',
    description: '', seo_title: '', meta_description: '', tags: ''
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }
    if (!isNew) {
      fetch(`/api/admin/prompts/${params.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            const p = d.prompt;
            setForm({
              slug: p.slug || '', title: p.title || '',
              cover_image: p.cover_image || '',
              category: p.category || 'General',
              tool: p.tool || '',
              usage_guide: p.usage_guide || '',
              content: p.content || '',
              status: p.status || 'published',
              description: p.description || '',
              seo_title: p.seo_title || '',
              meta_description: p.meta_description || '',
              tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || ''
            });
          }
        });
    }
  }, [router, params.id, isNew]);

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f => ({ ...f, cover_image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setForm(f => ({ ...f, cover_image: '' }));
  }

  function autoSlug(val) {
    setForm(f => ({
      ...f,
      title: val,
      slug: f.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const token = localStorage.getItem('admin_token');

    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      let res;
      if (isNew) {
        res = await fetch('/api/admin/prompts', {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/admin/prompts/${params.id}`, {
          method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      const data = await res.json();
      if (data.success) {
        setMsg(`Saved! ${isNew ? 'Redirecting...' : ''}`);
        if (isNew) setTimeout(() => router.push('/admin/prompts'), 1000);
      } else setMsg(`Error: ${data.message}`);
    } catch (err) { setMsg(`Error: ${err.message}`); }
    setSaving(false);
  }

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">{isNew ? 'New Prompt' : `Edit: ${form.title || params.id}`}</h1>
        <a href="/admin/prompts" className="btn btn-sm btn-outline-secondary">Back</a>
      </div>
      {msg && <div className={`alert ${msg.startsWith('Saved') ? 'alert-success' : 'alert-danger'} py-2`}>{msg}</div>}
      <form onSubmit={handleSave}>
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-3">
              <div className="card-body">
                <div className="mb-2">
                  <label className="form-label small">Title</label>
                  <input className="form-control form-control-sm" value={form.title} onChange={e => autoSlug(e.target.value)} required placeholder="Prompt Title" />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Slug</label>
                  <input className="form-control form-control-sm" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required placeholder="my-prompt-slug" />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Featured Image</label>
                  <input type="file" accept="image/*" className="form-control form-control-sm" onChange={handleImageUpload} />
                  <small className="text-muted">Upload from your computer</small>
                  {form.cover_image && (
                    <div style={{ position: 'relative', display: 'inline-block', marginTop: 6 }}>
                      <img src={form.cover_image} alt="" className="img-fluid rounded" style={{ maxHeight: 80 }} />
                      <button type="button" className="btn btn-sm btn-outline-danger" style={{ position: 'absolute', top: 2, right: 2, padding: '0 4px', fontSize: 10, lineHeight: '16px' }} onClick={removeImage}>x</button>
                    </div>
                  )}
                </div>
                <div className="mb-2">
                  <label className="form-label small">Short Description</label>
                  <textarea className="form-control" rows="2" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this prompt" />
                </div>
                <div className="mb-2">
                  <label className="form-label small">How To Use (HTML)</label>
                  <textarea className="form-control font-monospace" rows="6" value={form.usage_guide} onChange={e => setForm(f => ({ ...f, usage_guide: e.target.value }))} placeholder="<h2>How to use</h2><p>Step-by-step instructions...</p>" />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Prompt Content</label>
                  <textarea className="form-control font-monospace" rows="12" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required placeholder="Enter your prompt text here..." />
                  <small className="text-muted">This text will be protected: selection disabled, copy via button only.</small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <div className="mb-2">
                  <label className="form-label small">Status</label>
                  <select className="form-select form-select-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label small">Category</label>
                  <input className="form-control form-control-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="General, AI, Writing..." />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Tags (comma separated)</label>
                  <input className="form-control form-control-sm" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="AI, writing, creative" />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Associated Tool</label>
                  <input className="form-control form-control-sm" value={form.tool} onChange={e => setForm(f => ({ ...f, tool: e.target.value }))} placeholder="image-to-prompt" />
                </div>
              </div>
            </div>
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title small mb-2">SEO Settings</h6>
                <div className="mb-2">
                  <label className="form-label small">SEO Title</label>
                  <input className="form-control form-control-sm" value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} placeholder="SEO title (optional)" />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Meta Description</label>
                  <textarea className="form-control form-control-sm" rows="2" value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} placeholder="SEO description (optional)" maxLength={160} />
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
              {isNew ? 'Create Prompt' : 'Update Prompt'}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function PromptEditor() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const [form, setForm] = useState({
    slug: '', title: '', cover_image: '', category: 'General', tool: '', usage_guide: '', content: '', status: 'published'
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
              slug: p.slug || '', title: p.title || '', cover_image: p.cover_image || '',
              category: p.category || 'General', tool: p.tool || '', usage_guide: p.usage_guide || '',
              content: p.content || '', status: p.status || 'published'
            });
          }
        });
    }
  }, [router, params.id, isNew]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const token = localStorage.getItem('admin_token');

    try {
      let res;
      if (isNew) {
        res = await fetch('/api/admin/prompts', {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      } else {
        res = await fetch(`/api/admin/prompts/${params.id}`, {
          method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
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
                  <input className="form-control form-control-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Slug</label>
                  <input className="form-control form-control-sm" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Cover Image URL</label>
                  <input className="form-control form-control-sm" value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} />
                </div>
                {form.cover_image && <div className="mb-2"><img src={form.cover_image} alt="" className="img-fluid rounded" style={{ maxHeight: 100 }} /></div>}
                <div className="mb-2">
                  <label className="form-label small">Usage Guide (HTML)</label>
                  <textarea className="form-control font-monospace" rows="8" value={form.usage_guide} onChange={e => setForm(f => ({ ...f, usage_guide: e.target.value }))} placeholder="<h2>How to use this prompt</h2><p>Step-by-step instructions...</p>" />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Prompt Content</label>
                  <textarea className="form-control font-monospace" rows="12" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
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
                  <input className="form-control form-control-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Associated Tool</label>
                  <input className="form-control form-control-sm" value={form.tool} onChange={e => setForm(f => ({ ...f, tool: e.target.value }))} />
                  <small className="text-muted">Slug or name of the tool</small>
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

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;
  const isNew = slug === 'new';
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    slug: '', title: '', content: '', excerpt: '', category: 'General',
    tags: '', author: 'Chafiktech Ai', meta_description: '',
    seo_title: '', keywords: '',
    reading_time: 5, status: 'draft', featured_image: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editorReady, setEditorReady] = useState(false);

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
              seo_title: p.seo_title || p.title || '',
              keywords: Array.isArray(p.keywords) ? p.keywords.join(', ') : p.keywords || '',
              reading_time: p.reading_time || 5,
              status: p.status || 'draft',
              featured_image: p.featured_image || ''
            });
          }
        }
      })
      .catch(() => {});
  }, [slug, isNew, router]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.tinymce) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.tiny.cloud/1/no-api-key/tinymce/7/tinymce.min.js';
    script.onload = () => { setEditorReady(true); };
    document.head.appendChild(script);
    return () => { if (window.tinymce) window.tinymce.remove(); };
  }, []);

  useEffect(() => {
    if (!editorReady || !editorRef.current) return;
    const id = 'content-editor';
    const ta = document.createElement('textarea');
    ta.id = id;
    ta.value = form.content;
    editorRef.current.innerHTML = '';
    editorRef.current.appendChild(ta);

    window.tinymce.init({
      selector: `#${id}`,
      height: 500,
      menubar: true,
      plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help',
      toolbar: 'undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | table link image | code fullscreen help',
      setup: (ed) => {
        ed.on('init', () => { ed.setContent(form.content); });
        ed.on('change', () => { setForm(f => ({ ...f, content: ed.getContent() })); });
      }
    });

    return () => {
      if (window.tinymce && window.tinymce.get(id)) window.tinymce.get(id).destroy();
    };
  }, [editorReady]);

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f => ({ ...f, featured_image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setForm(f => ({ ...f, featured_image: '' }));
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
    setMessage('');

    if (window.tinymce && window.tinymce.get('content-editor')) {
      form.content = window.tinymce.get('content-editor').getContent();
    }

    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }

    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
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
            <label className="form-label">Title</label>
            <input className="form-control" value={form.title} onChange={e => autoSlug(e.target.value)} required placeholder="Article Title" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Slug</label>
            <input className="form-control" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required placeholder="my-article-slug" />
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
          <div className="col-md-6">
            <label className="form-label">SEO Title</label>
            <input className="form-control" value={form.seo_title} onChange={e => setForm({...form, seo_title: e.target.value})} placeholder="SEO title (leave empty to use article title)" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Meta Description</label>
            <textarea className="form-control" rows="2" value={form.meta_description} onChange={e => setForm({...form, meta_description: e.target.value})} placeholder="SEO meta description (150-160 chars)" maxLength={160} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Keywords</label>
            <input className="form-control" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} placeholder="SEO, AI, content marketing" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Tags</label>
            <input className="form-control" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="tag1, tag2, tag3" />
          </div>
          <div className="col-6">
            <label className="form-label">Featured Image</label>
            <input type="file" accept="image/*" className="form-control" onChange={handleImageUpload} />
            <small className="text-muted">Upload from your computer</small>
          </div>
          <div className="col-6">
            {form.featured_image ? (
              <div>
                <label className="form-label">Preview</label>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={form.featured_image} alt="" className="img-fluid rounded border" style={{ maxHeight: 120 }} />
                  <button type="button" className="btn btn-sm btn-outline-danger" style={{ position: 'absolute', top: 4, right: 4, padding: '2px 6px', fontSize: 12 }} onClick={removeImage}>x</button>
                </div>
              </div>
            ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13, border: '1px dashed var(--bg-glass-border)', borderRadius: 8, padding: 20 }}>No image uploaded</div>}
          </div>
          <div className="col-12">
            <label className="form-label">Excerpt</label>
            <textarea className="form-control" rows="2" value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} placeholder="Short summary for blog listing" />
          </div>
          <div className="col-12">
            <label className="form-label">Content</label>
            <div ref={editorRef} />
            {!editorReady && <textarea className="form-control" rows="20" value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />}
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
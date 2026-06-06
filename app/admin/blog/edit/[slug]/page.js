'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { ArrowLeft, Upload, X } from 'lucide-react';

const ACCENT = '#534AB7';
const SITE_URL = 'chafiktech.com/blog/';

const TOOL_CHIPS = [
  'SEO', 'AI Tools', 'YouTube', 'Marketing', 'Social Media',
  'E-commerce', 'Business', 'Content', 'Customer Service',
  'Digital Products', 'Image AI', 'TikTok', 'Faceless Video', 'Prompts'
];

const cardStyle = {
  background: 'var(--card-bg, #fff)',
  border: '0.5px solid var(--card-border, #e2e4e8)',
  borderRadius: 12,
  padding: 24,
  marginBottom: 16,
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-secondary, #555)',
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid var(--card-border, #d0d4dc)',
  background: 'var(--input-bg, #fff)',
  color: 'var(--text-primary, #1a1a2e)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const inputFocus = {
  borderColor: ACCENT,
  boxShadow: `0 0 0 3px ${ACCENT}22`,
};

const errStyle = {
  color: '#dc2626',
  fontSize: 12,
  marginTop: 4,
};

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const slugParam = params.slug;
  const isNew = slugParam === 'new';

  const [form, setForm] = useState({
    id: null, slug: '', title: '', content: '', excerpt: '', category: 'General',
    tags: [], author: 'Chafiktech Ai', meta_description: '',
    seo_title: '', keywords: [],
    reading_time: 5, status: 'draft', featured_image: ''
  });
  const [selectedChips, setSelectedChips] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const wordCount = useMemo(() => {
    const text = form.content.replace(/<[^>]*>/g, '').trim();
    return text ? text.split(/\s+/).length : 0;
  }, [form.content]);

  useEffect(() => {
    if (isNew) return;
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }
    fetch(`/api/admin/blog?slug=${slugParam}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.posts.length > 0) {
          const p = d.posts.find(x => x.slug === slugParam);
          if (p) {
            const tagsArr = Array.isArray(p.tags) ? p.tags : (p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
            const kwArr = Array.isArray(p.keywords) ? p.keywords : (p.keywords ? p.keywords.split(',').map(k => k.trim()).filter(Boolean) : []);
            setForm({
              id: p.id,
              slug: p.slug || '', title: p.title || '', content: p.content || '',
              excerpt: p.excerpt || '', category: p.category || 'General',
              tags: tagsArr, author: p.author || 'Chafiktech Ai',
              meta_description: p.meta_description || '',
              seo_title: p.seo_title || p.title || '',
              keywords: kwArr,
              reading_time: p.reading_time || 5,
              status: p.status || 'draft',
              featured_image: p.featured_image || ''
            });
            setSelectedChips(tagsArr.filter(t => TOOL_CHIPS.includes(t)));
          }
        }
      })
      .catch(() => {});
  }, [slugParam, isNew, router]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleTitle = (val) => {
    setForm(f => ({
      ...f, title: val,
      slug: isNew && (!f.slug || f.slug === f.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : f.slug
    }));
  };

  const handleSlugEdit = (val) => {
    set('slug', val.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const toggleChip = (chip) => {
    setSelectedChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMessage('Image too large. Max 10MB before compression.');
      e.target.value = '';
      return;
    }
    setMessage('⏳ Compressing image...');
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let { width, height } = img;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const isPng = file.type === 'image/png';
        const dataUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.85);
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedSize = Math.floor(base64Length * 3 / 4);
        if (compressedSize > 3 * 1024 * 1024) {
          const smaller = canvas.toDataURL('image/jpeg', 0.7);
          set('featured_image', smaller);
          setImageFile({ name: file.name.replace(/\.\w+$/, '.jpg'), size: Math.floor((smaller.length - (smaller.indexOf(',') + 1)) * 3 / 4) });
        } else {
          set('featured_image', dataUrl);
          setImageFile({ name: file.name, size: compressedSize });
        }
        setMessage(`✅ Image ready: ${width}x${height}px (${formatSize(compressedSize)})`);
        setTimeout(() => setMessage(''), 2500);
      };
      img.onerror = () => {
        setMessage('❌ Failed to load image');
        e.target.value = '';
      };
      img.src = ev.target.result;
    };
    reader.onerror = () => {
      setMessage('❌ Failed to read file');
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    set('featured_image', '');
    setImageFile(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.content.trim()) errs.content = 'Content is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setMessage('');

    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }

    const payload = {
      ...form,
      id: undefined,
      tags: [...new Set([...selectedChips, ...form.tags.filter(t => !TOOL_CHIPS.includes(t))])],
      keywords: Array.isArray(form.keywords) ? form.keywords : form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      reading_time: parseInt(form.reading_time) || 5,
      excerpt: form.excerpt || form.content.replace(/<[^>]*>/g, '').slice(0, 200).trim() + '...'
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
        res = await fetch(`/api/admin/blog/${form.id || slugParam}`, {
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
    } catch {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 32px 0' }}>
        <a href="/admin/blog" style={{ color: 'var(--text-secondary, #666)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back
        </a>
        <span style={{ color: 'var(--text-tertiary, #999)' }}>/</span>
        <span style={{ color: 'var(--text-primary, #1a1a2e)', fontSize: 14, fontWeight: 600 }}>{isNew ? 'New Article' : 'Edit Article'}</span>
      </div>

      {message && (
        <div style={{ margin: '12px 32px 0', padding: '12px 16px', borderRadius: 8, background: message.includes('Error') ? '#fef2f2' : '#f0fdf4', border: `1px solid ${message.includes('Error') ? '#fecaca' : '#bbf7d0'}`, color: message.includes('Error') ? '#dc2626' : '#16a34a', fontSize: 14 }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} style={{ padding: '24px 32px 40px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* LEFT COLUMN */}
        <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: '100%' }} className="edit-left-col">

          {/* Title */}
          <div style={cardStyle}>
            <label style={labelStyle}>Article Title</label>
            <input
              value={form.title}
              onChange={e => handleTitle(e.target.value)}
              placeholder="Enter article title..."
              maxLength={80}
              style={{ ...inputStyle, fontSize: 20, fontWeight: 600 }}
              onFocus={e => Object.assign(e.target.style, inputFocus)}
              onBlur={e => { e.target.style.borderColor = 'var(--card-border, #d0d4dc)'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.title && <div style={errStyle}>{errors.title}</div>}
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-tertiary, #999)', marginTop: 6 }}>
              {form.title.length} / 80
            </div>
          </div>

          {/* Slug */}
          <div style={cardStyle}>
            <label style={labelStyle}>Slug</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontSize: 14, color: 'var(--text-secondary, #666)' }}>
              <span style={{ padding: '10px 12px', background: 'var(--input-bg, #f5f6f8)', border: '1px solid var(--card-border, #d0d4dc)', borderRadius: '8px 0 0 8px', borderRight: 'none', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--text-tertiary, #999)' }}>
                {SITE_URL}
              </span>
              <input
                value={form.slug}
                onChange={e => handleSlugEdit(e.target.value)}
                placeholder="article-slug"
                style={{ ...inputStyle, borderRadius: '0 8px 8px 0', padding: '10px 14px' }}
                onFocus={e => Object.assign(e.target.style, inputFocus)}
                onBlur={e => { e.target.style.borderColor = 'var(--card-border, #d0d4dc)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Content */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Article Content</label>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary, #999)' }}>{wordCount} words</span>
            </div>
            <textarea
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder="Write your article content here... (HTML supported)"
              rows={16}
              style={{ ...inputStyle, minHeight: 280, resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 13, lineHeight: 1.7 }}
              onFocus={e => Object.assign(e.target.style, inputFocus)}
              onBlur={e => { e.target.style.borderColor = 'var(--card-border, #d0d4dc)'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.content && <div style={errStyle}>{errors.content}</div>}
          </div>

          {/* SEO Section */}
          <div style={cardStyle}>
            <label style={labelStyle}>SEO Settings</label>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary, #666)', marginBottom: 4, display: 'block' }}>Meta Title</label>
              <input
                value={form.seo_title}
                onChange={e => set('seo_title', e.target.value)}
                placeholder="SEO-optimized title (leave empty to use article title)"
                maxLength={60}
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, inputFocus)}
                onBlur={e => { e.target.style.borderColor = 'var(--card-border, #d0d4dc)'; e.target.style.boxShadow = 'none'; }}
              />
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-tertiary, #999)', marginTop: 4 }}>
                {form.seo_title.length} / 60
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary, #666)', marginBottom: 4, display: 'block' }}>Meta Description</label>
              <textarea
                value={form.meta_description}
                onChange={e => set('meta_description', e.target.value)}
                placeholder="Brief description for search results (150-160 chars ideal)"
                rows={3}
                maxLength={160}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
                onFocus={e => Object.assign(e.target.style, inputFocus)}
                onBlur={e => { e.target.style.borderColor = 'var(--card-border, #d0d4dc)'; e.target.style.boxShadow = 'none'; }}
              />
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-tertiary, #999)', marginTop: 4 }}>
                {form.meta_description.length} / 160
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - SIDEBAR */}
        <div style={{ flex: '0 0 340px', maxWidth: '100%', position: 'sticky', top: 24 }} className="edit-right-col">
          {/* Publish Settings */}
          <div style={cardStyle}>
            <label style={labelStyle}>Publish Settings</label>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary, #666)', marginBottom: 4, display: 'block' }}>Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, inputFocus)}
                onBlur={e => { e.target.style.borderColor = 'var(--card-border, #d0d4dc)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary, #666)', marginBottom: 4, display: 'block' }}>Category</label>
                <input
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  placeholder="e.g. SEO"
                  style={inputStyle}
                  onFocus={e => Object.assign(e.target.style, inputFocus)}
                  onBlur={e => { e.target.style.borderColor = 'var(--card-border, #d0d4dc)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary, #666)', marginBottom: 4, display: 'block' }}>Read Time</label>
                <input
                  type="number"
                  value={form.reading_time}
                  onChange={e => set('reading_time', e.target.value)}
                  min={1}
                  style={inputStyle}
                  onFocus={e => Object.assign(e.target.style, inputFocus)}
                  onBlur={e => { e.target.style.borderColor = 'var(--card-border, #d0d4dc)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary, #666)', marginBottom: 4, display: 'block' }}>Author</label>
              <input
                value={form.author}
                onChange={e => set('author', e.target.value)}
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, inputFocus)}
                onBlur={e => { e.target.style.borderColor = 'var(--card-border, #d0d4dc)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Featured Image */}
          <div style={cardStyle}>
            <label style={labelStyle}>Featured Image</label>
            {form.featured_image ? (
              <div>
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#0f0f1a', marginBottom: 10, padding: 8, minHeight: 120 }}>
                  <img src={form.featured_image} alt="Featured" style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain', display: 'block', borderRadius: 4 }} />
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={14} />
                  </button>
                </div>
                {imageFile && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary, #666)' }}>
                    {imageFile.name} ({formatSize(imageFile.size)}) — ✓ عرض كامل بدون قطع
                  </div>
                )}
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', border: '2px dashed var(--card-border, #d0d4dc)', borderRadius: 8, cursor: 'pointer', transition: 'border-color 0.15s', textAlign: 'center', background: 'var(--input-bg, #fafbfc)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border, #d0d4dc)'}
              >
                <Upload size={28} color="var(--text-tertiary, #bbb)" style={{ marginBottom: 12 }} />
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary, #666)' }}>Upload featured image</p>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-tertiary, #999)' }}>PNG, JPG, WEBP up to 5MB — يُعرض كاملاً بدون قص</p>
                <span style={{ padding: '8px 20px', borderRadius: 8, background: ACCENT, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  Choose File
                </span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Linked Tools */}
          <div style={cardStyle}>
            <label style={labelStyle}>Linked Tools</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TOOL_CHIPS.map(chip => {
                const active = selectedChips.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleChip(chip)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      border: active ? `1.5px solid ${ACCENT}` : '1px solid var(--card-border, #d0d4dc)',
                      background: active ? `${ACCENT}14` : 'transparent',
                      color: active ? ACCENT : 'var(--text-secondary, #666)',
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={cardStyle}>
            <label style={labelStyle}>Actions</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: ACCENT,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.opacity = '1'; }}
              >
                {saving ? 'Saving...' : (isNew ? 'Publish Article' : 'Save Article')}
              </button>
              <a
                href="/admin/blog"
                style={{
                  width: '100%',
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: '1px solid var(--card-border, #d0d4dc)',
                  background: 'transparent',
                  color: 'var(--text-secondary, #666)',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  transition: 'background 0.15s',
                  display: 'block',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--input-bg, #f5f6f8)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Cancel
              </a>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        :root {
          --card-bg: #fff;
          --card-border: #e2e4e8;
          --input-bg: #fff;
          --text-primary: #1a1a2e;
          --text-secondary: #555;
          --text-tertiary: #999;
        }
        @media (prefers-color-scheme: dark) {
          .edit-left-col, .edit-right-col {
            --card-bg: #1a1b26;
            --card-border: #2e2f3e;
            --input-bg: #22233a;
            --text-primary: #e4e4ed;
            --text-secondary: #a0a0b8;
            --text-tertiary: #6b6b82;
          }
        }
        @media (max-width: 767px) {
          .edit-left-col { flex: 1 1 100% !important; }
          .edit-right-col { flex: 1 1 100% !important; position: static !important; }
        }
      `}</style>
    </AdminLayout>
  );
}

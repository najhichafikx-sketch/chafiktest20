'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

const ACCENT = '#7c3aed';
const TAG_SUGGESTIONS = ['SEO', 'كتابة محتوى', 'تسويق', 'YouTube', 'تصميم', 'ذكاء اصطناعي', 'ترجمة', 'إعلانات', 'سوشيال ميديا', 'بريد إلكتروني'];

const cardStyle = {
  background: '#fff', border: '0.5px solid #e2e4e8', borderRadius: 12, padding: 24, marginBottom: 16
};
const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#555',
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.3px'
};
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #d0d4dc', background: '#fff',
  color: '#1a1a2e', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s'
};

export default function PromptEditor() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    slug: '', title: '', cover_image: '', category: 'عام',
    tool: '', usage_guide: '', content: '', status: 'published',
    description: '', seo_title: '', meta_description: '', tags: ''
  });
  const [tagList, setTagList] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [publishInViral, setPublishInViral] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin-login'); return; }
    if (!isNew) {
      fetch(`/api/admin/prompts/${params.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            const p = d.prompt;
            const tagsArr = p.tags ? (Array.isArray(p.tags) ? p.tags : p.tags.split(',').map(t => t.trim()).filter(Boolean)) : [];
            setForm({
              slug: p.slug || '', title: p.title || '',
              cover_image: p.cover_image || '',
              category: p.category || 'عام',
              tool: p.tool || '',
              usage_guide: p.usage_guide || '',
              content: p.content || '',
              status: p.status || 'published',
              description: p.description || '',
              seo_title: p.seo_title || '',
              meta_description: p.meta_description || '',
              tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || ''
            });
            setTagList(tagsArr);
            setPublishInViral(p.tool === 'prompt-viral');
          }
        });
    }
  }, [router, params.id, isNew]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  function handleTitle(val) {
    setForm(f => ({
      ...f, title: val,
      slug: isNew && (!f.slug || f.slug === f.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : f.slug
    }));
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setMsg('⚠️ الحجم يتجاوز 2MB'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => set('cover_image', ev.target.result);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    set('cover_image', '');
    setImageFile(null);
  }

  function addTag(tag) {
    if (!tag.trim() || tagList.includes(tag.trim())) return;
    setTagList(prev => [...prev, tag.trim()]);
    setTagInput('');
  }

  function removeTag(tag) {
    setTagList(prev => prev.filter(t => t !== tag));
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const token = localStorage.getItem('admin_token');

    const payload = {
      ...form,
      tool: publishInViral ? 'prompt-viral' : '',
      tags: tagList,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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
        setMsg('✅ تم الحفظ بنجاح');
        if (isNew) setTimeout(() => router.push('/admin/prompts'), 1000);
      } else setMsg(`⚠️ ${data.message}`);
    } catch (err) { setMsg(`⚠️ ${err.message}`); }
    setSaving(false);
  }

  const contentChars = form.content?.length || 0;

  return (
    <AdminLayout>
      <div style={{ padding: '20px 28px' }} dir="rtl">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 14, color: '#888' }}>
          <Link href="/admin/prompts" style={{ color: '#888', textDecoration: 'none' }}>Prompt Article</Link>
          <span style={{ color: '#ccc' }}>/</span>
          <span style={{ color: ACCENT, fontWeight: 600, fontSize: 13, background: `${ACCENT}0c`, padding: '3px 10px', borderRadius: 999 }}>Prompt Viral</span>
          <div style={{ flex: 1 }} />
          <Link href="/admin/prompts/edit/new" style={{ padding: '6px 16px', borderRadius: 8, background: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>+</span> مطالبة جديدة
          </Link>
        </div>

        {/* Message */}
        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}`, color: msg.includes('✅') ? '#16a34a' : '#dc2626', fontSize: 14, marginBottom: 16 }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Two-column layout */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

            {/* LEFT COLUMN */}
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              {/* عنوان المطالبة */}
              <div style={cardStyle}>
                <label style={labelStyle}>عنوان المطالبة</label>
                <input
                  value={form.title}
                  onChange={e => handleTitle(e.target.value)}
                  placeholder="اختر لاقية SEO مثال: كتابة مقالة"
                  maxLength={80}
                  style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }}
                />
                <div style={{ textAlign: 'left', fontSize: 12, color: '#999', marginTop: 6 }}>
                  {form.title.length} / 80
                </div>
              </div>

              {/* نص المطالبة */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>نص المطالبة</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(form.content); setMsg('✅ تم النسخ'); setTimeout(() => setMsg(''), 2000); }}
                      style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #d0d4dc', background: '#fff', color: '#555', cursor: 'pointer', fontSize: 12 }}>
                      نسخ
                    </button>
                    <button type="button" onClick={() => { const b = new Blob([form.content], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${form.title || 'prompt'}.txt`; a.click(); }}
                      style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #d0d4dc', background: '#fff', color: '#555', cursor: 'pointer', fontSize: 12 }}>
                      تنزيل
                    </button>
                    <button type="button" onClick={() => {
                      const ta = document.querySelector('textarea[name="content"]');
                      if (ta) { ta.style.minHeight = ta.style.minHeight === '500px' ? '280px' : '500px'; }
                    }}
                      style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #d0d4dc', background: '#fff', color: '#555', cursor: 'pointer', fontSize: 12 }}>
                      تكبير
                    </button>
                  </div>
                </div>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={e => set('content', e.target.value)}
                  placeholder="...اكتب مطالبتك هنا"
                  rows={12}
                  style={{ ...inputStyle, minHeight: 280, resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 13, lineHeight: 1.8, direction: 'rtl', textAlign: 'right' }}
                />
                <div style={{ textAlign: 'left', fontSize: 12, color: '#999', marginTop: 6 }}>
                  {contentChars.toLocaleString('ar')} حرف
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ flex: '0 0 340px', maxWidth: '100%', position: 'sticky', top: 80 }}>

              {/* صورة المقال */}
              <div style={cardStyle}>
                <label style={labelStyle}>صورة المقال / Prompt Viral</label>
                {form.cover_image ? (
                  <div>
                    <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                      <img src={form.cover_image} alt="" style={{ width: '100%', display: 'block', borderRadius: 8 }} />
                      <button type="button" onClick={removeImage}
                        style={{ position: 'absolute', top: 8, left: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                    {imageFile && <div style={{ fontSize: 12, color: '#666' }}>{imageFile.name} ({formatSize(imageFile.size)})</div>}
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 16px', border: '2px dashed #d0d4dc', borderRadius: 8, cursor: 'pointer', textAlign: 'center', background: '#fafbfc' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#d0d4dc'}>
                    <span style={{ fontSize: 28, marginBottom: 8 }}>🖼️</span>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#666' }}>ارفع صورة</p>
                    <p style={{ margin: '0 0 12px', fontSize: 11, color: '#999' }}>PNG, JPG, WEBP (2MB كحد أقصى)</p>
                    <span style={{ padding: '7px 18px', borderRadius: 8, background: ACCENT, color: '#fff', fontSize: 12, fontWeight: 500 }}>اختيار ملف</span>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {/* إعدادات النشر */}
              <div style={cardStyle}>
                <label style={labelStyle}>إعدادات النشر</label>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 4 }}>الحالة</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                    <option value="published">Published - منشور</option>
                    <option value="draft">Draft - مسودة</option>
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 4 }}>الفئة</label>
                  <input value={form.category} onChange={e => set('category', e.target.value)} placeholder="كتابة، تسويق، SEO..." style={inputStyle} />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', cursor: 'pointer' }}>
                    <input type="checkbox" checked={publishInViral} onChange={e => setPublishInViral(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: ACCENT }} />
                    <span>🚀</span> نشر في Prompt Viral
                  </label>
                </div>
              </div>

              {/* الوسوم / Tags */}
              <div style={cardStyle}>
                <label style={labelStyle}>الوسوم / Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {tagList.map(tag => (
                    <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: `${ACCENT}12`, color: ACCENT, fontSize: 12, fontWeight: 500 }}>
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: ACCENT, cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                    placeholder="إضافة وسم..."
                    style={{ ...inputStyle, flex: 1, fontSize: 13, padding: '8px 12px' }}
                  />
                  <button type="button" onClick={() => addTag(tagInput)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: ACCENT, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                    إضافة
                  </button>
                </div>
                {TAG_SUGGESTIONS.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>اقتراحات:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {TAG_SUGGESTIONS.filter(t => !tagList.includes(t)).slice(0, 8).map(s => (
                        <button key={s} type="button" onClick={() => addTag(s)}
                          style={{ padding: '3px 10px', borderRadius: 999, border: '1px solid #e0e2e6', background: '#f8f9fa', color: '#666', cursor: 'pointer', fontSize: 11 }}>
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* خلاصة مختصرة */}
          <div style={{ ...cardStyle, marginTop: 0 }}>
            <label style={labelStyle}>خلاصة مختصرة</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="...وصف قصير يشرح ما تقدمه هذه المطالبة"
              rows={3}
              maxLength={160}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 60, direction: 'rtl', textAlign: 'right' }}
            />
            <div style={{ textAlign: 'left', fontSize: 12, color: '#999', marginTop: 6 }}>
              {form.description.length} / 160
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start', marginTop: 8 }}>
            <Link href="/admin/prompts" style={{ padding: '12px 28px', borderRadius: 8, border: '1px solid #d0d4dc', background: '#fff', color: '#555', fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'inline-block' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              إلغاء
            </Link>
            <button type="submit" disabled={saving}
              style={{
                padding: '12px 32px', borderRadius: 8, border: 'none',
                background: saving ? '#9ca3af' : ACCENT, color: '#fff',
                fontSize: 14, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                display: 'inline-flex', alignItems: 'center', gap: 8
              }}>
              {saving ? 'جاري الحفظ...' : <>✦ شارك في Prompt Viral</>}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 767px) {
          div[style*="flex: 0 0 340px"] { flex: 1 1 100% !important; position: static !important; }
        }
        select { cursor: pointer; }
        input[type="checkbox"] { cursor: pointer; }
      `}</style>
    </AdminLayout>
  );
}

'use client';
import { useState, useEffect, useMemo, startTransition } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, ExternalLink, Calendar, FileText, Filter } from 'lucide-react';

export default function BlogArticles() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  async function load() {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/admin/blog', { headers: { 'Authorization': `Bearer ${token}` } });
      const d = await res.json();
      if (d.success) { setPosts(d.posts || []); setErr(null); }
      else setErr(d.message || 'Failed to load articles');
    } catch { setErr('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { startTransition(() => { setErr('Not authenticated. Please log in again.'); setLoading(false); }); return; }
    startTransition(() => load());
  }, []);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleToggleStatus(post) {
    const token = localStorage.getItem('admin_token');
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    setBusyId(post.id);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const d = await res.json();
      if (d.success) {
        setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
        showToast(newStatus === 'published' ? `✅ "${post.title}" منشور الآن` : `📝 "${post.title}" غير منشور`, 'success');
      } else showToast(d.message || 'Failed to update', 'error');
    } catch { showToast('Network error', 'error'); }
    finally { setBusyId(null); }
  }

  async function handleDelete(post) {
    if (!confirm(`🗑️ هل تريد حذف "${post.title}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`)) return;
    const token = localStorage.getItem('admin_token');
    setBusyId(post.id);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setPosts(posts.filter(p => p.id !== post.id));
        showToast(`🗑️ تم حذف "${post.title}"`, 'success');
      } else showToast(d.message || 'Failed to delete', 'error');
    } catch { showToast('Network error', 'error'); }
    finally { setBusyId(null); }
  }

  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft' || p.status !== 'published').length
  }), [posts]);

  const filtered = useMemo(() => {
    return posts.filter(p => {
      if (statusFilter === 'published' && p.status !== 'published') return false;
      if (statusFilter === 'draft' && p.status === 'published') return false;
      if (search) {
        const q = search.toLowerCase();
        return (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [posts, search, statusFilter]);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: '60px 40px', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ width: 50, height: 50, border: '4px solid #2d2d4e', borderTopColor: '#6c63ff', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          جاري تحميل المقالات...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto' }}>
        {toast && (
          <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            background: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>{toast.message}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={28} /> Blog Articles
            </h1>
            <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 14 }}>إدارة جميع مقالات المدونة</p>
          </div>
          <Link href="/admin/blog/edit/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #6c63ff, #f72585)', color: '#fff',
            padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            textDecoration: 'none', boxShadow: '0 4px 12px rgba(108,99,255,0.3)'
          }}>
            <Plus size={16} /> New Article
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>إجمالي المقالات</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{stats.total}</div>
          </div>
          <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#10b981', marginBottom: 4 }}>منشورة</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>{stats.published}</div>
          </div>
          <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#fbbf24', marginBottom: 4 }}>مسودات</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fbbf24' }}>{stats.drafts}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text" placeholder="ابحث في العنوان أو الـ slug..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', background: '#16162a', border: '1px solid #2d2d4e',
                borderRadius: 8, padding: '10px 40px 10px 12px', color: '#fff', fontSize: 14, boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Filter size={16} color="#94a3b8" />
            {[{ v: 'all', l: 'الكل' }, { v: 'published', l: 'منشورة' }, { v: 'draft', l: 'مسودات' }].map(f => (
              <button key={f.v} onClick={() => setStatusFilter(f.v)} style={{
                background: statusFilter === f.v ? 'linear-gradient(135deg, #6c63ff, #f72585)' : '#16162a',
                color: '#fff', border: '1px solid ' + (statusFilter === f.v ? 'transparent' : '#2d2d4e'),
                borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>{f.l}</button>
            ))}
          </div>
        </div>

        {err && (
          <div style={{ background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 8, padding: 14, marginBottom: 20, color: '#fca5a5', fontSize: 14 }}>
            ⚠️ {err}
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ background: '#16162a', border: '1px dashed #2d2d4e', borderRadius: 12, padding: 60, textAlign: 'center', color: '#64748b' }}>
            <FileText size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p style={{ fontSize: 16, color: '#94a3b8' }}>{search || statusFilter !== 'all' ? 'لا توجد نتائج' : 'لا توجد مقالات بعد'}</p>
            {!search && statusFilter === 'all' && (
              <Link href="/admin/blog/edit/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: '#6c63ff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                <Plus size={16} /> أنشئ أول مقال
              </Link>
            )}
          </div>
        ) : (
          <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr style={{ background: '#0f0f1a', borderBottom: '1px solid #2d2d4e' }}>
                    <th style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 700, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>المقال</th>
                    <th style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 700, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Slug</th>
                    <th style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 700, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>الحالة</th>
                    <th style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 700, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>التاريخ</th>
                    <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: 700, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((post, i) => (
                    <tr key={post.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #2d2d4e' : 'none', opacity: busyId === post.id ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${['#6c63ff', '#f72585', '#10b981', '#fbbf24', '#3b82f6'][i % 5]}, rgba(0,0,0,0.3))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                            📝
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>{post.title}</div>
                            {post.excerpt && <div style={{ color: '#64748b', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>{post.excerpt}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>{post.slug}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          background: post.status === 'published' ? '#10b98122' : '#fbbf2422',
                          color: post.status === 'published' ? '#10b981' : '#fbbf24',
                          border: '1px solid ' + (post.status === 'published' ? '#10b981' : '#fbbf24'),
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, textTransform: 'uppercase'
                        }}>
                          {post.status === 'published' ? '✓ منشور' : '○ مسودة'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 12 }}>
                        {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : post.date || '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                          {post.status === 'published' && (
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" title="View" style={{
                              background: '#2d2d4e', color: '#fff', border: 'none', borderRadius: 6,
                              padding: '7px 10px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none'
                            }}>
                              <Eye size={13} />
                            </a>
                          )}
                          <a href={`/admin/blog/edit/${post.slug || post.id}`} title="Edit" style={{
                            background: 'linear-gradient(135deg, #6c63ff, #5a52e0)', color: '#fff', border: 'none', borderRadius: 6,
                            padding: '7px 10px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none'
                          }}>
                            <Edit size={13} />
                          </a>
                          <button onClick={() => handleToggleStatus(post)} disabled={busyId === post.id} title={post.status === 'published' ? 'Unpublish' : 'Publish'} style={{
                            background: post.status === 'published' ? '#fbbf24' : '#10b981', color: '#0f0f1a', border: 'none', borderRadius: 6,
                            padding: '7px 10px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700
                          }}>
                            {post.status === 'published' ? <><EyeOff size={13} /></> : <><Eye size={13} /></>}
                          </button>
                          <button onClick={() => handleDelete(post)} disabled={busyId === post.id} title="Delete" style={{
                            background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6,
                            padding: '7px 10px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                          }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, color: '#64748b', fontSize: 13, textAlign: 'center' }}>
          عرض {filtered.length} من {posts.length} مقال
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { MessageSquare, Eye, BarChart3 } from 'lucide-react';

export default function PromptsLibrary() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    fetch('/api/prompts')
      .then(r => r.json())
      .then(d => { if (d.success) setPrompts(d.prompts || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(prompts.map(p => p.category).filter(Boolean))];
  const filtered = prompts.filter(p => {
    if (category && p.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return (p.title || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    }
    return true;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const trending = [...prompts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  return (
    <section className="section" style={{ paddingTop: '100px' }}>
      <div className="container">
      <Head><title>AI Prompt Library - ChafikTech</title><meta name="description" content="Free AI prompt library for viral content, marketing, SEO, and more. Browse categories and copy prompts." /></Head>
      <div className="container py-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="h2 mb-1">AI Prompt Library</h1>
            <p className="text-muted mb-0">Curated prompts for viral content, marketing, SEO, and creative writing.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-control form-control-sm" placeholder="Search prompts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 200 }} />
            <select className="form-select form-select-sm" style={{ width: 150 }} value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-9">
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
            ) : paged.length === 0 ? (
              <div className="text-muted text-center py-5">No prompts found</div>
            ) : (
              <div className="row g-4">
                {paged.map(p => (
                  <div key={p.id} className="col-md-4">
                    <a href={`/prompts/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="card h-100" style={{
                        overflow: 'hidden', transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{
                          height: 150, background: '#1a1a2e', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {p.cover_image ? (
                            <img src={p.cover_image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div style=\'color:#555\'><svg width=\'36\' height=\'36\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\'/><circle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'/><path d=\'M21 15l-5-5L5 21\'/></svg></div>'; }}
                            />
                          ) : (
                            <MessageSquare size={32} style={{ color: '#444' }} />
                          )}
                        </div>
                        <div className="card-body">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <span className="badge bg-primary" style={{ fontSize: 11 }}>{p.category || 'General'}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Eye size={12} /> {p.views || 0}
                            </span>
                          </div>
                          <h5 className="card-title" style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{p.title}</h5>
                          {p.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 0 }}>{p.description}</p>}
                          {!p.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 0 }}>Click to view this prompt and copy it for your AI tools.</p>}
                        </div>
                        <div className="card-footer bg-transparent border-top-0 pt-0">
                          <span className="btn btn-sm btn-outline-primary" style={{ width: '100%' }}>View Prompt</span>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-4">
                <ul className="pagination pagination-sm justify-content-center">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
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

          <div className="col-md-3">
            <div className="card">
              <div className="card-header"><strong><BarChart3 size={14} style={{ marginRight: 4 }} />Trending Prompts</strong></div>
              <div className="list-group list-group-flush">
                {trending.length === 0 ? <div className="list-group-item text-muted small">No prompts yet</div> :
                  trending.map(p => (
                    <a key={p.id} href={`/prompts/${p.slug}`} className="list-group-item list-group-item-action py-2">
                      <div className="small fw-medium">{p.title}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{p.views || 0} views</div>
                    </a>
                  ))}
                <Link href="/prompts" className="list-group-item list-group-item-action small text-primary text-center">View All</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div></section>
  );
}

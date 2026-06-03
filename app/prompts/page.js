'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';

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
        <h1 className="h2 mb-1">AI Prompt Library</h1>
        <p className="text-muted mb-4">Curated prompts for viral content, marketing, SEO, and creative writing.</p>

        <div className="row">
          <div className="col-md-9">
            <div className="d-flex gap-2 mb-3">
              <input className="form-control form-control-sm" placeholder="Search prompts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              <select className="form-select form-select-sm" style={{ width: 180 }} value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
            ) : paged.length === 0 ? (
              <div className="text-muted text-center py-5">No prompts found</div>
            ) : (
              <div className="row g-3">
                {paged.map(p => (
                  <div key={p.id} className="col-md-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">{p.title}</h5>
                        <p className="card-text small text-muted">
                          {p.category}{p.tool ? ` · ${p.tool}` : ''} · {p.views || 0} views
                        </p>
                        <a href={`/prompts/${p.slug}`} className="btn btn-sm btn-outline-primary">View Prompt</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-3">
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
              <div className="card-header"><strong>Trending Prompts</strong></div>
              <div className="list-group list-group-flush">
                {trending.length === 0 ? <div className="list-group-item text-muted small">No prompts yet</div> :
                  trending.map(p => (
                    <a key={p.id} href={`/prompts/${p.slug}`} className="list-group-item list-group-item-action py-2">
                      <div className="small fw-medium">{p.title}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{p.views || 0} views</div>
                    </a>
                  ))}
                <a href="/prompts" className="list-group-item list-group-item-action small text-primary text-center">View All</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div></section>
  );
}

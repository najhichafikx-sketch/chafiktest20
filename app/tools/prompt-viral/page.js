'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const ACCENT = '#7c3aed';
const GRADIENTS = [
  'linear-gradient(135deg, #7c3aed, #6366f1)',
  'linear-gradient(135deg, #3b82f6, #06b6d4)',
  'linear-gradient(135deg, #06b6d4, #10b981)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #6366f1, #ec4899)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #8b5cf6, #f59e0b)',
];

export default function PromptViralPage() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/prompts?tool=prompt-viral')
      .then(r => r.json())
      .then(d => { if (d.success) setPrompts(d.prompts || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(prompts.map(p => p.category).filter(Boolean))];

  const filtered = prompts.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (p.title || '').toLowerCase().includes(q) || (p.description || p.content || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">🚀 Prompt Viral</h1>
          <p className="section-subtitle">
            Viral prompts crafted for social media, content marketing, and AI-powered creativity.
            Browse the library or{' '}
            <a href="/tools/prompt-viral/generate" style={{ color: 'var(--neon-purple)', fontWeight: 600 }}>generate new ones with AI</a>.
          </p>
        </div>

        <div className="blog-search">
          <span className="blog-search-icon">🔍</span>
          <input type="text" placeholder="Search viral prompts..." value={search} onChange={e => { setActiveCategory('All'); setSearch(e.target.value); }} />
        </div>

        <div className="blog-categories">
          {categories.map(cat => (
            <span key={cat} className={`blog-category ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 32 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner-border" role="status" /></div>
          ) : (
            <>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 16 }}>
                {filtered.length} prompt{filtered.length !== 1 ? 's' : ''} found
              </p>
              <div className="blog-grid">
                {filtered.map((p, idx) => (
                  <Link key={p.id} href={`/prompts/${p.slug}`} className="blog-card">
                    <div className="blog-card-image" style={{
                      background: p.cover_image ? `url(${p.cover_image}) center/cover no-repeat` : GRADIENTS[idx % GRADIENTS.length]
                    }}>
                      <span className="blog-card-tag">{p.category || 'General'}</span>
                    </div>
                    <div className="blog-card-body">
                      <div className="blog-card-meta">
                        <span>{p.views || 0} views</span>
                        {p.tags && p.tags.length > 0 && (
                          <span style={{ display: 'flex', gap: 4 }}>
                            {p.tags.slice(0, 2).map(t => (
                              <span key={t} style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--neon-purple)', padding: '1px 8px', borderRadius: 999, fontSize: 11 }}>{t}</span>
                            ))}
                          </span>
                        )}
                      </div>
                      <h3 className="blog-card-title">{p.title}</h3>
                      {p.description && <p className="blog-card-excerpt">{p.description}</p>}
                      {!p.description && p.content && (
                        <p className="blog-card-excerpt">{p.content.substring(0, 120)}{p.content.length > 120 ? '...' : ''}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                  <p>No viral prompts found matching your search.</p>
                  <a href="/admin/prompts/edit/new" style={{ color: 'var(--neon-purple)', fontSize: 14 }}>Create a new prompt →</a>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48, padding: '24px 0 48px' }}>
          <a href="/tools/prompt-viral/generate" className="btn btn-primary" style={{ padding: '14px 40px', fontSize: 15 }}>
            ✨ Generate New Viral Prompt with AI
          </a>
        </div>
      </div>
    </section>
  );
}

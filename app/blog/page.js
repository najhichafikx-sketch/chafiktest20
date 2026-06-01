'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CATEGORIES = ['All', 'SEO', 'AI Tools', 'Social Media', 'YouTube', 'E-commerce', 'Marketing', 'Business', 'Content'];

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then(r => r.json())
      .then(d => { if (d.success) setPosts(d.posts || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.excerpt || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || p.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <section className="section" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="blog-header" style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="section-badge">📝 Blog</span>
          <h1 className="section-title">Chafiktech Ai Blog</h1>
          <p className="section-subtitle">Tips, guides, and insights for AI-powered content creation and SEO.</p>
        </div>

        <div className="blog-search" style={{ maxWidth: 500, margin: '0 auto 24px', position: 'relative' }}>
          <span className="blog-search-icon">🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." style={{ paddingLeft: 48 }} />
        </div>

        <div className="blog-categories" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          {CATEGORIES.map(c => (
            <button key={c} className={`blog-category ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="saas-spinner" /></div>
        ) : (
          <div className="blog-grid">
            {filtered.length === 0 && (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>
                No articles found matching your search.
              </p>
            )}
            {filtered.map(post => (
              <Link key={post.id || post.slug} href={`/blog/${post.slug}`} className="blog-card">
                <div className="blog-card-image" style={{ background: 'var(--gradient-primary)' }}>
                  <span className="blog-card-tag">{post.category || 'General'}</span>
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span>{post.author || 'Chafiktech Ai'}</span>
                    <span>•</span>
                    <span>{post.reading_time || 5} min read</span>
                  </div>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt || ''}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { YOUTUBE_BLOG_POSTS } from '@/lib/blog-content';

const BLOG_CATEGORIES = ['All', 'YouTube', 'SEO', 'AI Tools', 'Social Media', 'Marketing', 'E-commerce', 'Business', 'Content', 'Customer Service'];

const STATIC_EXCERPT = {
  'ai-seo-article-generator': 'Learn how to generate SEO-optimized articles with AI.',
  'image-to-prompt-ai': 'Transform images into detailed AI prompts.',
  'video-to-prompt-ai': 'Convert videos into detailed AI generation prompts.',
  'tiktok-ai-tools': 'Discover the best AI tools for TikTok growth.',
  'youtube-ai-suite': 'Complete YouTube SEO optimization with AI tools.',
  'viral-exchange': 'Earn credits and grow your audience through community video exchange.',
  'feedback-exchange': 'Get real creator feedback with structured scores across five dimensions.',
  'audience-test-lab': 'Test your videos before publishing with simulated audience sessions.',
  'ai-humanizer-guide': 'Humanize AI-generated text to bypass detectors.',
  'ai-ad-copy-generator': 'Create high-converting ad copy with AI.',
  'amazon-ai-listing': 'Optimize Amazon listings with AI for more sales.',
  'ai-product-descriptions': 'Generate compelling product descriptions with AI.',
  'etsy-ai-listing': 'Optimize Etsy listings with AI for better rankings.',
  'ai-landing-page-generator': 'Create high-converting landing pages with AI.',
  'ai-sales-copy': 'Write persuasive sales copy using AI.',
  'shopify-ai-seo': 'Optimize your Shopify store for Google with AI.',
  'ai-product-titles': 'Generate SEO-optimized product titles with AI.',
  'ai-review-responses': 'Generate professional review replies with AI.',
  'ai-pricing-optimization': 'Optimize your pricing strategy with AI insights.',
  'ai-product-ideas': 'Discover winning product ideas using AI research.',
  'ai-product-images': 'Improve product images with AI enhancement tools.',
  'ai-digital-products': 'Build and sell digital products using AI.',
  'ai-product-names': 'Generate catchy names for digital products.',
  'ai-email-marketing': 'Write high-converting email copy with AI.',
  'ai-dropshipping-research': 'Research winning dropshipping products with AI.',
  'ai-writing-prompts': 'Create better content with powerful AI prompts.',
  'viral-content-prompts': 'Generate viral-worthy content prompts with AI.'
};

const EXISTING_POSTS = Object.entries(STATIC_EXCERPT).map(([slug, excerpt]) => ({
  slug,
  title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  category: 'AI Tools',
  excerpt,
  reading_time: 7
}));

const YOUTUBE_POSTS = YOUTUBE_BLOG_POSTS.map(p => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  excerpt: p.excerpt,
  reading_time: p.reading_time
}));

const STATIC_POSTS = [...EXISTING_POSTS, ...YOUTUBE_POSTS];

function fallbackImage(slug) {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/800/450`;
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [dbPosts, setDbPosts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/blog', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled && data?.success && Array.isArray(data.posts)) {
          setDbPosts(data.posts);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const allPosts = useMemo(() => {
    const seen = new Set();
    const merged = [];
    for (const p of dbPosts) {
      if (p?.slug && !seen.has(p.slug)) {
        seen.add(p.slug);
        merged.push({
          slug: p.slug,
          title: p.title,
          category: p.category || 'General',
          excerpt: p.excerpt || p.meta_description || '',
          reading_time: p.reading_time || 5,
          featured_image: p.featured_image || ''
        });
      }
    }
    for (const p of STATIC_POSTS) {
      if (!seen.has(p.slug)) {
        seen.add(p.slug);
        merged.push({
          slug: p.slug,
          title: p.title,
          category: p.category,
          excerpt: p.excerpt,
          reading_time: p.reading_time,
          featured_image: ''
        });
      }
    }
    return merged.sort((a, b) => (b.reading_time || 0) - (a.reading_time || 0));
  }, [dbPosts]);

  const filtered = allPosts.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.excerpt.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Blog</h1>
          <p className="section-subtitle">Expert guides, tutorials, and strategies for AI-powered content creation.</p>
        </div>

        <div className="blog-search">
          <span className="blog-search-icon">🔍</span>
          <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="blog-categories">
          {BLOG_CATEGORIES.map(cat => (
            <span key={cat} className={`blog-category ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 32 }}>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 16 }}>
            {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div className="blog-grid">
            {filtered.map(post => {
              const img = post.featured_image || fallbackImage(post.slug);
              return (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
                  <div className="blog-card-image" style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={post.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={e => { e.currentTarget.src = fallbackImage(post.slug); }}
                    />
                    <span className="blog-card-tag" style={{ position: 'absolute', top: 12, left: 12 }}>{post.category}</span>
                  </div>
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <span>{post.reading_time} min read</span>
                    </div>
                    <h3 className="blog-card-title">{post.title}</h3>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <div style={{ marginTop: 12 }}>
                      <span className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }}>
                        Read More
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              <p>No articles found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

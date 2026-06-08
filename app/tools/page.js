'use client';

import { useState } from 'react';
import Link from 'next/link';

const TOOLS = [
  { name: 'AI Content Generator', url: '/tools/ai-content-generator', icon: '📢', cat: 'Content Writing' },
  { name: 'AI Humanizer', url: '/tools/ai-humanizer', icon: '✍️', cat: 'Content Writing' },
  { name: 'SEO Article Generator', url: '/tools/seo-article-generator', icon: '📝', cat: 'Content Writing' },
  { name: 'Article Prompt Generator', url: '/tools/prompt-article', icon: '📄', cat: 'Content Writing' },
  { name: 'Viral Prompt Generator', url: '/tools/prompt-viral', icon: '🔥', cat: 'Content Writing' },
  { name: 'Image to Prompt', url: '/tools/image-to-prompt', icon: '📸', cat: 'Image AI' },
  { name: 'Product Image Enhancer', url: '/tools/product-image-enhancer', icon: '🖼️', cat: 'Image AI' },
  { name: 'Watermark Remover', url: '/tools/watermark-remover', icon: '🧹', cat: 'Image AI' },
  { name: 'Video to Prompt', url: '/tools/video-to-prompt', icon: '🎬', cat: 'Video AI' },
  { name: 'YouTube Suite', url: '/tools/youtube-suite', icon: '▶️', cat: 'Video AI' },
  { name: 'Ad Copy Generator', url: '/tools/ad-copy-generator', icon: '📢', cat: 'Marketing' },
  { name: 'Landing Page Generator', url: '/tools/landing-page-generator', icon: '🖥️', cat: 'Marketing' },
  { name: 'Sales Copy Generator', url: '/tools/sales-copy-generator', icon: '💰', cat: 'Marketing' },
  { name: 'Email Writer', url: '/tools/digital-product-email-writer', icon: '📧', cat: 'Marketing' },
  { name: 'Amazon Listing Generator', url: '/tools/amazon-listing-generator', icon: '📦', cat: 'Ecommerce' },
  { name: 'Product Description Generator', url: '/tools/product-description-generator', icon: '🏷️', cat: 'Ecommerce' },
  { name: 'Etsy Listing Generator', url: '/tools/etsy-listing-generator', icon: '🛍️', cat: 'Ecommerce' },
  { name: 'Shopify SEO Generator', url: '/tools/shopify-seo-generator', icon: '🛒', cat: 'Ecommerce' },
  { name: 'Product Title Generator', url: '/tools/product-title-generator', icon: '📛', cat: 'Ecommerce' },
  { name: 'Product Idea Finder', url: '/tools/product-idea-finder', icon: '💡', cat: 'Ecommerce' },
  { name: 'Dropshipping Research', url: '/tools/dropshipping-research', icon: '🔍', cat: 'Ecommerce' },
  { name: 'Pricing Optimizer', url: '/tools/pricing-optimizer', icon: '📊', cat: 'Business' },
  { name: 'AI CV Generator', url: '/tools/cv-generator', icon: '📄', cat: 'Business' },
  { name: 'Review Response Generator', url: '/tools/review-response-generator', icon: '⭐', cat: 'Customer Service' },
  { name: 'Digital Product Creator', url: '/tools/digital-product-creator', icon: '💻', cat: 'Digital Products' },
  { name: 'Digital Product Name Generator', url: '/tools/digital-product-name-generator', icon: '🏷️', cat: 'Digital Products' },
  { name: 'AI Digital Creator', url: '/tools/ai-digital-creator', icon: '🎯', cat: 'Digital Products' },
  { name: 'YouTube AI Content Suite', url: '/tools/youtube-creator', icon: '🎬', cat: 'YouTube' },
  { name: 'Viral Video Ideas', url: '/tools/viral-video-ideas', icon: '💡', cat: 'YouTube' },
  { name: 'YouTube Title Generator', url: '/tools/youtube-title-generator', icon: '📺', cat: 'YouTube' },
  { name: 'Viral Hook Generator', url: '/tools/viral-hook-generator', icon: '🪝', cat: 'YouTube' },
  { name: 'YouTube Script Generator', url: '/tools/youtube-script-generator', icon: '📜', cat: 'YouTube' },
  { name: 'YouTube Description Generator', url: '/tools/youtube-description-generator', icon: '📋', cat: 'YouTube' },
  { name: 'YouTube Tags Generator', url: '/tools/youtube-tags-generator', icon: '🏷️', cat: 'YouTube' },
  { name: 'YouTube SEO Optimizer', url: '/tools/youtube-seo-optimizer', icon: '🔍', cat: 'YouTube' },
  { name: 'Thumbnail Prompt Generator', url: '/tools/thumbnail-prompt-generator', icon: '🖼️', cat: 'YouTube' },
  { name: 'Faceless Video Generator', url: '/tools/faceless-video-generator', icon: '🎭', cat: 'YouTube' },
  { name: 'Viral Shorts Generator', url: '/tools/viral-shorts-generator', icon: '📱', cat: 'YouTube' },
  { name: 'Storytelling Script Generator', url: '/tools/storytelling-script-generator', icon: '📖', cat: 'YouTube' },
  { name: 'Community Post Generator', url: '/tools/community-post-generator', icon: '📢', cat: 'YouTube' },
  { name: 'Comment Reply Generator', url: '/tools/comment-reply-generator', icon: '💬', cat: 'YouTube' },
  { name: 'Video Content Repurposer', url: '/tools/video-content-repurposer', icon: '🔄', cat: 'YouTube' },
  { name: 'TikTok Tools', url: '/tools/tiktok-tools', icon: '🎵', cat: 'Social Media' }
];

const CATEGORIES = [...new Set(TOOLS.map(t => t.cat))];

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const filtered = TOOLS.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === 'All' || t.cat === activeCat;
    return matchSearch && matchCat;
  });

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container" style={{ maxWidth: 960 }}>
        <div className="section-header">
          <span className="section-badge">🔧 All AI Tools</span>
          <h1 className="section-title">AI Tools Collection</h1>
          <p className="section-subtitle">Browse our complete suite of AI-powered tools for content creators, marketers, ecommerce sellers, and businesses.</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <input className="form-input" type="text" placeholder="Search tools..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: 400, margin: '0 auto', display: 'block' }} />
        </div>

        <div className="blog-categories" style={{ marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['All', ...CATEGORIES].map(c => (
            <span key={c} className={`blog-category ${activeCat === c ? 'active' : ''}`} onClick={() => setActiveCat(c)}>{c}</span>
          ))}
        </div>

        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 16 }}>{filtered.length} tools</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {filtered.map(t => (
            <Link key={t.url} href={t.url} className="glass-card" style={{
              padding: 16, display: 'flex', alignItems: 'center', gap: 12,
              textDecoration: 'none', color: 'inherit', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--neon-cyan)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{t.icon}</div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)', marginTop: 2 }}>{t.cat}</div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No tools found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
}

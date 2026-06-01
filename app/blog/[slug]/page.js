'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdManager from '@/components/AdManager';

const TOOL_ARTICLES = {
  'seo-article': { slug: 'ai-seo-article-generator', title: 'How to Generate SEO Articles with AI – Complete Guide 2026' },
  'image-to-prompt': { slug: 'image-to-prompt-ai', title: 'Image to Prompt AI – How to Generate Perfect Prompts' },
  'video-to-prompt': { slug: 'video-to-prompt-ai', title: 'Video to Prompt AI Explained – Turn Videos Into Prompts' },
  'tiktok': { slug: 'tiktok-ai-tools', title: 'Best AI Tools for TikTok Content Creation in 2026' },
  'youtube': { slug: 'youtube-ai-suite', title: 'YouTube SEO with AI Suite – Rank Higher in 2026' },
  'ai-humanizer': { slug: 'ai-humanizer-guide', title: 'AI Humanizer – Make AI Text Undetectable in 2026' },
  'ad-copy': { slug: 'ai-ad-copy-generator', title: 'How to Write Viral Ad Copy Using AI – Step by Step' },
  'amazon-listing': { slug: 'amazon-ai-listing', title: 'Amazon Listing Optimization with AI – Boost Sales' },
  'product-description': { slug: 'ai-product-descriptions', title: 'AI Product Description Generator – Complete Guide' },
  'etsy-listing': { slug: 'etsy-ai-listing', title: 'Etsy SEO with AI Listing Generator – Sell More' },
  'landing-page': { slug: 'ai-landing-page-generator', title: 'Landing Page Copy with AI – Conversion Focused' },
  'sales-copy': { slug: 'ai-sales-copy', title: 'AI Sales Copy That Converts – Proven Templates' },
  'shopify-seo': { slug: 'shopify-ai-seo', title: 'Shopify SEO with AI Tools – Rank Your Store' },
  'product-title': { slug: 'ai-product-titles', title: 'AI Product Title Generator – Click Worthy Titles' },
  'review-response': { slug: 'ai-review-responses', title: 'Automate Review Responses with AI – Save Time' },
  'pricing': { slug: 'ai-pricing-optimization', title: 'AI Pricing Optimization Strategy – Maximize Profit' },
  'product-idea': { slug: 'ai-product-ideas', title: 'Find Profitable Product Ideas with AI – 2026 Guide' },
  'product-image': { slug: 'ai-product-images', title: 'Enhance Product Images with AI – Ecommerce Guide' },
  'digital-product': { slug: 'ai-digital-products', title: 'Create Digital Products with AI – Complete Guide' },
  'digital-name': { slug: 'ai-product-names', title: 'AI Digital Product Name Generator – Creative Names' },
  'email-writer': { slug: 'ai-email-marketing', title: 'AI Email Marketing Copy Guide – Higher Open Rates' },
  'dropshipping': { slug: 'ai-dropshipping-research', title: 'AI Dropshipping Product Research – Find Winners' },
  'prompt-article': { slug: 'ai-writing-prompts', title: 'Best AI Writing Prompts for Content Creation' },
  'prompt-viral': { slug: 'viral-content-prompts', title: 'Viral Content Prompts with AI – Go Viral on Social' }
};

const TOOL_NAMES = {
  'seo-article': 'SEO Article Generator', 'image-to-prompt': 'Image to Prompt Generator',
  'video-to-prompt': 'Video to Prompt Generator', 'tiktok': 'TikTok Tools',
  'youtube': 'YouTube Suite', 'ai-humanizer': 'AI Humanizer', 'ad-copy': 'Ad Copy Generator',
  'amazon-listing': 'Amazon Listing Generator', 'product-description': 'Product Description Generator',
  'etsy-listing': 'Etsy Listing Generator', 'landing-page': 'Landing Page Generator',
  'sales-copy': 'Sales Copy Generator', 'shopify-seo': 'Shopify SEO Generator',
  'product-title': 'Product Title Generator', 'review-response': 'Review Response Generator',
  'pricing': 'Pricing Optimizer', 'product-idea': 'Product Idea Finder',
  'product-image': 'Product Image Enhancer', 'digital-product': 'Digital Product Creator',
  'digital-name': 'Digital Product Name Generator', 'email-writer': 'Digital Product Email Writer',
  'dropshipping': 'Dropshipping Research', 'prompt-article': 'Article Prompt Generator',
  'prompt-viral': 'Viral Prompt Generator'
};

const BLOG_TO_TOOL = {};
for (const [toolId, article] of Object.entries(TOOL_ARTICLES)) {
  BLOG_TO_TOOL[article.slug] = toolId;
}

export default function BlogArticle() {
  const params = useParams();
  const slug = params.slug;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setPost(d.post); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (post && !tracked) {
      setTracked(true);
      const sid = localStorage.getItem('session_id') || crypto.randomUUID();
      localStorage.setItem('session_id', sid);
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sid },
        body: JSON.stringify({ event_type: 'blog_view', page_url: `/blog/${slug}`, metadata: { blogSlug: slug, blogTitle: post.title } })
      }).catch(() => {});
    }
  }, [post, tracked, slug]);

  const toolId = BLOG_TO_TOOL[slug];
  const otherArticles = Object.entries(TOOL_ARTICLES).filter(([id, a]) => a.slug !== slug).slice(0, 4);

  if (loading) {
    return (
      <section className="section" style={{ paddingTop: '120px' }}>
        <div className="container" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div className="saas-spinner" style={{ margin: '40px auto' }} />
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="section" style={{ paddingTop: '120px' }}>
        <div className="container" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h1>Article Not Found</h1>
          <p style={{ color: 'var(--text-secondary)' }}>The article you are looking for does not exist.</p>
          <a href="/blog" className="btn btn-primary">Back to Blog</a>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: '120px' }}>
      <article className="container" style={{ maxWidth: 850, margin: '0 auto' }}>
        <div className="blog-post-header" style={{ marginBottom: 32 }}>
          <span className="section-badge">{post.category || 'General'}</span>
          <h1 style={{ fontSize: 'var(--text-4xl)', margin: '16px 0' }}>{post.title}</h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>By {post.author || 'Chafiktech Ai'}</span>
            <span>•</span>
            <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
            <span>•</span>
            <span>{post.reading_time || 5} min read</span>
          </div>
        </div>

        {post.meta_description && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: 24 }}>
            {post.meta_description}
          </p>
        )}

        <AdManager location="content_top" />

        <div
          className="blog-post-content"
          style={{ lineHeight: 1.9, fontSize: '1.05rem' }}
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        <AdManager location="content_bottom" />

        {toolId && (
          <div className="card" style={{ padding: 24, marginTop: 32, background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)' }}>
            <h3>Try the {TOOL_NAMES[toolId] || toolId}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Ready to create your own content? Use our {TOOL_NAMES[toolId] || 'AI tool'} to generate professional results instantly.</p>
            <a href={`/tools/${toolId}`} className="btn btn-primary">Try {TOOL_NAMES[toolId] || toolId} →</a>
          </div>
        )}

        <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--bg-glass-border)' }}>
          <h3>Related Articles</h3>
          <div className="blog-grid" style={{ marginTop: 16 }}>
            {otherArticles.map(([id, article]) => (
              <Link key={id} href={`/blog/${article.slug}`} className="blog-card">
                <div className="blog-card-body">
                  <h4 style={{ fontSize: '0.95rem', margin: '0 0 8px' }}>{article.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

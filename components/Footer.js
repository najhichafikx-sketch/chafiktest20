'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="nav-logo">
              <div className="nav-logo-icon">⚡</div>
              Chafiktech Ai
            </Link>
            <p>Empowering creators with next-generation AI tools for content creation, optimization, and growth.</p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="GitHub">⌨</a>
              <a href="#" aria-label="Discord">💬</a>
            </div>
          </div>
          <div className="footer-column">
            <h4>Content Tools</h4>
            <Link href="/tools/seo-article-generator">SEO Article Generator</Link>
            <Link href="/tools/video-to-prompt">Video to Prompt</Link>
            <Link href="/tools/ai-content-generator">AI Content Generator</Link>
            <Link href="/tools/ai-humanizer">AI Humanizer</Link>
            <Link href="/tools/prompt-viral">Prompt Viral</Link>
            <Link href="/tools/prompt-article">Article Prompt Generator</Link>
            <Link href="/tools/ad-copy-generator">Ad Copy Generator</Link>
            <Link href="/tools/sales-copy-generator">Sales Copy Generator</Link>
          </div>
          <div className="footer-column">
            <h4>Ecommerce Tools</h4>
            <Link href="/tools/product-description-generator">Product Description</Link>
            <Link href="/tools/product-title-generator">Product Title Generator</Link>
            <Link href="/tools/amazon-listing-generator">Amazon Listing</Link>
            <Link href="/tools/etsy-listing-generator">Etsy Listing</Link>
            <Link href="/tools/shopify-seo-generator">Shopify SEO</Link>
            <Link href="/tools/dropshipping-research">Dropshipping Research</Link>
            <Link href="/tools/pricing-optimizer">Pricing Optimizer</Link>
          </div>
          <div className="footer-column">
            <h4>YouTube AI Content Suite</h4>
            <Link href="/tools/youtube-creator">Open AI Content Suite</Link>
            <Link href="/tools/viral-video-ideas">Viral Video Ideas</Link>
            <Link href="/tools/youtube-script-generator">Script Generator</Link>
            <Link href="/tools/youtube-seo-optimizer">SEO Optimizer</Link>
            <Link href="/tools/faceless-video-generator">Faceless Videos</Link>
            <Link href="/tools/viral-shorts-generator">Viral Shorts</Link>
            <Link href="/tools/thumbnail-prompt-generator">Thumbnail Prompts</Link>
          </div>
          <div className="footer-column">
            <h4>Platforms Views</h4>
            <Link href="/platforms-views">Overview</Link>
            <Link href="/platforms-views/viral-exchange">Viral Exchange</Link>
            <Link href="/platforms-views/feedback-exchange">Feedback Exchange</Link>
            <Link href="/platforms-views/audience-test-lab">Audience Test Lab</Link>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/faq">FAQ</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Chafiktech Ai. All rights reserved.</p>
          <p style={{ marginTop: 5, fontSize: '0.8em', color: 'var(--text-tertiary)' }}>
            Contact: tools@chafiktech.com | Website: www.chafiktech.com
          </p>
        </div>
      </div>
      <QuickToolsSidebar />
    </footer>
  );
}

function QuickToolsSidebar() {
  const [open, setOpen] = useState(true);
  return (
    <div className="global-floating-sidebar" style={{ minWidth: open ? 'auto' : '52px' }}>
      <div className="gfs-toggle" onClick={() => setOpen(o => !o)} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
        aria-expanded={open} aria-label={open ? 'إخفاء القائمة' : 'إظهار القائمة'}
        style={{ cursor: 'pointer', userSelect: 'none', flexDirection: open ? 'row' : 'column', gap: open ? 6 : 2, fontSize: open ? 14 : 11 }}>
        <span style={{ transition: 'transform 0.3s', transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }}>{open ? '🧰' : '🧰'}</span>
        <span className="gfs-text" style={{ display: open ? 'inline' : 'none' }}>Quick Tools</span>
        <span style={{ marginInlineStart: open ? 0 : 0, fontSize: 10, opacity: 0.8, display: open ? 'inline' : 'none' }}>{open ? '✕' : '☰'}</span>
      </div>
      {open && <>
        <Link href="/tools/ai-digital-creator" className="gfs-link" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(247,37,133,0.15))' }}>
          <span>🎯</span><span className="gfs-text">AI Digital Creator</span>
          <span style={{ marginInlineStart: 'auto', background: 'linear-gradient(135deg, #6c63ff, #f72585)', color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>NEW</span>
        </Link>
        <Link href="/tools/seo-article-generator" className="gfs-link">
          <span>📝</span><span className="gfs-text">SEO Generator</span>
        </Link>
        <Link href="/tools/ai-content-generator" className="gfs-link">
          <span>🤖</span><span className="gfs-text">Content AI</span>
        </Link>
        <Link href="/tools/ai-humanizer" className="gfs-link">
          <span>🧠</span><span className="gfs-text">AI Humanizer</span>
        </Link>
        <Link href="/tools/image-to-prompt" className="gfs-link">
          <span>📸</span><span className="gfs-text">Img to Prompt</span>
        </Link>
        <Link href="/tools/video-to-prompt" className="gfs-link">
          <span>🎥</span><span className="gfs-text">Video to Prompt</span>
        </Link>
        <Link href="/tools/landing-page-generator" className="gfs-link">
          <span>🌐</span><span className="gfs-text">Landing Page</span>
        </Link>
        <Link href="/tools/prompt-viral" className="gfs-link">
          <span>🚀</span><span className="gfs-text">Prompt Viral</span>
        </Link>
        <Link href="/tools/sales-copy-generator" className="gfs-link">
          <span>💼</span><span className="gfs-text">Sales Copy</span>
        </Link>
        <Link href="/tools/youtube-creator" className="gfs-link">
          <span>🎬</span><span className="gfs-text">YouTube Pro</span>
        </Link>
        <Link href="/tools/tiktok-tools" className="gfs-link">
          <span>🎵</span><span className="gfs-text">TikTok Suite</span>
        </Link>
        <Link href="/tools/viral-shorts-generator" className="gfs-link">
          <span>📱</span><span className="gfs-text">Viral Shorts</span>
        </Link>
        <Link href="/tools/faceless-video-generator" className="gfs-link">
          <span>🎭</span><span className="gfs-text">Faceless Video</span>
        </Link>
        <Link href="/platforms-views" className="gfs-link">
          <span>🌐</span><span className="gfs-text">Platforms Views</span>
        </Link>
      </>}
    </div>
  );
}

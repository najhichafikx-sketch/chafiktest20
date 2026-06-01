import Link from 'next/link';

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
            <h4>YouTube Suite</h4>
            <Link href="/tools/youtube-creator">All YouTube Tools</Link>
            <Link href="/tools/viral-video-ideas">Viral Video Ideas</Link>
            <Link href="/tools/youtube-script-generator">Script Generator</Link>
            <Link href="/tools/youtube-seo-optimizer">SEO Optimizer</Link>
            <Link href="/tools/faceless-video-generator">Faceless Videos</Link>
            <Link href="/tools/viral-shorts-generator">Viral Shorts</Link>
            <Link href="/tools/thumbnail-prompt-generator">Thumbnail Prompts</Link>
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
  return (
    <div className="global-floating-sidebar">
      <div className="gfs-toggle">
        <span>🧰</span>
        <span className="gfs-text">Quick Tools</span>
      </div>
      <Link href="/tools/seo-article-generator" className="gfs-link">
        <span>📝</span><span className="gfs-text">SEO Generator</span>
      </Link>
      <Link href="/tools/image-to-prompt" className="gfs-link">
        <span>📸</span><span className="gfs-text">Img to Prompt</span>
      </Link>
      <Link href="/tools/video-to-prompt" className="gfs-link">
        <span>🎥</span><span className="gfs-text">Video to Prompt</span>
      </Link>
      <Link href="/tools/tiktok-tools" className="gfs-link">
        <span>🎵</span><span className="gfs-text">TikTok Suite</span>
      </Link>
      <Link href="/tools/prompt-viral" className="gfs-link">
        <span>🚀</span><span className="gfs-text">Prompt Viral</span>
      </Link>
      <Link href="/ecommerce" className="gfs-link">
        <span>🛒</span><span className="gfs-text">Digital Product</span>
      </Link>
      <Link href="/tools/youtube-creator" className="gfs-link">
        <span>🎬</span><span className="gfs-text">YouTube Suite</span>
      </Link>
      <Link href="/tools/viral-shorts-generator" className="gfs-link">
        <span>📱</span><span className="gfs-text">Viral Shorts</span>
      </Link>
      <Link href="/tools/faceless-video-generator" className="gfs-link">
        <span>🎭</span><span className="gfs-text">Faceless Video</span>
      </Link>
      <Link href="/tools/ai-humanizer" className="gfs-link">
        <span>🧠</span><span className="gfs-text">AI Humanizer</span>
      </Link>
    </div>
  );
}

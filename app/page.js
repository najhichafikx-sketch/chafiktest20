'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  useEffect(() => {
    initScrollReveal();
    initFAQ();
    animateCounters();
  }, []);

  return (
    <>
      <HeroSection />
      <ToolsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
    </>
  );
}

function HeroSection() {
  return (
    <header className="hero">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="container hero-content">
        <div className="hero-badge">
          <span className="dot"></span>
          ✨ Powered by Advanced AI • 🚀 v1.0
        </div>
        <h1 className="hero-title">
          Create Stunning Content with <span className="highlight">AI Superpowers</span>
        </h1>
        <p className="hero-description">
          Empower your creativity with our cutting-edge AI tools. Whether you are making videos, writing blogs, or optimizing your social media, Chafiktech Ai helps you achieve professional results in seconds.
        </p>
        <div className="hero-actions">
          <Link href="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
          <a href="#tools" className="btn btn-secondary btn-lg">Watch Demo</a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value" data-count="50000">0</div>
            <div className="hero-stat-label">Active Users</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value" data-count="1000000">0</div>
            <div className="hero-stat-label">Prompts Generated</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value" data-count="999">0</div>
            <div className="hero-stat-label">Uptime Guarantee</div>
          </div>
        </div>
      </div>
      </header>
  );
}

function ToolsSection() {
  return (
    <section id="tools" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">🚀 Our Arsenal</span>
          <h2 className="section-title">Powerful AI Tools for Creators</h2>
          <p className="section-subtitle">Everything you need to ideate, create, and optimize content across all platforms.</p>
        </div>

        <CategorySection title="Content Creation" desc="Generate, optimize, and humanize content that ranks and converts.">
          <ToolCard href="/seo-tools" icon="📝" name="SEO Tools" desc="11 powerful AI-driven SEO tools: keyword research, ranking checks, meta tags, and more." />
          <ToolCard href="/ai-writing-tools" icon="✍️" name="AI Writing Tools" desc="Professional tools powered by AI to create and optimize your content." />
          <ToolCard href="/tools/ai-humanizer" icon="🤖" name="AI Content Detector & Humanizer" desc="Detect AI-generated text instantly and rewrite it to sound naturally human, engaging, and SEO-ready." />
        </CategorySection>

        <CategorySection title="AI Prompt Tools" desc="Transform images and videos into detailed AI prompts for any generator.">
          <ToolCard href="/tools/image-to-prompt" icon="📸" name="Image to Prompt Generator" desc="Upload any image and instantly generate ultra-detailed professional prompts for Midjourney, DALL-E, and Stable Diffusion." />
          <ToolCard href="/tools/video-to-prompt" icon="🎥" name="Video to Prompt Generator" desc="Upload any video and transform it into detailed AI prompts for ChatGPT, Midjourney, Veo, Kling, and other AI tools." />
          <ToolCard href="/prompts" icon="🚀" name="Prompt Viral" desc="Browse our curated library of viral AI prompts for marketing, SEO, creative writing, and more." />
        </CategorySection>

        <CategorySection title="Website Builders" desc="Design and launch professional websites with AI-powered tools.">
          <ToolCard href="/tools/landing-page-generator" icon="🌐" name="Landing Page Generator" desc="Create professional landing pages in seconds with AI-powered templates, live preview, and instant HTML export." />
        </CategorySection>

        <CategorySection title="Creator Suites" desc="Complete toolkits for YouTube, TikTok, and digital product creators.">
          <ToolCard href="/tools/digital-product-creator" icon="💻" name="AI Digital Creator Suite" desc="Create ebooks, courses, templates, and software with AI-guided product development and marketing tools." />
          <ToolCard href="/tools/youtube-creator" icon="📺" name="AI YouTube Creator Suite" desc="Complete toolkit for YouTube creators including titles, scripts, hooks, SEO optimization, thumbnails, and viral content ideas." />
          <ToolCard href="/tools/tiktok-tools" icon="🎵" name="AI TikTok Creator Suite" desc="Generate viral scripts, find trending sounds, and optimize hashtags for explosive TikTok growth." />
        </CategorySection>

        <CategorySection title="Platforms Views" desc="Professional creator growth suite for YouTube and TikTok creators.">
          <ToolCard href="/platforms-views/viral-exchange" icon="🔄" name="Viral Exchange" desc="Earn credits by watching other creators videos and spend credits to promote your own content on YouTube and TikTok." />
          <ToolCard href="/platforms-views/feedback-exchange" icon="💬" name="Feedback Exchange" desc="Get structured peer reviews on your videos with scores on hook, editing, audio, storytelling, retention, and CTA." />
          <ToolCard href="/platforms-views/audience-test-lab" icon="🧪" name="Audience Test Lab" desc="Test audience behavior, analyze retention, compare hooks, battle thumbnails, and predict viral scores before publishing." />
        </CategorySection>

        <CTAAllTools />
      </div>
    </section>
  );
}

function CategorySection({ title, desc, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', maxWidth: 480, margin: '0 auto' }}>{desc}</p>
      </div>
      <div className="tools-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {children}
      </div>
    </div>
  );
}

function ToolCard({ href, icon, name, desc }) {
  return (
    <Link href={href} className="tool-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <div className="tool-icon" style={{ fontSize: '2.2rem', marginBottom: 12 }}>{icon}</div>
        <h3 className="tool-name" style={{ fontSize: '1rem', marginBottom: 8 }}>{name}</h3>
        <p className="tool-description" style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>
      </div>
      <span className="btn btn-primary" style={{ width: '100%', textAlign: 'center', padding: '8px 16px', fontSize: '0.85rem' }}>
        Open Tool →
      </span>
    </Link>
  );
}

function CTAAllTools() {
  return (
    <div className="glass-card" style={{ marginTop: 48, padding: '40px 24px', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>
        Explore All AI Tools
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 560, margin: '0 auto 24px', lineHeight: 1.6 }}>
        Access our complete collection of AI-powered tools for content creators, marketers, ecommerce sellers, and businesses.
      </p>
      <Link href="/tools" className="btn btn-primary btn-lg">
        View All Tools →
      </Link>
    </div>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">💰 Flexible Plans</span>
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-subtitle">Choose the perfect plan for your content creation journey.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3 className="pricing-name">Free</h3>
            <p className="pricing-desc">Perfect to test the waters.</p>
            <div className="pricing-amount">
              <span className="pricing-currency">$</span>
              <span className="pricing-value">0</span>
              <span className="pricing-period">/month</span>
            </div>
            <div className="pricing-divider"></div>
            <div className="pricing-features">
              <PricingFeature checked>5 generations / day</PricingFeature>
              <PricingFeature checked>1 tool access</PricingFeature>
              <PricingFeature checked>Basic support</PricingFeature>
              <PricingFeature checked>Community access</PricingFeature>
              <PricingFeature checked={false}>API Access</PricingFeature>
            </div>
            <Link href="/register" className="btn btn-secondary" style={{ width: '100%' }}>Start for Free</Link>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-popular">Most Popular</div>
            <h3 className="pricing-name">Pro</h3>
            <p className="pricing-desc">For serious creators & professionals.</p>
            <div className="pricing-amount">
              <span className="pricing-currency">$</span>
              <span className="pricing-value text-gradient">29</span>
              <span className="pricing-period">/month</span>
            </div>
            <div className="pricing-divider"></div>
            <div className="pricing-features">
              <PricingFeature checked>Unlimited generations</PricingFeature>
              <PricingFeature checked>All tools access</PricingFeature>
              <PricingFeature checked>Priority support</PricingFeature>
              <PricingFeature checked>API access</PricingFeature>
              <PricingFeature checked>Advanced analytics</PricingFeature>
            </div>
            <Link href="/register" className="btn btn-primary" style={{ width: '100%' }}>Upgrade to Pro</Link>
          </div>
          <div className="pricing-card">
            <h3 className="pricing-name">Business</h3>
            <p className="pricing-desc">For teams and agencies.</p>
            <div className="pricing-amount">
              <span className="pricing-currency">$</span>
              <span className="pricing-value">99</span>
              <span className="pricing-period">/month</span>
            </div>
            <div className="pricing-divider"></div>
            <div className="pricing-features">
              <PricingFeature checked>Everything in Pro</PricingFeature>
              <PricingFeature checked>Team collaboration</PricingFeature>
              <PricingFeature checked>Custom integrations</PricingFeature>
              <PricingFeature checked>Dedicated manager</PricingFeature>
              <PricingFeature checked>SLA guarantee</PricingFeature>
            </div>
            <Link href="/contact" className="btn btn-outline" style={{ width: '100%' }}>Contact Sales</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingFeature({ checked, children }) {
  return (
    <div className="pricing-feature">
      {checked ? (
        <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )}
      <span style={checked ? {} : { color: 'var(--text-muted)' }}>{children}</span>
    </div>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">❤️ Wall of Love</span>
          <h2 className="section-title">Loved by Creators</h2>
          <p className="section-subtitle">See what our community has to say about Chafiktech Ai.</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">&quot;Chafiktech Ai has completely transformed my YouTube workflow. The SEO title generator and thumbnail ideas alone save me hours every week. Worth every penny.&quot;</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">SJ</div>
              <div className="testimonial-info">
                <h4>Sarah Jenkins</h4>
                <p>Content Creator, 500k Subs</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">&quot;As a social media manager, the TikTok script generator is a lifesaver. We have seen a 300% increase in engagement since we started using Chafiktech Ai to find trending sounds and write captions.&quot;</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">MR</div>
              <div className="testimonial-info">
                <h4>Marcus Reed</h4>
                <p>Digital Marketing Agency</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">&quot;The Video-to-Prompt tool is absolute magic. I just drop in a reference video, and it gives me the exact prompts I need to generate similar styles in Midjourney.&quot;</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">EL</div>
              <div className="testimonial-info">
                <h4>Elena Lin</h4>
                <p>AI Artist & Designer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">❓ FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Got questions? We have got answers.</p>
        </div>
        <div className="faq-list">
          <FAQItem question="How does the Free plan work?">
            The Free plan gives you access to a limited number of generations (5 per day) and access to one primary tool so you can test the platform capabilities before committing. No credit card is required.
          </FAQItem>
          <FAQItem question="Can I cancel my subscription anytime?">
            Yes, absolutely. You can upgrade, downgrade, or cancel your subscription at any time right from your dashboard. If you cancel, you will retain access until the end of your billing period.
          </FAQItem>
          <FAQItem question="What exactly is the Video to Prompt tool?">
            It is an advanced AI model that analyzes any video you upload and reverse-engineers it into highly detailed text prompts. This is perfect for recreating specific styles, lighting, or compositions in text-to-image or text-to-video AI generators.
          </FAQItem>
          <FAQItem question="Do I need technical skills to use Chafiktech Ai?">
            Not at all! We have designed Chafiktech Ai to be incredibly intuitive and user-friendly. If you know how to copy and paste, you can start generating professional-grade content immediately.
          </FAQItem>
          <FAQItem question="Is there an API available for developers?">
            Yes! API access is available on our Pro and Business plans. You can generate API keys directly from your dashboard to integrate our AI tools into your own applications or workflows.
          </FAQItem>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, children }) {
  return (
    <div className="faq-item">
      <div className="faq-question" onClick={(e) => {
        const item = e.currentTarget.closest('.faq-item');
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(el => {
          el.classList.remove('active');
          const ans = el.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = '0';
        });
        if (!isActive) {
          item.classList.add('active');
          const ans = item.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = ans.scrollHeight + 'px';
        }
      }}>
        {question}
        <span className="faq-icon">+</span>
      </div>
      <div className="faq-answer">
        <div className="faq-answer-content">{children}</div>
      </div>
    </div>
  );
}

// --- Client-side JS ---

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => observer.observe(el));
}

function initFAQ() {
  /* Handled inline */
}

function animateCounters() {
  const stats = document.querySelector('.hero-stats');
  if (!stats) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('[data-count]');
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.count);
          const duration = 2000;
          const startTime = performance.now();
          function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(0 + (target - 0) * eased);
            const suffix = target === 999 ? '.9%' : target >= 1000000 ? '+1M+' : target >= 50000 ? '50K+' : '+';
            counter.textContent = current.toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  observer.observe(stats);
}

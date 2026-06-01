import Link from 'next/link';

export const metadata = {
  title: 'AI YouTube Creator Suite - 14 AI Tools for YouTube Growth',
  description: 'Complete AI-powered YouTube Creator Suite with 14 tools for viral ideas, scripts, titles, thumbnails, SEO, Shorts, and more.'
};

const YOUTUBE_TOOLS = [
  { href: '/tools/viral-video-ideas', icon: '💡', name: 'Viral Video Idea Generator', desc: 'Generate viral ideas, video concepts, and trending content angles for your channel.' },
  { href: '/tools/youtube-title-generator', icon: '📺', name: 'YouTube Title Generator', desc: 'Generate SEO titles, clickable headlines, and Shorts titles that drive views.' },
  { href: '/tools/viral-hook-generator', icon: '🪝', name: 'Viral Hook Generator', desc: 'Create scroll-stopping hooks for the first 5 seconds, 15 seconds, and beyond.' },
  { href: '/tools/youtube-script-generator', icon: '📜', name: 'YouTube Script Generator', desc: 'Write complete scripts for Shorts, long-form videos, and faceless channels.' },
  { href: '/tools/thumbnail-prompt-generator', icon: '🖼️', name: 'Thumbnail Prompt Generator', desc: 'Generate AI thumbnail prompts with subject, colors, composition, and emotion.' },
  { href: '/tools/youtube-description-generator', icon: '📋', name: 'YouTube Description Generator', desc: 'Create SEO descriptions, hashtags, and keywords optimized for discovery.' },
  { href: '/tools/youtube-tags-generator', icon: '🏷️', name: 'YouTube Tags Generator', desc: 'Generate relevant tags and long-tail keywords to rank higher in search.' },
  { href: '/tools/youtube-seo-optimizer', icon: '🔍', name: 'YouTube SEO Optimizer', desc: 'Analyze your title and description for an SEO score and actionable suggestions.' },
  { href: '/tools/faceless-video-generator', icon: '🎭', name: 'Faceless Video Generator', desc: 'Generate scripts, voiceover prompts, visual prompts, and B-roll ideas.' },
  { href: '/tools/viral-shorts-generator', icon: '📱', name: 'Viral Shorts Generator', desc: 'Generate viral Shorts scripts for 30, 45, and 60 second durations.' },
  { href: '/tools/storytelling-script-generator', icon: '📖', name: 'Storytelling Script Generator', desc: 'Narrative scripts for history, mystery, documentary, and educational channels.' },
  { href: '/tools/community-post-generator', icon: '📢', name: 'Community Post Generator', desc: 'Generate polls, community posts, and engagement content for your channel.' },
  { href: '/tools/comment-reply-generator', icon: '💬', name: 'Comment Reply Generator', desc: 'Generate professional replies to YouTube comments that build community.' },
  { href: '/tools/video-content-repurposer', icon: '🔄', name: 'Video Content Repurposer', desc: 'Convert videos into blog articles, Twitter threads, Instagram, and LinkedIn posts.' }
];

export default function YouTubeCreatorPage() {
  return (
    <section className="section tool-page">
      <div className="container">
        <div className="tool-page-header">
          <div className="tool-page-icon">📺</div>
          <h1 className="tool-page-title">AI YouTube Creator Suite</h1>
          <p className="tool-page-desc">14 powerful AI tools to grow your YouTube channel — from viral ideas and scripts to SEO optimization and content repurposing.</p>
        </div>

        <div className="youtube-tools-grid">
          {YOUTUBE_TOOLS.map((tool, i) => (
            <Link key={i} href={tool.href} className="youtube-tool-card glass-card">
              <div className="youtube-tool-icon">{tool.icon}</div>
              <h3 className="youtube-tool-name">{tool.name}</h3>
              <p className="youtube-tool-desc">{tool.desc}</p>
              <span className="btn btn-sm btn-outline" style={{ marginTop: 'auto', alignSelf: 'center' }}>Open Tool →</span>
            </Link>
          ))}
        </div>

        <div className="tool-section" style={{ marginTop: 64, textAlign: 'center' }}>
          <h2>Why Choose Our YouTube Creator Suite?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginTop: 32, textAlign: 'left' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>🎯</h3>
              <h4>All-in-One YouTube Toolkit</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>From ideation to optimization — every tool you need to grow your channel in one place.</p>
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>🤖</h3>
              <h4>Powered by Advanced AI</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Built on OpenRouter with Claude, GPT-4, and Gemini for high-quality generations.</p>
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>📈</h3>
              <h4>Optimized for Growth</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Every tool is designed to improve your YouTube SEO, CTR, retention, and engagement metrics.</p>
            </div>
          </div>
        </div>

        <div className="tool-section" style={{ marginTop: 64 }}>
          <h2>FAQ</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">
                Are these tools free to use?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-content">Yes, all 14 tools in the YouTube Creator Suite are completely free with no usage limits.</div>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                Do I need a YouTube channel to use these tools?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-content">No, you can use them to plan content before starting your channel or to optimize an existing channel.</div>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                Can I export the generated content?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-content">Yes, every tool has a Copy button to copy the generated content to your clipboard for pasting into YouTube Studio.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="tool-section" style={{ marginTop: 48, textAlign: 'center' }}>
          <h2>Related Tools</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
            <a href="/tools/video-to-prompt" className="btn btn-sm btn-outline">Video to Prompt</a>
            <a href="/tools/tiktok-tools" className="btn btn-sm btn-outline">TikTok Creator Suite</a>
            <a href="/tools/seo-article-generator" className="btn btn-sm btn-outline">SEO Article Generator</a>
          </div>
        </div>
      </div>
    </section>
  );
}

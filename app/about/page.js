export const metadata = {
  title: 'About Us',
  description: 'Learn about Chafiktech Ai - our mission to democratize content creation through AI-powered tools for creators worldwide.',
  openGraph: {
    title: 'About Chafiktech Ai',
    description: 'Empowering creators worldwide with cutting-edge AI technology for content creation.'
  }
};

export default function AboutPage() {
  return (
    <section className="section" style={{ paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-badge">ℹ️ About Us</span>
          <h1 className="section-title">About Chafiktech Ai</h1>
          <p className="section-subtitle">Empowering creators worldwide with cutting-edge AI technology.</p>
        </div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
          <p style={{ marginBottom: 20 }}>Chafiktech Ai was founded with a singular mission: to democratize content creation through the power of artificial intelligence. We believe that everyone — from solo creators to large enterprises — should have access to professional-grade AI tools that amplify their creativity and productivity.</p>
          <p style={{ marginBottom: 20 }}>Our platform offers a comprehensive suite of AI-powered tools designed to handle every aspect of content creation: from SEO-optimized article writing and image prompt generation to video analysis, social media optimization, and e-commerce product development.</p>
          <p style={{ marginBottom: 20 }}>We leverage the latest advancements in AI technology, including models from OpenAI, Google, Anthropic, and others — all accessible through a single, unified platform via OpenRouter. This ensures you always get the best results for your specific use case.</p>
          <p>Whether you&apos;re a YouTuber looking for viral video ideas, a blogger seeking SEO-optimized content, or an entrepreneur building digital products, Chafiktech Ai provides the tools you need to succeed in the digital landscape.</p>
        </div>
      </div>
    </section>
  );
}

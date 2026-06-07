import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TOOL_NAMES, TOOL_ARTICLES } from '@/lib/tool-content';
import { YOUTUBE_BLOG_POSTS } from '@/lib/blog-content';
import { SEED_POSTS } from '@/lib/seed-blog';

const EXISTING_POSTS = SEED_POSTS.map(p => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  excerpt: p.excerpt,
  reading_time: p.reading_time
}));

const ALL_POSTS = [...EXISTING_POSTS, ...YOUTUBE_BLOG_POSTS.map(p => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  excerpt: p.excerpt,
  reading_time: p.reading_time
}))];

const BLOG_CONTENT_MAP = {};
for (const post of SEED_POSTS) BLOG_CONTENT_MAP[post.slug] = post.content;
for (const post of YOUTUBE_BLOG_POSTS) BLOG_CONTENT_MAP[post.slug] = post.content;

const TOOL_SLUG_TO_ID = {};
for (const [id, data] of Object.entries(TOOL_ARTICLES)) {
  TOOL_SLUG_TO_ID[data.slug] = id;
}

function fallbackImage(slug) {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/800/450`;
}

function seededShuffle(array, seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    const j = hash % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateStaticParams() {
  return ALL_POSTS.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = ALL_POSTS.find(p => p.slug === slug);
  if (!post) return { title: 'Article Not Found' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: '2026-01-01',
      authors: ['Chafiktech Ai']
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt
    },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chafiktech.com'}/blog/${slug}` },
    robots: { index: true, follow: true }
  };
}

async function getDbPost(slug) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chafiktech.com'}/api/blog/${slug}`, { cache: 'no-store' });
    const data = await res.json();
    if (data?.success && data.post) return data.post;
  } catch {}
  return null;
}

async function getAllDbPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chafiktech.com'}/api/blog`, { cache: 'no-store' });
    const data = await res.json();
    if (data?.success && Array.isArray(data.posts)) return data.posts;
  } catch {}
  return [];
}

export default async function BlogArticle({ params }) {
  const { slug } = await params;
  const post = ALL_POSTS.find(p => p.slug === slug);
  if (!post) notFound();

  const toolId = TOOL_SLUG_TO_ID[post.slug];
  const toolName = toolId ? (TOOL_NAMES[toolId]?.name || null) : null;
  const toolHref = toolId ? `/tools/${toolId}` : null;
  const content = BLOG_CONTENT_MAP[post.slug];

  const [dbPost, allDbPosts] = await Promise.all([getDbPost(slug), getAllDbPosts()]);

  const featuredImage = dbPost?.featured_image || fallbackImage(post.slug);

  const seen = new Set();
  const mergedRelated = [];
  for (const p of allDbPosts) {
    if (p?.slug && p.slug !== post.slug && !seen.has(p.slug)) {
      seen.add(p.slug);
      mergedRelated.push({
        slug: p.slug,
        title: p.title,
        category: p.category || 'General',
        excerpt: p.excerpt || p.meta_description || '',
        reading_time: p.reading_time || 5,
        featured_image: p.featured_image || ''
      });
    }
  }
  for (const p of ALL_POSTS) {
    if (p.slug !== post.slug && !seen.has(p.slug)) {
      seen.add(p.slug);
      mergedRelated.push({
        slug: p.slug,
        title: p.title,
        category: p.category,
        excerpt: p.excerpt,
        reading_time: p.reading_time,
        featured_image: ''
      });
    }
  }
  const relatedPosts = seededShuffle(mergedRelated, post.slug).slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: featuredImage,
    author: { '@type': 'Organization', name: 'Chafiktech Ai' },
    publisher: { '@type': 'Organization', name: 'Chafiktech Ai' },
    datePublished: '2026-01-01',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chafiktech.com'}/blog/${post.slug}` }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <style>{`
        @keyframes led-pulse {
          0%, 100% { box-shadow: 0 0 24px rgba(139, 92, 246, 0.5), 0 0 48px rgba(34, 211, 238, 0.3); }
          50% { box-shadow: 0 0 36px rgba(139, 92, 246, 0.8), 0 0 72px rgba(34, 211, 238, 0.5); }
        }
        .led-cta {
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 35%, #22d3ee 100%);
          color: #fff;
          padding: 18px 36px;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 12px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          animation: led-pulse 2.4s ease-in-out infinite;
          transition: transform 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .led-cta:hover {
          transform: translateY(-2px) scale(1.02);
        }
        .top-cta {
          background: linear-gradient(135deg, #6d28d9, #4f46e5);
          color: #fff;
          padding: 12px 24px;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 10px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(109, 40, 217, 0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .top-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(109, 40, 217, 0.5);
        }
        .related-card {
          background: rgba(20, 20, 35, 0.6);
          border: 1px solid rgba(99, 102, 241, 0.18);
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .related-card:hover {
          transform: translateY(-3px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        .related-card-image {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: linear-gradient(135deg, #1a1a2e, #16213e);
        }
        .related-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      `}</style>

      <section className="section tool-page" style={{ paddingTop: 120 }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <Link href="/blog" style={{ color: 'var(--neon-purple)', fontSize: '0.9rem', marginBottom: 16, display: 'inline-block' }}>&larr; Back to Blog</Link>

          <div className="tool-page-header" style={{ textAlign: 'left' }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(99,102,241,0.1)', borderRadius: 999, fontSize: '0.8rem', color: 'var(--neon-cyan)', marginBottom: 12 }}>{post.category}</span>
            <h1 className="tool-page-title" style={{ fontSize: '2rem' }}>{post.title}</h1>
            <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
              <span>Chafiktech Ai</span>
              <span>·</span>
              <span>{post.reading_time} min read</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 16 }}>{post.excerpt}</p>
          </div>

          <div style={{
            marginTop: 24,
            background: '#0f0f1a',
            borderRadius: 12,
            padding: 12,
            border: '1px solid rgba(99,102,241,0.2)'
          }}>
            <img
              src={featuredImage}
              alt={post.title}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                maxHeight: 600,
                objectFit: 'contain',
                borderRadius: 8
              }}
            />
          </div>

          {toolName && toolHref && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Link href={toolHref} className="top-cta">
                <span style={{ fontSize: '1.1rem' }}>🚀</span>
                Try {toolName} Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          )}

          {content ? (
            <div className="blog-article-content" style={{ lineHeight: 1.8, fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 24 }}
              dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <BlogContentFromDB slug={post.slug} />
          )}

          {toolName && toolHref && (
            <div style={{ marginTop: 40, textAlign: 'center', padding: '32px 20px', background: 'rgba(20, 20, 35, 0.4)', borderRadius: 16, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Ready to Get Started?
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '1rem', maxWidth: 500, margin: '0 auto 20px' }}>
                Apply what you learned with our {toolName}. Generate results in seconds.
              </p>
              <Link href={toolHref} className="led-cta">
                <span style={{ fontSize: '1.3rem' }}>✨</span>
                Open {toolName}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          )}

          <div style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Related Articles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {relatedPosts.map(rp => {
                const img = rp.featured_image || fallbackImage(rp.slug);
                return (
                  <Link key={rp.slug} href={`/blog/${rp.slug}`} className="related-card">
                    <div className="related-card-image">
                      <img
                        src={img}
                        alt={rp.title}
                        loading="lazy"
                      />
                    </div>
                    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{rp.category}</span>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 6, lineHeight: 1.4, color: 'var(--text-primary)' }}>{rp.title}</h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 8, lineHeight: 1.5 }}>{rp.excerpt}</p>
                      <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--neon-purple)', fontSize: '0.85rem', fontWeight: 600 }}>
                        Read More
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

async function BlogContentFromDB({ slug }) {
  let content = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chafiktech.com'}/api/blog/${slug}`, { cache: 'no-store' });
    const data = await res.json();
    if (data?.success && data.post?.content) {
      content = data.post.content;
    }
  } catch {}
  if (content) {
    return (
      <div className="blog-article-content" style={{ lineHeight: 1.8, fontSize: '1rem', color: 'var(--text-secondary)' }}
        dangerouslySetInnerHTML={{ __html: content }} />
    );
  }
  return (
    <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Content loading from database...</p>
    </div>
  );
}

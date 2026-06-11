'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';

const COPY_DELAY_SECONDS = 5;

export default function PromptPage() {
  const params = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    fetch(`/api/prompts/${params.slug}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d && d.success) setPrompt(d.prompt); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.slug]);

  function startCountdown(action) {
    if (unlocked) { action(); return; }
    let sec = COPY_DELAY_SECONDS;
    setCountdown(sec);
    const timer = setInterval(() => {
      sec--;
      setCountdown(sec);
      if (sec <= 0) {
        clearInterval(timer);
        setCountdown(null);
        setUnlocked(true);
        action();
      }
    }, 1000);
  }

  function handleCopy() {
    startCountdown(() => {
      if (!prompt) return;
      navigator.clipboard.writeText(prompt.content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    });
  }

  function handleDownloadTxt() {
    startCountdown(() => {
      if (!prompt) return;
      const blob = new Blob([prompt.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${prompt.slug}.txt`;
      a.click(); URL.revokeObjectURL(url);
    });
  }

  function handleDownloadMd() {
    startCountdown(() => {
      if (!prompt) return;
      const md = `# ${prompt.title}\n\n${prompt.content}`;
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${prompt.slug}.md`;
      a.click(); URL.revokeObjectURL(url);
    });
  }

  if (loading) return <section className="section" style={{ paddingTop: '100px' }}><div className="container py-5 text-center"><div className="spinner-border" role="status" /></div></section>;
  if (notFound || !prompt) return <section className="section" style={{ paddingTop: '100px' }}><div className="container py-5"><h1>Prompt Not Found</h1><p className="text-muted">This prompt does not exist or has been removed.</p></div></section>;

  const siteTitle = prompt.seo_title || prompt.title;
  const siteDesc = prompt.meta_description || `${prompt.title} - Free AI prompt for ${prompt.category}. Copy, download TXT or MD.`;
  const siteUrl = typeof window !== 'undefined' ? window.location.href : '';
  const siteName = 'ChafikTech';

  return (
    <section className="section" style={{ paddingTop: '100px' }}>
      <Head>
        <title>{siteTitle} - AI Prompt | {siteName}</title>
        <meta name="description" content={siteDesc} />
        <meta name="keywords" content={prompt.tags ? (Array.isArray(prompt.tags) ? prompt.tags.join(', ') : prompt.tags) : prompt.category} />

        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={siteUrl} />
        {prompt.cover_image && <meta property="og:image" content={prompt.cover_image} />}
        <meta property="og:site_name" content={siteName} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDesc} />
        {prompt.cover_image && <meta name="twitter:image" content={prompt.cover_image} />}

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: siteTitle,
            description: siteDesc,
            image: prompt.cover_image || '',
            datePublished: prompt.created_at || '',
            dateModified: prompt.updated_at || prompt.created_at || '',
            author: { '@type': 'Organization', name: siteName }
          })
        }} />
      </Head>

      <div className="container py-4">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/prompts">Prompts</Link></li>
            <li className="breadcrumb-item active">{prompt.title}</li>
          </ol>
        </nav>

        {prompt.cover_image && (
          <div className="mb-4">
            <img src={prompt.cover_image} alt={prompt.title} className="img-fluid rounded" style={{ maxHeight: 300, width: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div className="row">
          <div className="col-md-8">
            <h1 className="h2 mb-2">{prompt.title}</h1>
            <div className="mb-3">
              <span className="badge bg-primary me-1">{prompt.category}</span>
              {prompt.tool && <span className="badge bg-secondary">Tool: {prompt.tool}</span>}
              <span className="ms-2 text-muted small">{prompt.views || 0} views</span>
            </div>

            {prompt.description && (
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Description</h5>
                  <p className="card-text text-muted">{prompt.description}</p>
                </div>
              </div>
            )}

            {prompt.usage_guide && (
              <div className="card mb-4">
                <div className="card-body" dangerouslySetInnerHTML={{ __html: prompt.usage_guide }} />
              </div>
            )}
          </div>

          <div className="col-md-4">
            <div className="card sticky-top" style={{ top: 80 }}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <strong>Prompt</strong>
                <button
                  className={`btn btn-sm ${copied ? 'btn-success' : unlocked ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
                  onClick={handleCopy}
                  disabled={countdown !== null}
                >
                  {countdown ? `Wait ${countdown}s` : copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="card-body p-0">
                <div style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  fontSize: 13,
                  lineHeight: 1.6,
                  padding: '16px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  cursor: 'default',
                  minHeight: 200,
                  maxHeight: 400,
                  overflowY: 'auto',
                  borderBottomLeftRadius: '0.375rem',
                  borderBottomRightRadius: '0.375rem'
                }}
                  onCopy={e => e.preventDefault()}
                  onCut={e => e.preventDefault()}
                  onContextMenu={e => e.preventDefault()}>
                  {prompt.content}
                </div>
                <div className="d-flex gap-2 p-2 border-top">
                  <button className="btn btn-sm btn-outline-secondary flex-fill" onClick={handleDownloadTxt} disabled={countdown !== null}>
                    {countdown ? `Wait ${countdown}s` : 'Download TXT'}
                  </button>
                  <button className="btn btn-sm btn-outline-secondary flex-fill" onClick={handleDownloadMd} disabled={countdown !== null}>
                    {countdown ? `Wait ${countdown}s` : 'Download MD'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {countdown !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{ color: '#94a3b8', fontSize: 18, marginBottom: 16 }}>Preparing prompt...</div>
          <div style={{
            color: '#818cf8', fontSize: 72, fontWeight: 800,
            width: 120, height: 120,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(99,102,241,0.1)', borderRadius: '50%',
            border: '2px solid rgba(99,102,241,0.3)',
            animation: 'pulse 1s ease-in-out infinite'
          }}>
            {countdown}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </section>
  );
}
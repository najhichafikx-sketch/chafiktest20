'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Head from 'next/head';

export default function PromptPage() {
  const params = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/prompts/${params.slug}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d && d.success) setPrompt(d.prompt); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.slug]);

  function handleCopy() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadTxt() {
    if (!prompt) return;
    const blob = new Blob([prompt.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${prompt.slug}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  function handleDownloadMd() {
    if (!prompt) return;
    const md = `# ${prompt.title}\n\n${prompt.content}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${prompt.slug}.md`;
    a.click(); URL.revokeObjectURL(url);
  }

  if (loading) return <section className="section" style={{ paddingTop: '100px' }}><div className="container py-5 text-center"><div className="spinner-border" role="status" /></div></section>;
  if (notFound || !prompt) return <section className="section" style={{ paddingTop: '100px' }}><div className="container py-5"><h1>Prompt Not Found</h1><p className="text-muted">This prompt does not exist or has been removed.</p></div></section>;

  return (
    <section className="section" style={{ paddingTop: '100px' }}>
      <Head>
        <title>{prompt.title} - AI Prompt | ChafikTech</title>
        <meta name="description" content={`${prompt.title} - Free AI prompt for ${prompt.category}. Copy, download TXT or MD.`} />
        {prompt.cover_image && <meta property="og:image" content={prompt.cover_image} />}
      </Head>

      <div className="container py-4">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item"><a href="/prompts">Prompts</a></li>
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
                <button className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline-primary'}`} onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="card-body" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>
                <pre className="mb-3" style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.5, fontFamily: 'monospace' }}
                  onCopy={e => e.preventDefault()}
                  onCut={e => e.preventDefault()}
                  onContextMenu={e => e.preventDefault()}>
                  {prompt.content}
                </pre>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary flex-fill" onClick={handleDownloadTxt}>
                    Download TXT
                  </button>
                  <button className="btn btn-sm btn-outline-secondary flex-fill" onClick={handleDownloadMd}>
                    Download MD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        pre::-moz-user-select, pre::-webkit-user-select, pre::selection { background: transparent; }
      `}</style>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { TOOL_ARTICLES, RELATED_TOOLS, USAGE_GUIDES, FAQS, TOOL_NAMES } from '@/lib/tool-content';

function trackToolUsage(toolId) {
  const sid = localStorage.getItem('session_id') || crypto.randomUUID();
  localStorage.setItem('session_id', sid);
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-session-id': sid },
    body: JSON.stringify({ event_type: 'tool_used', page_url: window.location.pathname, metadata: { toolId } })
  }).catch(() => {});
}

export default function ToolPage({ icon, title, description, placeholder, toolId, hasUpload, showSidebar }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [showFaq, setShowFaq] = useState(false);

  const article = TOOL_ARTICLES[toolId];
  const relatedIds = RELATED_TOOLS[toolId] || [];
  const usageGuide = USAGE_GUIDES[toolId];
  const faqItems = FAQS[toolId] || [];

  function fillExample(text) {
    setInput(text);
    const ta = document.querySelector('.tool-textarea');
    if (ta) { ta.value = text; ta.focus(); }
  }

  async function handleGenerate() {
    if (hasUpload && file) {
      await handleUpload();
      return;
    }
    if (!input.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const token = localStorage.getItem('user_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ toolId, input, prompt: null })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.html);
        trackToolUsage(toolId);
      } else {
        setResult(`<div style="color:#ef4444;text-align:center;padding:24px;">Error: ${data.error}</div>`);
      }
    } catch (err) {
      setResult(`<div style="color:#ef4444;text-align:center;padding:24px;">Network error: ${err.message}</div>`);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    setLoading(true);
    setResult('');

    try {
      const token = localStorage.getItem('user_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/image-to-prompt', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setResult(`<div style="padding:var(--space-md)">
          <h3 style="margin-bottom:12px">Generated Prompt:</h3>
          <p style="font-family:var(--font-mono);font-size:0.9rem;line-height:1.8;color:var(--text-secondary)">
            ${data.prompt}
          </p>
        </div>`);
        trackToolUsage(toolId);
      } else {
        setResult(`<div style="color:#ef4444;text-align:center;padding:24px;">Error: ${data.error}</div>`);
      }
    } catch (err) {
      setResult(`<div style="color:#ef4444;text-align:center;padding:24px;">Network error: ${err.message}</div>`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section tool-page">
      <div className="container">
        <div className="tool-page-header">
          <div className="tool-page-icon">{icon}</div>
          <h1 className="tool-page-title">{title}</h1>
          <p className="tool-page-desc">{description}</p>
        </div>

        <div className="tool-layout" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div className="tool-workspace" style={{ flex: 1, minWidth: 0 }}>

            {usageGuide && (
              <div className="tool-section">
                <h2>How to Use {title}</h2>
                <div className="usage-steps" dangerouslySetInnerHTML={{ __html: usageGuide }} />
              </div>
            )}

            {hasUpload && (
              <div className="upload-zone" onClick={() => document.getElementById('file-input')?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--neon-purple)'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = ''; }}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '';
                  const f = e.dataTransfer.files[0];
                  if (f) setFile(f);
                }}>
                <input id="file-input" type="file" accept="image/*,video/*" style={{ display: 'none' }}
                  onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />
                <div className="upload-zone-icon">{file ? '✅' : '📁'}</div>
                <h3>{file ? file.name : 'Upload a file'}</h3>
                <p>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Click or drag to upload'}</p>
              </div>
            )}

            {!hasUpload && (
              <div className="tool-input-area">
                <textarea
                  className="tool-textarea"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={placeholder || `Enter your input for ${title}...`}
                />
                <div className="tool-examples" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Try:</span>
                  <button className="btn btn-xs btn-outline" onClick={() => fillExample('Write a blog post about AI marketing trends in 2026')}>AI marketing trends</button>
                  <button className="btn btn-xs btn-outline" onClick={() => fillExample('Create SEO-optimized content for a SaaS startup')}>SaaS SEO content</button>
                  <button className="btn btn-xs btn-outline" onClick={() => fillExample('Generate a professional email outreach template')}>Email outreach</button>
                </div>
              </div>
            )}

            <button className="btn btn-primary generate-btn" onClick={handleGenerate} disabled={loading || (!input.trim() && !file)}>
              {loading ? 'Generating...' : '✨ Generate'}
            </button>

            {loading && (
              <>
                <div className="results-section">
                  <div className="results-placeholder">
                    <div className="saas-spinner" style={{ margin: '0 auto 16px' }}></div>
                    <p>AI is generating your content...</p>
                  </div>
                </div>
              </>
            )}

            <div className="results-section">
              {!result && !loading && (
                <div className="results-placeholder">
                  <div className="icon">✨</div>
                  <p>Your generated content will appear here</p>
                </div>
              )}
              {result && (
                <div className="results-content saas-result-fade">
                  <div className="results-header">
                    <h3>Results</h3>
                    <button className="btn btn-sm btn-secondary" onClick={() => {
                      const el = document.querySelector('.results-content-inner') || document.querySelector('.results-content');
                      if (el) navigator.clipboard.writeText(el.textContent);
                    }}>Copy</button>
                  </div>

                  <div className="results-content-inner" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-md)' }}
                    dangerouslySetInnerHTML={{ __html: result }} />

                  <div className="results-content-inner" style={{ padding: 'var(--space-md)', marginTop: 'var(--space-md)' }}
                    dangerouslySetInnerHTML={{ __html: result }} />
                </div>
              )}
            </div>

            {faqItems && faqItems.length > 0 && (
              <div className="tool-section">
                <h2 onClick={() => setShowFaq(!showFaq)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  FAQ {showFaq ? '▾' : '▸'}
                </h2>
                {showFaq && (
                  <div className="faq-list">
                    {faqItems.map((item, i) => (
                      <div key={i} className="faq-item" style={{ marginBottom: 16 }}>
                        <h4 style={{ color: 'var(--neon-purple)', marginBottom: 4 }}>{item.q}</h4>
                        <p style={{ color: 'var(--text-secondary)' }}>{item.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {relatedIds.length > 0 && (
              <div className="tool-section">
                <h2>Related Tools</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {relatedIds.map(id => (
                    <a key={id} href={`/tools/${id}`} className="btn btn-sm btn-outline">
                      {TOOL_NAMES[id]?.name || id}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {article && (
              <div className="tool-section">
                <h2>Learn More</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Read our detailed guide:{' '}
                  <a href={`/blog/${article.slug}`} style={{ color: 'var(--neon-purple)' }}>
                    {article.title}
                  </a>
                </p>
              </div>
            )}
          </div>

          {showSidebar && (
            <aside className="tool-sidebar" style={{ width: 300, flexShrink: 0 }}>
              <div style={{ position: 'sticky', top: 100 }}>
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}

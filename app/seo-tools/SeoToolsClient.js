'use client';

import { useState } from 'react';

const TOOLS = [
  {
    id: 'ranking', name: 'Website Ranking Checker', icon: '📊',
    desc: 'Check estimated ranking potential for any keyword on any website',
    color: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    howTo: [
      'Enter the full website URL you want to analyze (e.g. https://example.com)',
      'Type the keyword you want to check ranking potential for',
      'Click "Check Ranking" and AI will analyze ranking factors',
      'Review the difficulty assessment and actionable recommendations'
    ],
    fields: [
      { key: 'url', label: 'Website URL', type: 'url', placeholder: 'https://example.com' },
      { key: 'keyword', label: 'Target Keyword', type: 'text', placeholder: 'e.g. best SEO tools' }
    ],
    btnLabel: 'Check Ranking'
  },
  {
    id: 'keywords', name: 'Keywords Suggestion Tool', icon: '🔑',
    desc: 'Generate 20 related keywords with search intent and competition analysis',
    color: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    howTo: [
      'Enter a seed keyword or topic related to your niche',
      'Choose the type of keywords you need (broad, long-tail, or LSI)',
      'Click "Generate Keywords" and AI will create a structured list',
      'Use the results for content planning and SEO strategy'
    ],
    fields: [
      { key: 'keyword', label: 'Seed Keyword or Topic', type: 'text', placeholder: 'e.g. digital marketing' }
    ],
    btnLabel: 'Generate Keywords'
  },
  {
    id: 'density', name: 'Keyword Density Checker', icon: '📏',
    desc: 'Analyze keyword frequency and density in any text content',
    color: 'linear-gradient(135deg, #fed7aa, #fdba74)',
    howTo: [
      'Paste your article or webpage content into the text area',
      'The AI will extract and analyze top keywords and phrases',
      'Review the density table and SEO balance assessment',
      'Follow the suggestions to optimize keyword distribution'
    ],
    fields: [
      { key: 'text', label: 'Paste your content', type: 'textarea', placeholder: 'Paste article text here...' }
    ],
    btnLabel: 'Analyze Density'
  },
  {
    id: 'cache', name: 'Google Cache Checker', icon: '💾',
    desc: 'Analyze cache status and crawl frequency estimates for any URL',
    color: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
    howTo: [
      'Enter the full URL you want to check cache status for',
      'Click "Check Cache" to get AI-powered cache analysis',
      'Review the cache status explanation and crawl estimates',
      'Follow the tips to improve caching and indexing'
    ],
    fields: [
      { key: 'url', label: 'Website URL', type: 'url', placeholder: 'https://example.com/page' }
    ],
    btnLabel: 'Check Cache'
  },
  {
    id: 'index', name: 'Google Index Checker', icon: '🔍',
    desc: 'Check if your page is likely indexed and get indexing improvement tips',
    color: 'linear-gradient(135deg, #e9d5ff, #d8b4fe)',
    howTo: [
      'Enter the URL you want to check index status for',
      'Click "Check Index" for AI-powered indexability assessment',
      'Review common indexing issues and their fixes',
      'Use the provided methods to verify actual index status'
    ],
    fields: [
      { key: 'url', label: 'Website URL', type: 'url', placeholder: 'https://example.com/page' }
    ],
    btnLabel: 'Check Index'
  },
  {
    id: 'metaGen', name: 'Meta Tag Generator', icon: '🏷️',
    desc: 'Generate complete HTML meta tags including SEO and social media tags',
    color: 'linear-gradient(135deg, #ccfbf1, #a7f3d0)',
    howTo: [
      'Enter your page title, description, and target keywords',
      'Provide the page URL for canonical and OG tags',
      'Click "Generate Meta Tags" to create a complete set',
      'Copy the generated HTML and paste it into your page <head>'
    ],
    fields: [
      { key: 'title', label: 'Page Title', type: 'text', placeholder: 'My Awesome Page Title' },
      { key: 'description', label: 'Meta Description', type: 'text', placeholder: 'A brief description of the page...' },
      { key: 'keywords', label: 'Target Keywords (comma separated)', type: 'text', placeholder: 'keyword1, keyword2, keyword3' },
      { key: 'url', label: 'Page URL', type: 'url', placeholder: 'https://example.com/page' }
    ],
    btnLabel: 'Generate Meta Tags'
  },
  {
    id: 'metaAnalyze', name: 'Meta Tag Analyzer', icon: '✅',
    desc: 'Analyze existing meta tags and get a quality score with fix suggestions',
    color: 'linear-gradient(135deg, #fecaca, #fca5a5)',
    howTo: [
      'Paste your page URL or the HTML meta tag section',
      'Click "Analyze Meta Tags" for a full audit',
      'Review the 0-100 score and per-tag analysis',
      'Implement the suggested fixes for better SEO'
    ],
    fields: [
      { key: 'input', label: 'URL or HTML Meta Tags', type: 'textarea', placeholder: 'Paste URL or the <head> HTML section containing meta tags...' }
    ],
    btnLabel: 'Analyze Meta Tags'
  },
  {
    id: 'ogCheck', name: 'Open Graph Checker', icon: '📋',
    desc: 'Check Open Graph tags and identify missing or broken social media tags',
    color: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
    howTo: [
      'Enter the URL or paste the Open Graph HTML section',
      'Click "Check OG Tags" to analyze all og: properties',
      'Review the status of each required and optional tag',
      'Get corrected code for missing or invalid tags'
    ],
    fields: [
      { key: 'input', label: 'URL or OG HTML', type: 'textarea', placeholder: 'Paste URL or HTML containing og: meta tags...' }
    ],
    btnLabel: 'Check OG Tags'
  },
  {
    id: 'ogGen', name: 'Open Graph Generator', icon: '🖼️',
    desc: 'Generate complete Open Graph HTML meta tags for social sharing',
    color: 'linear-gradient(135deg, #fef08a, #fde047)',
    howTo: [
      'Enter your page title and description for social sharing',
      'Provide the image URL that should appear when shared',
      'Enter the page URL for the og:url property',
      'Click "Generate OG Tags" and copy the ready-to-use HTML'
    ],
    fields: [
      { key: 'title', label: 'OG Title', type: 'text', placeholder: 'Title for social sharing' },
      { key: 'description', label: 'OG Description', type: 'text', placeholder: 'Description for social sharing' },
      { key: 'image', label: 'Image URL', type: 'url', placeholder: 'https://example.com/image.jpg' },
      { key: 'url', label: 'Page URL', type: 'url', placeholder: 'https://example.com/page' }
    ],
    btnLabel: 'Generate OG Tags'
  },
  {
    id: 'twitterCard', name: 'Twitter Card Generator', icon: '🐦',
    desc: 'Generate Twitter Card meta tags for rich tweet previews',
    color: 'linear-gradient(135deg, #cffafe, #a5f3fc)',
    howTo: [
      'Select a card type (summary, summary_large_image, app, or player)',
      'Enter the title, description, and image URL for the card',
      'Provide your Twitter handle (e.g. @username)',
      'Click "Generate Card" and copy the HTML into your page'
    ],
    fields: [
      { key: 'cardType', label: 'Card Type', type: 'select', options: ['summary', 'summary_large_image', 'app', 'player'], placeholder: 'summary_large_image' },
      { key: 'title', label: 'Card Title', type: 'text', placeholder: 'Title for Twitter card' },
      { key: 'description', label: 'Card Description', type: 'text', placeholder: 'Description for Twitter card' },
      { key: 'image', label: 'Image URL', type: 'url', placeholder: 'https://example.com/image.jpg' },
      { key: 'site', label: 'Twitter Handle', type: 'text', placeholder: '@username' }
    ],
    btnLabel: 'Generate Card'
  },
  {
    id: 'utm', name: 'UTM Builder', icon: '🔗',
    desc: 'Build complete UTM tracking URLs for campaign measurement',
    color: 'linear-gradient(135deg, #ecfccb, #d9f99d)',
    howTo: [
      'Enter the base URL of your landing page',
      'Fill in UTM parameters: source, medium, campaign name',
      'Optionally add term and content for finer tracking',
      'Click "Build URL" to get the complete tagged URL with parameter explanation'
    ],
    fields: [
      { key: 'url', label: 'Base URL', type: 'url', placeholder: 'https://example.com/landing-page' },
      { key: 'source', label: 'Campaign Source (e.g. google, newsletter)', type: 'text', placeholder: 'google' },
      { key: 'medium', label: 'Campaign Medium (e.g. cpc, email)', type: 'text', placeholder: 'cpc' },
      { key: 'campaign', label: 'Campaign Name', type: 'text', placeholder: 'spring_sale' },
      { key: 'term', label: 'Campaign Term (optional)', type: 'text', placeholder: 'seo+tools' },
      { key: 'content', label: 'Campaign Content (optional)', type: 'text', placeholder: 'hero_button' }
    ],
    btnLabel: 'Build URL'
  }
];

function ResultDisplay({ result, onCopy }) {
  return (
    <div className="results-section" style={{ marginTop: 24 }}>
      <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Result</h3>
        <button onClick={onCopy} className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          📋 Copy
        </button>
      </div>
      <div className="glass-card" style={{ padding: 24, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)', maxHeight: 600, overflowY: 'auto' }}>
        {result}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div className="saas-spinner" style={{ margin: '0 auto 16px', width: 40, height: 40, borderWidth: 3 }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Analyzing with AI...</p>
    </div>
  );
}

export default function SeoToolsClient() {
  const [activeToolId, setActiveToolId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({});

  const activeTool = activeToolId ? TOOLS.find(t => t.id === activeToolId) : null;

  const handleCardClick = (id) => {
    if (activeToolId === id) {
      setActiveToolId(null);
      return;
    }
    const tool = TOOLS.find(t => t.id === id);
    setActiveToolId(id);
    setResult(null);
    setError(null);
    const defaults = {};
    tool.fields.forEach(f => { defaults[f.key] = ''; });
    setFormValues(defaults);
  };

  const handleFieldChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!activeTool) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/seo-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: activeTool.id, inputs: formValues })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) navigator.clipboard.writeText(result);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">🔧 SEO Toolkit</span>
          <h1 className="section-title">Free AI SEO Tools</h1>
          <p className="section-subtitle">11 powerful AI-driven tools to analyze, optimize, and improve your website&apos;s SEO. Powered by OpenRouter AI.</p>
        </div>

        <div className="tools-grid">
          {TOOLS.map(tool => (
            <div
              key={tool.id}
              className="tool-card"
              onClick={() => handleCardClick(tool.id)}
              style={{
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: activeToolId === tool.id ? '2px solid var(--neon-cyan)' : ''
              }}
            >
              <div style={{ flex: 1 }}>
                <div className="tool-icon" style={{ fontSize: '2.2rem', marginBottom: 12, background: tool.color }}>{tool.icon}</div>
                <h3 className="tool-name" style={{ fontSize: '1rem', marginBottom: 8 }}>{tool.name}</h3>
                <p className="tool-description" style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16 }}>{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {activeTool && (
          <div key={activeToolId} style={{ marginTop: 40 }} className="saas-result-fade">
            <div className="glass-card" style={{ padding: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ fontSize: '2rem', background: activeTool.color, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
                  {activeTool.icon}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{activeTool.name}</h2>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{activeTool.desc}</p>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 12, color: 'var(--text-primary)' }}>How to use:</h4>
                <ol style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 2 }}>
                  {activeTool.howTo.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {activeTool.fields.map(field => {
                  const shared = {
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  };
                  if (field.type === 'select') {
                    return (
                      <div key={field.key}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>{field.label}</label>
                        <select value={formValues[field.key] || ''} onChange={e => handleFieldChange(field.key, e.target.value)} style={shared}>
                          <option value="">Select card type...</option>
                          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    );
                  }
                  if (field.type === 'textarea') {
                    return (
                      <div key={field.key}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>{field.label}</label>
                        <textarea value={formValues[field.key] || ''} onChange={e => handleFieldChange(field.key, e.target.value)} placeholder={field.placeholder} rows={5} style={{ ...shared, resize: 'vertical', minHeight: 100, fontFamily: 'inherit' }} />
                      </div>
                    );
                  }
                  return (
                    <div key={field.key}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>{field.label}</label>
                      <input type={field.type} value={formValues[field.key] || ''} onChange={e => handleFieldChange(field.key, e.target.value)} placeholder={field.placeholder} style={shared} />
                    </div>
                  );
                })}
              </div>

              <button onClick={handleGenerate} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px 24px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Analyzing...' : activeTool.btnLabel}
              </button>

              {loading && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div className="saas-spinner" style={{ margin: '0 auto 16px', width: 40, height: 40, borderWidth: 3 }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Analyzing with AI...</p>
                </div>
              )}

              {error && (
                <div className="glass-card" style={{ marginTop: 20, padding: 16, borderLeft: '4px solid #ef4444' }}>
                  <p style={{ color: '#ef4444', margin: 0, fontSize: '0.9rem' }}>⚠ {error}</p>
                </div>
              )}

              {result && (
                <div className="results-section" style={{ marginTop: 24 }}>
                  <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0 }}>Result</h3>
                    <button onClick={copyResult} className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>📋 Copy</button>
                  </div>
                  <div className="glass-card" style={{ padding: 24, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)', maxHeight: 600, overflowY: 'auto' }}>{result}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

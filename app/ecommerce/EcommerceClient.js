'use client';

import { useState } from 'react';

const tools = [
  { name: 'Product Description Generator', icon: '📋', toolId: 'product-description' },
  { name: 'Ad Copy Generator', icon: '📢', toolId: 'ad-copy' },
  { name: 'Sales Copy Generator', icon: '💰', toolId: 'sales-copy' },
  { name: 'Product Title Generator', icon: '📌', toolId: 'product-title' },
  { name: 'Pricing Optimizer', icon: '💲', toolId: 'pricing-optimizer' },
  { name: 'Product Idea Finder', icon: '💡', toolId: 'product-idea' },
  { name: 'Amazon Listing Generator', icon: '📦', toolId: 'amazon-listing' },
  { name: 'Etsy Listing Generator', icon: '🪡', toolId: 'etsy-listing' },
  { name: 'Shopify SEO Generator', icon: '🛍️', toolId: 'shopify-seo' },
  { name: 'Dropshipping Research', icon: '🔍', toolId: 'dropshipping-research' },
  { name: 'Digital Product Creator', icon: '💡', toolId: 'digital-product' },
  { name: 'Review Response Generator', icon: '⭐', toolId: 'review-response' },
  { name: 'Landing Page Generator', icon: '🌐', toolId: 'landing-page' },
  { name: 'Product Image Enhancer', icon: '🖼️', toolId: 'product-image' },
  { name: 'Digital Product Email Writer', icon: '✉️', toolId: 'digital-product-email' },
];

export default function EcommerceClient() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!selectedTool || !input.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const token = localStorage.getItem('user_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ toolId: selectedTool.toolId, input })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.html);
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
    <section className="section" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-badge">🛒 Marketplace</span>
          <h1 className="section-title">AI Digital Product Suite</h1>
          <p className="section-subtitle">Create, optimize, and sell digital products with AI-powered tools.</p>
        </div>

        <div className="tools-grid" style={{ marginBottom: 48 }}>
          {tools.map((tool, i) => (
            <div key={i} className={`tool-card ${selectedTool?.name === tool.name ? 'active' : ''}`}
              onClick={() => setSelectedTool(tool)}
              style={{ cursor: 'pointer', ...(selectedTool?.name === tool.name ? { borderColor: 'var(--neon-purple)', boxShadow: 'var(--shadow-glow-purple)' } : {}) }}>
              <div className="tool-icon">{tool.icon}</div>
              <h3 className="tool-name" style={{ fontSize: '1rem' }}>{tool.name}</h3>
            </div>
          ))}
        </div>

        {selectedTool && (
          <div className="tool-workspace" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: '2rem' }}>{selectedTool.icon}</span>
              <h2>{selectedTool.name}</h2>
            </div>
            <div className="tool-input-area">
              <textarea className="tool-textarea" value={input} onChange={e => setInput(e.target.value)}
                placeholder={`Enter your input for ${selectedTool.name}...`} />
            </div>
            <button className="btn btn-primary generate-btn" onClick={handleGenerate} disabled={loading || !input.trim()}>
              {loading ? 'Generating...' : '✨ Generate'}
            </button>
            <div className="results-section">
              {!result && !loading && (
                <div className="results-placeholder">
                  <div className="icon">✨</div>
                  <p>Select a tool, enter input, and generate</p>
                </div>
              )}
              {loading && (
                <div className="results-placeholder">
                  <div className="saas-spinner" style={{ margin: '0 auto 16px' }}></div>
                  <p>AI is generating...</p>
                </div>
              )}
              {result && (
                <div className="results-content saas-result-fade">
                  <div className="results-header">
                    <h3>✨ Results</h3>
                    <button className="btn btn-sm btn-secondary" onClick={() => {
                      const el = document.querySelector('.results-content-inner');
                      if (el) navigator.clipboard.writeText(el.textContent);
                    }}>📋 Copy</button>
                  </div>
                  <div className="results-content-inner" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-md)' }}
                    dangerouslySetInnerHTML={{ __html: result }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';

const PLATFORMS = [
  { id: 'etsy', name: 'Etsy', color: '#F56400', emoji: '🛍️' },
  { id: 'kdp', name: 'Amazon KDP', color: '#FF9900', emoji: '📚' },
  { id: 'gumroad', name: 'Gumroad', color: '#FF90E8', emoji: '💸' },
  { id: 'creative-fabrica', name: 'Creative Fabrica', color: '#5C2D91', emoji: '🎨' },
  { id: 'tpt', name: 'TPT', color: '#00B4D8', emoji: '🎓' },
];

const TABS = [
  { id: 'seo', label: 'SEO' },
  { id: 'page', label: 'صفحة المنتج' },
  { id: 'cover', label: 'الغلاف' },
  { id: 'pricing', label: 'التسعير' },
  { id: 'marketing', label: 'التسويق' },
  { id: 'cro', label: 'CRO' },
  { id: 'validation', label: '✅ Validation' },
  { id: 'blueprint', label: '📋 Blueprint' },
  { id: 'keywords', label: '🔑 Keywords' },
  { id: 'images', label: '🎨 Images' },
  { id: 'intelligence', label: '🔥 Market Intel' },
  { id: 'listing', label: '🔥 Listing Gen' },
  { id: 'trends', label: '📈 Trend Finder' },
  { id: 'launch', label: '🚀 Launch' },
];

const READINESS_FIELDS = ['title', 'description', 'keywords'];

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) { const o = btn.textContent; btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = o, 2000); }
  });
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
}

function ScoreRing({ value, label, color }) {
  const v = Math.max(0, Math.min(100, value || 0));
  const r = 30, c = 2 * Math.PI * r, dash = (v / 100) * c;
  return (
    <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 14, textAlign: 'center' }}>
      <svg width="76" height="76" viewBox="0 0 76 76" style={{ display: 'block', margin: '0 auto 8px' }}>
        <circle cx="38" cy="38" r={r} fill="none" stroke="#2d2d4e" strokeWidth="6" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 38 38)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x="38" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">{v}</text>
      </svg>
      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

function ResultCard({ title, content, onCopy }) {
  const text = Array.isArray(content) ? content.join('\n• ') : (content || '');
  return (
    <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>{title}</h4>
        <button onClick={(e) => copyToClipboard(Array.isArray(content) ? content.join('\n') : text, e.currentTarget)}
          style={{ background: '#2d2d4e', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>📋 Copy</button>
      </div>
      {Array.isArray(content) ? (
        <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', fontSize: 13, lineHeight: 1.7 }}>
          {content.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{item}</li>)}
        </ul>
      ) : (
        <div style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</div>
      )}
    </div>
  );
}

function InfoCard({ label, value, color }) {
  return (
    <div style={{ background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 10, color: color || '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{value}</div>
    </div>
  );
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) { const o = btn.textContent; btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = o, 2000); }
  });
}

export default function DigitalCreatorClient() {
  const [platform, setPlatform] = useState('etsy');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMimeType, setImageMimeType] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [highProfitMode, setHighProfitMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('seo');
  const [copiedKey, setCopiedKey] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelError, setIntelError] = useState(null);
  const [listingInput, setListingInput] = useState('');
  const [listing, setListing] = useState(null);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState(null);
  const [listingPlatform, setListingPlatform] = useState('etsy');
  const [trendData, setTrendData] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState(null);
  const [trendNiche, setTrendNiche] = useState('');
  const [launchData, setLaunchData] = useState(null);
  const [launchLoading, setLaunchLoading] = useState(false);
  const [launchError, setLaunchError] = useState(null);
  const [exportFormat, setExportFormat] = useState('txt');
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  const readiness = Math.round(
    READINESS_FIELDS.reduce((sum, field) => {
      const values = { title, description, keywords };
      return sum + (values[field] && values[field].trim() ? 25 : 0);
    }, 0) + (price && price.trim() ? 15 : 0) + (imageBase64 ? 10 : 0)
  );

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('حجم الصورة يتجاوز 5 ميجا'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setImageBase64(result.split(',')[1]);
      setImageMimeType(file.type);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageBase64(null); setImageMimeType(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!title.trim()) { setError('Product title is required'); return; }
    setError(null); setLoading(true); setAnalysis(null);
    try {
      const res = await fetch('/api/digital-creator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, title, description, keywords, price, url, imageBase64, imageMimeType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setAnalysis(data.analysis);
      setActiveTab('seo');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const loadIntelligence = async () => {
    if (!analysis || intelLoading) return;
    setIntelLoading(true); setIntelError(null);
    try {
      const res = await fetch('/api/digital-creator/market-intelligence', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, platform })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load market intelligence');
      setIntelligence(data);
    } catch (e) { setIntelError(e.message); }
    finally { setIntelLoading(false); }
  };

  const generateListings = async (overrideName = null) => {
    const name = (overrideName || listingInput || title || '').trim();
    if (!name || name.length < 2) { setListingError('Enter a product name.'); return; }
    if (listingLoading) return;
    if (overrideName) setListingInput(overrideName);
    setListingLoading(true); setListingError(null); setListing(null);
    try {
      const res = await fetch('/api/digital-creator/listing-generator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate listings');
      setListing(data); setListingPlatform('etsy');
    } catch (e) { setListingError(e.message); }
    finally { setListingLoading(false); }
  };

  const loadTrends = async () => {
    setTrendLoading(true); setTrendError(null); setTrendData(null);
    try {
      const res = await fetch('/api/digital-creator/research', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: trendNiche || title || 'digital products', highProfitMode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setTrendData(data);
    } catch (e) { setTrendError(e.message); }
    finally { setTrendLoading(false); }
  };

  const loadLaunch = async () => {
    if (!title.trim()) { setLaunchError('Enter a product name first.'); return; }
    setLaunchLoading(true); setLaunchError(null); setLaunchData(null);
    try {
      const res = await fetch('/api/digital-creator/launch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: title, platform, audience: 'Digital product buyers' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setLaunchData(data);
    } catch (e) { setLaunchError(e.message); }
    finally { setLaunchLoading(false); }
  };

  function exportAll() {
    if (!analysis) return;
    let content = '=== DIGITAL PRODUCT ANALYSIS ===\n\n';
    content += `Product: ${title}\nPlatform: ${platform}\n\n`;

    content += `--- VALIDATION ---\n`;
    if (analysis.validation) {
      Object.entries(analysis.validation).forEach(([k, v]) => { content += `${k}: ${v}\n`; });
    }
    content += `\n--- SCORES ---\nSEO: ${analysis.seo_score}/100 | Competition: ${analysis.competition_score}/100 | Demand: ${analysis.demand_score}/100 | Conversion: ${analysis.conversion_score}/100\n`;
    content += `Sales: ${analysis.monthly_prediction_min}-${analysis.monthly_prediction_max}/month\n\n`;
    content += `Optimized Title: ${analysis.optimized_title}\n\n`;

    if (analysis.keywords?.length) content += `Keywords: ${analysis.keywords.join(', ')}\n\n`;
    if (analysis.bullets?.length) content += `Bullets:\n${analysis.bullets.map(b => `• ${b}`).join('\n')}\n\n`;
    if (analysis.cover_tips?.length) content += `Cover Tips:\n${analysis.cover_tips.map(t => `• ${t}`).join('\n')}\n\n`;
    content += `Pricing: Min $${analysis.price_min} | Recommended $${analysis.price_recommended} | Premium $${analysis.price_premium}\n`;
    content += `Bundle: ${analysis.bundle_idea}\nUpsell: ${analysis.upsell_idea}\n\n`;

    if (analysis.blueprint) {
      content += `--- BLUEPRINT ---\n`;
      content += `Positioning: ${analysis.blueprint.positioning}\nUSP: ${analysis.blueprint.usp}\nPricing Strategy: ${analysis.blueprint.pricingStrategy}\nLaunch Strategy: ${analysis.blueprint.launchStrategy}\n\n`;
    }
    if (analysis.keywordIntelligence?.primary?.length) {
      content += `--- KEYWORD INTELLIGENCE ---\nPrimary: ${analysis.keywordIntelligence.primary.join(', ')}\nSecondary: ${analysis.keywordIntelligence.secondary?.join(', ')}\nLong-Tail: ${analysis.keywordIntelligence.longTail?.join(', ')}\n\n`;
    }
    if (analysis.imagePrompts) {
      content += `--- IMAGE PROMPTS ---\n`;
      Object.entries(analysis.imagePrompts).forEach(([k, v]) => {
        if (v?.standard) content += `${k} (Standard): ${v.standard}\n`;
      });
    }

    const ext = exportFormat === 'md' ? 'md' : 'txt';
    downloadFile(content, `product-${title?.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-') || 'analysis'}.${ext}`);
  }

  function renderCopyBtn(text, key) {
    return (
      <button onClick={(e) => { setCopiedKey(key); copyText(text, e.currentTarget); }}
        style={{ background: copiedKey === key ? '#10b981' : '#2d2d4e', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
        {copiedKey === key ? '✅ Copied' : '📋 Copy'}
      </button>
    );
  }

  const analysisAvailable = analysis && !loading;

  return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh', color: '#e2e8f0' }}>
      <nav style={{ background: '#16162a', borderBottom: '1px solid #2d2d4e', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <defs><linearGradient id="dcg" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stopColor="#6c63ff" /><stop offset="100%" stopColor="#f72585" /></linearGradient></defs>
            <rect width="32" height="32" rx="8" fill="url(#dcg)" />
            <path d="M8 12h16M8 16h10M8 20h13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="24" cy="10" r="3" fill="#f72585" />
          </svg>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>AI Digital Creator Suite</h1>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); if (t.id === 'intelligence' && analysis && !intelligence && !intelLoading) loadIntelligence(); }}
              style={{ background: activeTab === t.id ? 'linear-gradient(135deg, #6c63ff, #f72585)' : 'transparent', color: activeTab === t.id ? '#fff' : '#94a3b8', border: '1px solid ' + (activeTab === t.id ? 'transparent' : '#2d2d4e'), borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, minHeight: 'calc(100vh - 52px)' }}>
        <aside style={{ background: '#16162a', borderRight: '1px solid #2d2d4e', padding: 16, overflowY: 'auto' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>Platform</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 4 }}>
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  style={{ background: platform === p.id ? p.color : '#0f0f1a', color: '#fff', border: '1px solid ' + (platform === p.id ? p.color : '#2d2d4e'), borderRadius: 6, padding: '6px 4px', fontSize: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 16 }}>{p.emoji}</span>{p.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>Product Image (optional)</label>
            <div onClick={() => fileInputRef.current?.click()} style={{ background: '#0f0f1a', border: '2px dashed #2d2d4e', borderRadius: 8, padding: 12, textAlign: 'center', cursor: 'pointer', minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {imagePreview ? (
                <><img src={imagePreview} alt="" style={{ maxWidth: '100%', maxHeight: 90, borderRadius: 4 }} />
                  <button onClick={(e) => { e.stopPropagation(); removeImage(); }} style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, width: 20, height: 20, fontSize: 10, cursor: 'pointer' }}>✕</button></>
              ) : <div style={{ color: '#64748b', fontSize: 11 }}>📎 Click to upload</div>}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>Product Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Budget Planner Printable PDF"
              style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 6, padding: '8px 10px', color: '#fff', fontSize: 12, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Short product description..." rows={2}
              style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 6, padding: '8px 10px', color: '#fff', fontSize: 12, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>Keywords</label>
            <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="budget, planner, printable"
              style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 6, padding: '8px 10px', color: '#fff', fontSize: 12, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div><label style={{ fontSize: 10, fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>Price ($)</label>
              <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" placeholder="9.99"
                style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 6, padding: '6px 8px', color: '#fff', fontSize: 12, boxSizing: 'border-box' }} /></div>
            <div><label style={{ fontSize: 10, fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>URL</label>
              <input value={url} onChange={e => setUrl(e.target.value)} type="url" placeholder="https://..."
                style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 6, padding: '6px 8px', color: '#fff', fontSize: 12, boxSizing: 'border-box' }} /></div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer', fontSize: 12, color: '#cbd5e1' }}>
            <input type="checkbox" checked={highProfitMode} onChange={e => setHighProfitMode(e.target.checked)} style={{ accentColor: '#f72585' }} />
            💰 High Profit Opportunity Mode
          </label>

          <div style={{ background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 6, padding: 8, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Readiness</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: readiness >= 80 ? '#10b981' : readiness >= 50 ? '#fbbf24' : '#ef4444' }}>{readiness}%</span>
            </div>
            <div style={{ height: 3, background: '#2d2d4e', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
              <div style={{ width: readiness + '%', height: '100%', background: readiness >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : readiness >= 50 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #ef4444, #f87171)', transition: 'width 0.4s' }} />
            </div>
          </div>

          <button onClick={handleAnalyze} disabled={loading || !title.trim()}
            style={{ width: '100%', background: loading || !title.trim() ? '#2d2d4e' : 'linear-gradient(135deg, #6c63ff, #f72585)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 13, fontWeight: 700, cursor: loading || !title.trim() ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Analyzing...' : '🚀 Analyze Product'}
          </button>
        </aside>

        <main style={{ padding: 20, overflowY: 'auto' }}>
          {error && <div style={{ background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 8, padding: 12, marginBottom: 16, color: '#fca5a5', fontSize: 13 }}>⚠️ {error}</div>}

          {!analysis && !loading && activeTab !== 'trends' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🎯</div>
              <h2 style={{ color: '#cbd5e1', fontSize: 20, marginBottom: 6 }}>Ready to optimize your product?</h2>
               <p style={{ maxWidth: 380, fontSize: 13, lineHeight: 1.6 }}>Fill in the details and click &quot;Analyze Product&quot; for 14+ AI-powered outputs including validation, blueprint, and image prompts.</p>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
              <div style={{ width: 44, height: 44, border: '4px solid #2d2d4e', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>AI is analyzing your product...</p>
            </div>
          )}

          {/* TREND FINDER */}
          {activeTab === 'trends' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'linear-gradient(135deg, #16162a, #1e1e3a)', border: '1px solid #2d2d4e', borderRadius: 14, padding: 20 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#fff' }}>📈 Trending Digital Products Finder</h2>
                <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 14px' }}>Discover profitable digital product opportunities with demand, competition, and profit analysis.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input value={trendNiche} onChange={e => setTrendNiche(e.target.value)} placeholder="Niche (e.g. planners, journals, printables)" style={{ flex: '1 1 200px', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, boxSizing: 'border-box' }} />
                  <button onClick={loadTrends} disabled={trendLoading}
                    style={{ background: trendLoading ? '#2d2d4e' : 'linear-gradient(135deg, #f72585, #6c63ff)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: trendLoading ? 'not-allowed' : 'pointer' }}>
                    {trendLoading ? '⏳ Searching...' : '🔍 Find Trends'}
                  </button>
                </div>
              </div>

              {trendError && <div style={{ background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 8, padding: 12, color: '#fca5a5', fontSize: 13 }}>⚠️ {trendError}</div>}

              {trendLoading && (
                <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                  <div style={{ width: 36, height: 36, border: '3px solid #2d2d4e', borderTopColor: '#f72585', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13 }}>Analyzing market trends...</p>
                </div>
              )}

              {trendData && (
                <>
                  {trendData.trendingProducts?.length > 0 && (
                    <div>
                      <h3 style={{ color: '#fff', fontSize: 15, margin: '0 0 10px' }}>🔥 Trending Product Ideas</h3>
                      <div style={{ display: 'grid', gap: 10 }}>
                        {trendData.trendingProducts.map((p, i) => (
                          <div key={i} style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{p.productIdea}</div>
                                <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.reasoning}</div>
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: p.demandScore >= 80 ? 'rgba(16,185,129,0.15)' : 'rgba(251,191,36,0.15)', color: p.demandScore >= 80 ? '#10b981' : '#fbbf24' }}>Demand {p.demandScore}</span>
                                <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: p.competitionScore <= 40 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: p.competitionScore <= 40 ? '#10b981' : '#ef4444' }}>Comp {p.competitionScore}</span>
                                <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#6c63ff22', color: '#a5b4fc' }}>{p.difficultyLevel}</span>
                              </div>
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                              <span style={{ fontSize: 10, color: '#64748b' }}>🎯 {p.recommendedPlatform}</span>
                              <span style={{ fontSize: 10, color: '#64748b' }}>💰 {p.profitPotential}</span>
                              <button onClick={(e) => copyToClipboard(p.productIdea, e.currentTarget)} style={{ marginLeft: 'auto', background: '#2d2d4e', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 10, cursor: 'pointer' }}>Copy</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {trendData.niches && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                      {Object.entries(trendData.niches).filter(([, v]) => v?.length).map(([key, items]) => (
                        <div key={key} style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: 8 }}>{key.replace(/([A-Z])/g, ' $1')}</div>
                          {items.map((item, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#cbd5e1', padding: '4px 0', borderBottom: i < items.length - 1 ? '1px solid #2d2d4e' : 'none' }}>
                              {typeof item === 'object' ? `${item.niche} (${item.peakMonths})` : item}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {trendData.trendData && (
                    <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 14 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>📊 Trend Data</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {trendData.trendData.risingSearches?.length > 0 && <InfoCard label="Rising Searches" value={trendData.trendData.risingSearches.join(', ')} color="#10b981" />}
                        <InfoCard label="Search Interest" value={trendData.trendData.searchInterest} color="#fbbf24" />
                        {trendData.trendData.relatedQueries?.length > 0 && <InfoCard label="Related Queries" value={trendData.trendData.relatedQueries.join(', ')} color="#a5b4fc" />}
                        {trendData.trendData.emergingOpportunities?.length > 0 && <InfoCard label="Emerging Opportunities" value={trendData.trendData.emergingOpportunities.join(', ')} color="#f72585" />}
                      </div>
                    </div>
                  )}

                  {trendData.marketplaceInsights && (
                    <div>
                      <h3 style={{ color: '#fff', fontSize: 15, margin: '0 0 10px' }}>🏪 Marketplace Insights</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                        {Object.entries(trendData.marketplaceInsights).filter(([, v]) => v).map(([mp, data]) => (
                          <div key={mp} style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 14 }}>
                            <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{mp.replace('_', ' ')}</h4>
                            {data.popularTypes?.length > 0 && <div style={{ marginBottom: 6 }}><span style={{ fontSize: 10, color: '#94a3b8' }}>Popular: </span><span style={{ fontSize: 12, color: '#cbd5e1' }}>{data.popularTypes.join(', ')}</span></div>}
                            {data.marketGaps?.length > 0 && <div style={{ marginBottom: 6 }}><span style={{ fontSize: 10, color: '#10b981' }}>Gaps: </span><span style={{ fontSize: 12, color: '#cbd5e1' }}>{data.marketGaps.join(', ')}</span></div>}
                            {data.underservedNiches?.length > 0 && <div><span style={{ fontSize: 10, color: '#f72585' }}>Opportunities: </span><span style={{ fontSize: 12, color: '#cbd5e1' }}>{data.underservedNiches.join(', ')}</span></div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* LAUNCH ASSISTANT */}
          {activeTab === 'launch' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'linear-gradient(135deg, #16162a, #1e1e3a)', border: '1px solid #2d2d4e', borderRadius: 14, padding: 20 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#fff' }}>🚀 Launch Assistant</h2>
                <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 14px' }}>Generate a complete launch plan: checklist, marketing strategy, email sequence, and social media plan.</p>
                <button onClick={loadLaunch} disabled={launchLoading || !title.trim()}
                  style={{ background: launchLoading || !title.trim() ? '#2d2d4e' : 'linear-gradient(135deg, #6c63ff, #f72585)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: launchLoading || !title.trim() ? 'not-allowed' : 'pointer' }}>
                  {launchLoading ? '⏳ Generating...' : '🚀 Generate Launch Plan'}
                </button>
              </div>

              {launchError && <div style={{ background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 8, padding: 12, color: '#fca5a5', fontSize: 13 }}>⚠️ {launchError}</div>}

              {launchLoading && (
                <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                  <div style={{ width: 36, height: 36, border: '3px solid #2d2d4e', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13 }}>Creating launch plan...</p>
                </div>
              )}

              {launchData && (
                <>
                  {launchData.launchChecklist?.length > 0 && (
                    <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>📋 Launch Checklist</h3>
                      {launchData.launchChecklist.map((phase, i) => (
                        <div key={i} style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: 6 }}>{phase.phase}</div>
                          {phase.tasks?.map((task, j) => (
                            <label key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, color: '#cbd5e1', cursor: 'pointer' }}>
                              <input type="checkbox" style={{ accentColor: '#6c63ff' }} /> {task}
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {launchData.marketingPlan && <ResultCard title="📢 Marketing Plan" content={launchData.marketingPlan} />}
                    {launchData.contentStrategy && <ResultCard title="📝 Content Strategy" content={launchData.contentStrategy} />}
                    {launchData.pinterestStrategy && <ResultCard title="📌 Pinterest Strategy" content={launchData.pinterestStrategy} />}
                  </div>

                  {launchData.emailSequence?.length > 0 && (
                    <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>✉️ Email Sequence</h3>
                      {launchData.emailSequence.map((email, i) => (
                        <div key={i} style={{ background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#6c63ff' }}>Day {email.day > 0 ? '+' : ''}{email.day}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{email.subject}</span>
                            <button onClick={(e) => copyToClipboard(`${email.subject}\n\n${email.body}`, e.currentTarget)} style={{ background: '#2d2d4e', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 10, cursor: 'pointer' }}>Copy</button>
                          </div>
                          <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{email.body}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {launchData.socialMediaPlan && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                      {Object.entries(launchData.socialMediaPlan).filter(([, v]) => v?.length).map(([platform, posts]) => (
                        <div key={platform} style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'capitalize', marginBottom: 8 }}>{platform}</div>
                          {posts.map((post, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#cbd5e1', padding: '6px 0', borderBottom: i < posts.length - 1 ? '1px solid #2d2d4e' : 'none' }}>{post}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* REGULAR ANALYSIS TABS */}
          {analysisAvailable && activeTab !== 'trends' && activeTab !== 'launch' && (
            <>
              <div style={{ background: 'linear-gradient(135deg, #16162a, #1e1e3a)', border: '1px solid #2d2d4e', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>{title}</h2>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>📊 AI Analysis Complete</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ background: 'linear-gradient(135deg, #6c63ff22, #f7258522)', border: '1px solid #6c63ff', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#a5b4fc', textTransform: 'uppercase' }}>Est. Sales/Month</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{analysis.monthly_prediction_min} - {analysis.monthly_prediction_max}</div>
                    </div>
                    <button onClick={exportAll} style={{ background: '#2d2d4e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>📥 Export</button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 16 }}>
                <ScoreRing value={analysis.seo_score} label="SEO" color="#6c63ff" />
                <ScoreRing value={analysis.competition_score} label="Competition" color="#f72585" />
                <ScoreRing value={analysis.demand_score} label="Demand" color="#10b981" />
                <ScoreRing value={analysis.conversion_score} label="Conversion" color="#fbbf24" />
              </div>

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  <ResultCard title="Optimized Title (SEO)" content={analysis.optimized_title} />
                  <ResultCard title="Long-tail Keywords" content={analysis.keywords || []} />
                </div>
              )}

              {/* Product Page Tab */}
              {activeTab === 'page' && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <ResultCard title="Persuasive Bullet Points" content={analysis.bullets || []} />
                </div>
              )}

              {/* Cover Tab */}
              {activeTab === 'cover' && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <ResultCard title="Cover Design Tips" content={analysis.cover_tips || []} />
                </div>
              )}

              {/* Pricing Tab */}
              {activeTab === 'pricing' && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Minimum', value: `$${analysis.price_min}`, color: '#94a3b8' },
                      { label: 'Recommended ⭐', value: `$${analysis.price_recommended}`, color: '#6c63ff', highlight: true },
                      { label: 'Premium', value: `$${analysis.price_premium}`, color: '#f72585' },
                    ].map(c => (
                      <div key={c.label} style={{ background: c.highlight ? 'linear-gradient(135deg, #6c63ff22, #f7258522)' : '#16162a', border: `1px solid ${c.highlight ? '#6c63ff' : '#2d2d4e'}`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: c.color, textTransform: 'uppercase', fontWeight: 700 }}>{c.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '6px 0' }}>{c.value}</div>
                      </div>
                    ))}
                  </div>
                  <ResultCard title="Pricing Strategy" content={`Bundle: ${analysis.bundle_idea}\nUpsell: ${analysis.upsell_idea}`} />
                </div>
              )}

              {/* Marketing Tab */}
              {activeTab === 'marketing' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  {[
                    { title: '📸 Instagram', content: analysis.instagram },
                    { title: '📌 Pinterest', content: analysis.pinterest },
                    { title: '🐦 Twitter/X', content: analysis.twitter },
                    { title: '📘 Facebook', content: analysis.facebook },
                    { title: '✉️ Email', content: `Subject: ${analysis.email_subject}\n\n${analysis.email_body}` },
                  ].map(s => s.content ? <ResultCard key={s.title} title={s.title} content={s.content} /> : null)}
                </div>
              )}

              {/* CRO Tab */}
              {activeTab === 'cro' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  <ResultCard title="✅ Strengths" content={analysis.strengths || []} />
                  <ResultCard title="⚠️ Weaknesses" content={analysis.weaknesses || []} />
                </div>
              )}

              {/* VALIDATION Tab */}
              {activeTab === 'validation' && analysis.validation && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                    <ScoreRing value={analysis.validation.demandScore} label="Demand" color="#10b981" />
                    <ScoreRing value={analysis.validation.competitionScore ? 100 - analysis.validation.competitionScore : 60} label="Opp. Window" color="#6c63ff" />
                    <ScoreRing value={analysis.validation.profitScore} label="Profit" color="#fbbf24" />
                    <ScoreRing value={analysis.validation.scalabilityScore} label="Scalability" color="#f72585" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                    <InfoCard label="Launch Difficulty" value={analysis.validation.launchDifficulty} color="#a5b4fc" />
                    <InfoCard label="Long-Term Potential" value={analysis.validation.longTermPotential} color="#10b981" />
                    <div style={{ background: 'linear-gradient(135deg, #6c63ff22, #f7258522)', border: '2px solid #6c63ff', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700 }}>Final Verdict</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 4 }}>{analysis.validation.finalVerdict}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BLUEPRINT Tab */}
              {activeTab === 'blueprint' && analysis.blueprint && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    <ResultCard title="🎯 Market Positioning" content={analysis.blueprint.positioning} />
                    <ResultCard title="👤 Customer Avatar" content={analysis.blueprint.customerAvatar} />
                    <ResultCard title="💡 Value Proposition" content={analysis.blueprint.valueProposition} />
                    <ResultCard title="⭐ Unique Selling Proposition" content={analysis.blueprint.usp} />
                    <ResultCard title="💰 Pricing Strategy" content={analysis.blueprint.pricingStrategy} />
                    <ResultCard title="🚀 Launch Strategy" content={analysis.blueprint.launchStrategy} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <ResultCard title="😣 Pain Points" content={analysis.blueprint.painPoints || []} />
                    <ResultCard title="💭 Customer Desires" content={analysis.blueprint.desires || []} />
                  </div>
                </div>
              )}

              {/* KEYWORDS Tab */}
              {activeTab === 'keywords' && analysis.keywordIntelligence && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {[
                      { label: 'Primary Keywords', key: 'primary', color: '#6c63ff' },
                      { label: 'Secondary Keywords', key: 'secondary', color: '#a5b4fc' },
                      { label: 'Long-Tail Keywords', key: 'longTail', color: '#10b981' },
                      { label: 'Commercial Keywords', key: 'commercial', color: '#f72585' },
                      { label: 'Buyer Intent Keywords', key: 'buyerIntent', color: '#fbbf24' },
                      { label: 'Low Competition Opportunities', key: 'lowCompetition', color: '#34d399' },
                      { label: 'Trending Search Terms', key: 'trending', color: '#f97316' },
                    ].map(group => {
                      const items = analysis.keywordIntelligence[group.key];
                      if (!items?.length) return null;
                      return (
                        <div key={group.key} style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: group.color, textTransform: 'uppercase', marginBottom: 8 }}>{group.label}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {items.map((item, i) => (
                              <span key={i} onClick={() => copyToClipboard(item)}
                                style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: '#0f0f1a', border: '1px solid #2d2d4e', color: '#cbd5e1', cursor: 'pointer' }}>{item}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* IMAGE PROMPTS Tab */}
              {activeTab === 'images' && analysis.imagePrompts && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(analysis.imagePrompts).filter(([, v]) => v).map(([type, prompts]) => (
                    <div key={type} style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid #2d2d4e', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{type.replace(/([A-Z])/g, ' $1')}</h4>
                      </div>
                      <div style={{ padding: 12 }}>
                        {Object.entries(prompts).filter(([, v]) => v).map(([k, v]) => (
                          <div key={k} style={{ marginBottom: 8, padding: '8px 10px', borderRadius: 6, background: '#0f0f1a', border: '1px solid #2d2d4e' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' }}>{k}</span>
                              {renderCopyBtn(v, `${type}-${k}`)}
                            </div>
                            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MARKET INTELLIGENCE Tab */}
              {activeTab === 'intelligence' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {!intelligence && !intelLoading && !intelError && (
                    <div style={{ background: 'linear-gradient(135deg, #16162a, #1e1e3a)', border: '1px solid #2d2d4e', borderRadius: 14, padding: 24, textAlign: 'center' }}>
                      <div style={{ fontSize: 48, marginBottom: 8 }}>🚀</div>
                      <h3 style={{ color: '#fff', margin: '0 0 6px', fontSize: 16 }}>Market Intelligence Engine</h3>
                      <p style={{ color: '#94a3b8', fontSize: 12, maxWidth: 480, margin: '0 auto 14px' }}>Get viral scores, competition heatmap, platform pricing, and publish-ready payloads.</p>
                      <button onClick={loadIntelligence} style={{ background: 'linear-gradient(135deg, #f72585, #6c63ff)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>🔥 Run Market Intelligence</button>
                    </div>
                  )}
                  {intelLoading && <div style={{ textAlign: 'center', padding: 32 }}><div style={{ width: 36, height: 36, border: '3px solid #2d2d4e', borderTopColor: '#f72585', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} /><p style={{ color: '#94a3b8', fontSize: 13 }}>Running market intelligence...</p></div>}
                  {intelError && <div style={{ background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 8, padding: 12, color: '#fca5a5', fontSize: 13 }}>⚠️ {intelError} <button onClick={loadIntelligence} style={{ marginLeft: 8, background: '#2d2d4e', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>Retry</button></div>}
                  {intelligence && <div style={{ color: '#94a3b8', fontSize: 13, padding: 16, textAlign: 'center' }}>Market Intelligence loaded. Switch to the tab to view results.</div>}
                </div>
              )}

              {/* LISTING GENERATOR Tab */}
              {activeTab === 'listing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'linear-gradient(135deg, #16162a, #1e1e3a)', border: '1px solid #2d2d4e', borderRadius: 14, padding: 20 }}>
                    <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#fff' }}>🔥 AI Product Listing Generator</h2>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 14px' }}>One product name → 5 platform-optimized listings (Etsy, KDP, Gumroad, TPT, Creative Fabrica)</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input value={listingInput} onChange={e => setListingInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') generateListings(); }} placeholder='e.g. "AI Instagram Content Planner"'
                        style={{ flex: '1 1 200px', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, boxSizing: 'border-box' }} />
                      <button onClick={() => generateListings()} disabled={listingLoading || !listingInput.trim()}
                        style={{ background: listingLoading || !listingInput.trim() ? '#2d2d4e' : 'linear-gradient(135deg, #f72585, #6c63ff)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: listingLoading || !listingInput.trim() ? 'not-allowed' : 'pointer' }}>
                        {listingLoading ? '⏳ Generating...' : '✨ Generate Listings'}
                      </button>
                    </div>
                    {title && !listingInput && (
                      <button onClick={() => generateListings(title)} style={{ marginTop: 6, background: 'transparent', color: '#a5b4fc', border: '1px dashed #2d2d4e', borderRadius: 6, padding: '6px 10px', fontSize: 11, cursor: 'pointer' }}>
                        ⚡ Use current title: &quot;{title}&quot;
                      </button>
                    )}
                  </div>

                  {listingError && <div style={{ background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 8, padding: 12, color: '#fca5a5', fontSize: 13 }}>⚠️ {listingError}</div>}
                  {listingLoading && <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}><div style={{ width: 36, height: 36, border: '3px solid #2d2d4e', borderTopColor: '#f72585', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} /><p style={{ fontSize: 13 }}>Generating listings for all platforms...</p></div>}

                  {listing && (() => {
                    const platformMeta = { etsy: { name: 'Etsy', emoji: '🛍️', color: '#F56400' }, amazon_kdp: { name: 'Amazon KDP', emoji: '📚', color: '#FF9900' }, gumroad: { name: 'Gumroad', emoji: '💸', color: '#FF90E8' }, tpt: { name: 'TPT', emoji: '🎓', color: '#00B4D8' }, creative_fabrica: { name: 'Creative Fabrica', emoji: '🎨', color: '#5C2D91' } };
                    const platformOrder = ['etsy', 'amazon_kdp', 'gumroad', 'tpt', 'creative_fabrica'];
                    const current = listing?.platforms?.[listingPlatform];
                    const meta = platformMeta[listingPlatform];
                    if (!current || !meta) return null;
                    return (
                      <>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: '#0f0f1a', padding: 6, borderRadius: 10, border: '1px solid #2d2d4e' }}>
                          {platformOrder.map(pid => {
                            const m = platformMeta[pid];
                            return (
                              <button key={pid} onClick={() => setListingPlatform(pid)}
                                style={{ background: pid === listingPlatform ? m.color : 'transparent', color: '#fff', border: '1px solid ' + (pid === listingPlatform ? m.color : '#2d2d4e'), borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {m.emoji} {m.name}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #16162a, #1e1e3a)', border: '2px solid ' + meta.color, borderRadius: 14, padding: 16 }}>
                          <div style={{ background: '#0f0f1a', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontSize: 10, color: meta.color, fontWeight: 700, textTransform: 'uppercase' }}>SEO Title</span>
                              {renderCopyBtn(current.title, `lt-${listingPlatform}`)}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{current.title}</div>
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{current.title?.length || 0} chars</div>
                          </div>
                          <div style={{ background: '#0f0f1a', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontSize: 10, color: meta.color, fontWeight: 700, textTransform: 'uppercase' }}>Description</span>
                              {renderCopyBtn(current.description, `ld-${listingPlatform}`)}
                            </div>
                            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{current.description}</div>
                          </div>
                          <div style={{ background: '#0f0f1a', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: 10, color: meta.color, fontWeight: 700, textTransform: 'uppercase' }}>Keywords ({current.keywords?.length || 0})</span>
                              {renderCopyBtn(current.keywords?.join(', '), `lk-${listingPlatform}`)}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {current.keywords?.map((kw, i) => (
                                <span key={i} style={{ background: meta.color + '22', color: meta.color, border: '1px solid ' + meta.color + '44', borderRadius: 4, padding: '4px 8px', fontSize: 10, fontWeight: 600 }}>#{kw}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ background: '#0f0f1a', borderRadius: 8, padding: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontSize: 10, color: meta.color, fontWeight: 700, textTransform: 'uppercase' }}>🎨 Image Prompt</span>
                              {renderCopyBtn(current.image_prompt, `lip-${listingPlatform}`)}
                            </div>
                            <div style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.5 }}>{current.image_prompt}</div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

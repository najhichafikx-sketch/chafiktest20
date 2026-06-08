'use client';
import { useState } from 'react';

const CONTENT_TYPES = [
  { id: 'blog-post', label: 'Blog Post', icon: '📝' },
  { id: 'seo-article', label: 'SEO Article', icon: '📈' },
  { id: 'social-media', label: 'Social Media Post', icon: '📱' },
  { id: 'product-description', label: 'Product Description', icon: '🏷️' },
  { id: 'landing-page', label: 'Landing Page Copy', icon: '🖥️' },
  { id: 'youtube-script', label: 'YouTube Script', icon: '🎬' },
  { id: 'email-marketing', label: 'Email Marketing', icon: '📧' },
  { id: 'affiliate-content', label: 'Affiliate Content', icon: '🤝' },
  { id: 'pinterest-description', label: 'Pinterest Description', icon: '📌' },
  { id: 'facebook-post', label: 'Facebook Post', icon: '👍' },
  { id: 'instagram-caption', label: 'Instagram Caption', icon: '📷' },
  { id: 'tiktok-caption', label: 'TikTok Caption', icon: '🎵' },
  { id: 'linkedin-post', label: 'LinkedIn Post', icon: '💼' },
  { id: 'twitter-thread', label: 'X (Twitter) Thread', icon: '𝕏' },
];

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'العربية' },
];

const RESULT_TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'titles', label: 'Titles', icon: '🏆' },
  { id: 'keywords', label: 'Keywords', icon: '🔑' },
  { id: 'content', label: 'Content', icon: '📄' },
  { id: 'social', label: 'Social Media', icon: '📱' },
  { id: 'images', label: 'Image Prompts', icon: '🖼️' },
  { id: 'seo', label: 'SEO', icon: '🔍' },
];

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) { const o = btn.textContent; btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = o, 2000); }
  });
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
}

function scoreColor(n) {
  if (n >= 90) return '#22c55e';
  if (n >= 80) return '#eab308';
  return '#ef4444';
}

function Pill({ active, onClick, children, style }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${active ? 'var(--accent, #d4a827)' : 'var(--card-border, #2a2a2e)'}`,
      background: active ? 'rgba(212,168,39,0.1)' : 'transparent', cursor: 'pointer',
      color: active ? 'var(--accent, #d4a827)' : 'var(--text-secondary, #9a9890)',
      fontWeight: 600, fontSize: 13, fontFamily: 'inherit', transition: 'all .15s', ...style
    }}>{children}</button>
  );
}

export default function AIContentGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [lang, setLang] = useState('en');
  const [contentType, setContentType] = useState('seo-article');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setProgress(5);
    setProgressLabel('Researching keywords & titles...');
    setActiveTab('overview');

    try {
      const res = await fetch('/api/ai-content-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          keyword: keyword.trim() || topic.trim(),
          niche: niche.trim(),
          targetAudience: targetAudience.trim(),
          lang,
          contentType
        })
      });
      setProgress(50);
      setProgressLabel('Generating content & assets...');

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      setProgress(100);
      setProgressLabel('Complete!');
      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function exportAll(format) {
    if (!result) return;
    let content = '';
    const sep = format === 'html' ? '<hr>' : '\n\n=== ';

    if (format === 'html') {
      content = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Content Export</title></head><body>';
      if (result.titles?.length) content += '<h2>SEO Titles</h2>' + result.titles.map(t => `<p><strong>${t.score}%</strong> — ${t.title}${t.reason ? `<br><small>${t.reason}</small>` : ''}</p>`).join('');
      if (result.keywords?.primary) content += '<h2>Keywords</h2><p><strong>Primary:</strong> ' + result.keywords.primary.join(', ') + '</p>';
      if (result.content) content += '<h2>Content</h2>' + result.content.replace(/\n/g, '<br>');
      if (result.seo) content += '<h2>SEO Metadata</h2><pre>' + JSON.stringify(result.seo, null, 2) + '</pre>';
      content += '</body></html>';
    } else {
      if (result.titles?.length) content += 'SEO TITLES\n' + '='.repeat(10) + '\n' + result.titles.map(t => `${t.score}% — ${t.title}${t.reason ? '\n  → ' + t.reason : ''}`).join('\n') + '\n\n';
      if (result.keywords?.primary) content += 'KEYWORDS\n' + '='.repeat(8) + '\nPrimary: ' + result.keywords.primary.join(', ') + '\nSecondary: ' + (result.keywords.secondary || []).join(', ') + '\n\n';
      if (result.content) content += 'CONTENT\n' + '='.repeat(7) + '\n' + result.content + '\n\n';
      if (result.seo) content += 'SEO METADATA\n' + '='.repeat(11) + '\n' + JSON.stringify(result.seo, null, 2);
    }

    const ext = format === 'html' ? 'html' : format === 'md' ? 'md' : 'txt';
    const mime = format === 'html' ? 'text/html' : format === 'md' ? 'text/markdown' : 'text/plain';
    downloadFile(content, `content-${Date.now()}.${ext}`, mime);
  }

  function renderSocialMedia() {
    if (!result?.socialMedia) return null;
    const platforms = [
      { key: 'facebook', label: 'Facebook', icon: '👍' },
      { key: 'instagram', label: 'Instagram', icon: '📷' },
      { key: 'tiktok', label: 'TikTok', icon: '🎵' },
      { key: 'youtube', label: 'YouTube', icon: '▶️' },
      { key: 'pinterest', label: 'Pinterest', icon: '📌' },
      { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
      { key: 'twitter', label: 'X (Twitter)', icon: '𝕏' },
    ];

    return platforms.map(p => {
      const data = result.socialMedia[p.key];
      if (!data) return null;
      return (
        <div key={p.key} style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--card-border, #1e1e22)', background: 'var(--surface, #0d0d0f)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{p.icon} {p.label}</h3>
            <button onClick={(e) => copyText(JSON.stringify(data, null, 2), e.currentTarget)} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>Copy</button>
          </div>
          <div style={{ padding: '14px 16px' }}>
            {Object.entries(data).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary, #e8e6e0)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {Array.isArray(v) ? v.join(', ') : v}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });
  }

  function renderImagePrompts() {
    if (!result?.imagePrompts) return null;
    return Object.entries(result.imagePrompts).filter(([, v]) => v).map(([type, prompts]) => (
      <div key={type} style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--card-border, #1e1e22)', background: 'var(--surface, #0d0d0f)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{type.replace(/([A-Z])/g, ' $1').trim()}</h3>
        </div>
        <div style={{ padding: '14px 16px' }}>
          {Object.entries(prompts).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{k}</span>
                <button onClick={(e) => copyText(v, e.currentTarget)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(139,92,246,0.2)', background: 'transparent', color: '#8b5cf6', cursor: 'pointer' }}>Copy</button>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary, #e8e6e0)', lineHeight: 1.6 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    ));
  }

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">AI Content Generator</h1>
          <p className="section-subtitle">Professional content creation suite. Generate titles, keywords, full articles, social media content, image prompts, and SEO metadata in seconds.</p>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Form */}
          <div style={{ flex: '1 1 0', minWidth: 280, maxWidth: 640 }}>
            <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 12, padding: 24 }}>

              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #9a9890)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Content Type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {CONTENT_TYPES.map(ct => (
                  <Pill key={ct.id} active={contentType === ct.id} onClick={() => setContentType(ct.id)}>
                    {ct.icon} {ct.label}
                  </Pill>
                ))}
              </div>

              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #9a9890)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Topic *</label>
              <textarea value={topic} onChange={e => setTopic(e.target.value)} maxLength={300} rows={3}
                placeholder="e.g. Top 10 places to visit in Dubai this summer"
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--card-border, #2a2a2e)', background: 'var(--input-bg, #0d0d0f)', color: 'var(--text-primary, #e8e6e0)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', marginBottom: 12 }}
              />

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #9a9890)', marginBottom: 6 }}>Target Keyword</label>
              <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. Dubai travel tips 2026" maxLength={100}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--card-border, #2a2a2e)', background: 'var(--input-bg, #0d0d0f)', color: 'var(--text-primary, #e8e6e0)', fontSize: 14, fontFamily: 'inherit', marginBottom: 12 }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #9a9890)', marginBottom: 6 }}>Niche / Industry</label>
                  <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. Travel, Tech, Health" maxLength={60}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--card-border, #2a2a2e)', background: 'var(--input-bg, #0d0d0f)', color: 'var(--text-primary, #e8e6e0)', fontSize: 14, fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #9a9890)', marginBottom: 6 }}>Target Audience</label>
                  <input value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g. Travelers, Beginners" maxLength={60}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--card-border, #2a2a2e)', background: 'var(--input-bg, #0d0d0f)', color: 'var(--text-primary, #e8e6e0)', fontSize: 14, fontFamily: 'inherit' }} />
                </div>
              </div>

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #9a9890)', marginBottom: 6 }}>Language</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {LANGUAGES.map(l => (
                  <Pill key={l.id} active={lang === l.id} onClick={() => setLang(l.id)} style={{ padding: '6px 20px' }}>{l.label}</Pill>
                ))}
              </div>

              <button type="submit" disabled={loading || !topic.trim()}
                style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #d946ef)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳ Generating...' : '✨ Generate Content'}
              </button>
            </form>

            {error && (
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: '#2a0f0f', border: '1px solid #ef4444', color: '#ef4444', fontSize: 14 }}>
                {error}
              </div>
            )}
          </div>

          {/* Results */}
          <div style={{ flex: '1 1 0', minWidth: 280, maxWidth: 640 }}>
            {/* Loading */}
            {loading && (
              <div style={{ marginBottom: 16, padding: '20px 24px', borderRadius: 12, background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)' }}>{progressLabel}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-tertiary, #5a5a62)', fontFamily: 'monospace' }}>{progress}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--card-border, #1e1e22)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', borderRadius: 2, transition: 'width 0.4s' }} />
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary, #5a5a62)' }}>
                  {progress < 30 ? '🔍 Researching keywords & analyzing search intent...' :
                   progress < 60 ? '✍️ Generating content with AI...' :
                   progress < 90 ? '📱 Creating social media & image prompts...' :
                   '✅ Almost done...'}
                </div>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--card-border, #1e1e22)', overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 2 }}>
                  {RESULT_TABS.map(tab => (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: '8px 14px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
                        background: activeTab === tab.id ? 'var(--card-bg, #111114)' : 'transparent',
                        color: activeTab === tab.id ? 'var(--accent, #d4a827)' : 'var(--text-secondary, #9a9890)',
                        fontWeight: 600, fontSize: 12, fontFamily: 'inherit', whiteSpace: 'nowrap',
                        borderBottom: activeTab === tab.id ? '2px solid var(--accent, #d4a827)' : '2px solid transparent',
                        transition: 'all .15s'
                      }}>
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Export bar */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '12px 16px', borderRadius: 10, background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(217,70,239,0.04))', border: '1px solid rgba(139,92,246,0.15)', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary, #9a9890)' }}>📥 Export</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => exportAll('txt')} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>TXT</button>
                    <button onClick={() => exportAll('md')} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>Markdown</button>
                    <button onClick={() => exportAll('html')} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>HTML</button>
                  </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, padding: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #e8e6e0)', margin: '0 0 12px' }}>📊 Content Summary</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { label: 'Topic', value: result.topic },
                        { label: 'Content Type', value: result.contentType?.replace(/-/g, ' ') },
                        { label: 'Titles Generated', value: result.titles?.length ? `${result.titles.length} titles` : '0' },
                        { label: 'Keywords', value: result.keywords?.primary ? `${result.keywords.primary.length} primary` : '0' },
                        { label: 'Content Length', value: result.content ? `${result.content.split(' ').length} words` : '0' },
                        { label: 'Social Platforms', value: result.socialMedia ? Object.keys(result.socialMedia).filter(k => result.socialMedia[k]).length + ' platforms' : '0' },
                        { label: 'Image Prompts', value: result.imagePrompts ? Object.keys(result.imagePrompts).length + ' types' : '0' },
                        { label: 'SEO Ready', value: result.seo ? '✅ Yes' : '❌ No' },
                      ].map(item => (
                        <div key={item.label} style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--surface, #0d0d0f)' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', marginTop: 2 }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Titles Tab */}
                {activeTab === 'titles' && result.titles?.length > 0 && (
                  <div style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--card-border, #1e1e22)', background: 'var(--surface, #0d0d0f)' }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>SEO TITLES ({result.titles.length})</h3>
                      <button onClick={() => copyText(result.titles.map(t => `${t.score}% — ${t.title}`).join('\n'))}
                        style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>
                        Copy All
                      </button>
                    </div>
                    <div>
                      {result.titles.map((t, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < result.titles.length - 1 ? '1px solid var(--card-border, #1e1e22)' : 'none' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, minWidth: 70 }}>
                            <span style={{ display: 'inline-block', width: 40, height: 7, background: `linear-gradient(90deg, ${scoreColor(t.score)} 0%, ${scoreColor(t.score)} ${t.score}%, #2a2a2e ${t.score}%, #2a2a2e 100%)`, borderRadius: 4 }} />
                            <span style={{ fontWeight: 800, fontSize: 11, color: scoreColor(t.score), fontFamily: 'monospace' }}>{t.score}%</span>
                          </span>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', lineHeight: 1.4 }}>
                            {t.title}
                            {t.reason && <span style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-tertiary, #5a5a62)', marginTop: 2 }}>🔍 {t.reason}</span>}
                          </span>
                          <button onClick={(e) => copyText(t.title, e.currentTarget)}
                            style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>
                            Copy
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords Tab */}
                {activeTab === 'keywords' && result.keywords && (
                  <div style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, padding: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>🔑 Keyword Research</h3>
                    {[
                      { label: 'Primary Keywords', key: 'primary' },
                      { label: 'Secondary Keywords', key: 'secondary' },
                      { label: 'Long-Tail Keywords', key: 'longTail' },
                      { label: 'LSI Keywords', key: 'lsi' },
                      { label: 'Question Keywords', key: 'questions' },
                    ].map(group => {
                      const items = result.keywords[group.key];
                      if (!items?.length) return null;
                      return (
                        <div key={group.key} style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--surface, #0d0d0f)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent, #d4a827)', textTransform: 'uppercase', marginBottom: 6 }}>{group.label}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {items.map((item, i) => (
                              <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'rgba(212,168,39,0.08)', border: '1px solid rgba(212,168,39,0.2)', color: 'var(--text-primary, #e8e6e0)', cursor: 'pointer' }}
                                onClick={() => copyText(item)}>{item}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
                      {[
                        { label: 'Search Intent', key: 'searchIntent', color: '#8b5cf6' },
                        { label: 'Difficulty', key: 'difficulty', color: '#10b981' },
                      ].map(item => {
                        const val = result.keywords[item.key];
                        if (!val) return null;
                        return <div key={item.key} style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: item.color, textTransform: 'uppercase' }}>{item.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', marginTop: 2 }}>{val}</div>
                        </div>;
                      })}
                    </div>
                    {result.keywords.opportunities?.length > 0 && (
                      <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: 6 }}>📈 Content Opportunities</div>
                        {result.keywords.opportunities.map((o, i) => (
                          <div key={i} style={{ fontSize: 13, color: 'var(--text-primary, #e8e6e0)', padding: '4px 0', borderBottom: i < result.keywords.opportunities.length - 1 ? '1px solid rgba(16,185,129,0.1)' : 'none' }}>{o}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && result.content && (
                  <div style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--card-border, #1e1e22)', background: 'var(--surface, #0d0d0f)' }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>📄 Generated Content</h3>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={(e) => copyText(result.content, e.currentTarget)} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>Copy</button>
                        <button onClick={() => downloadFile(result.content, `content-${Date.now()}.md`, 'text/markdown')} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>Download</button>
                      </div>
                    </div>
                    <div style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-primary, #e8e6e0)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{result.content}</div>
                  </div>
                )}

                {/* Social Media Tab */}
                {activeTab === 'social' && renderSocialMedia()}

                {/* Image Prompts Tab */}
                {activeTab === 'images' && renderImagePrompts()}

                {/* SEO Tab */}
                {activeTab === 'seo' && result.seo && (
                  <div style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>🔍 SEO Metadata</h3>
                      <button onClick={() => copyText(JSON.stringify(result.seo, null, 2))} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>Copy All</button>
                    </div>
                    {Object.entries(result.seo).filter(([, v]) => v).map(([key, val]) => (
                      <div key={key} style={{ marginBottom: 8, padding: '10px 14px', borderRadius: 8, background: 'var(--surface, #0d0d0f)' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-primary, #e8e6e0)', lineHeight: 1.5 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Regenerate */}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={() => { setResult(null); setActiveTab('overview'); }}
                    style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-primary, #e8e6e0)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Generate Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

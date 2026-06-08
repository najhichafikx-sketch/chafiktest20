'use client';

import { useState } from 'react';

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', color: '#ff0000' },
  { id: 'tiktok', label: 'TikTok', color: '#111' },
  { id: 'instagram', label: 'Instagram', color: '#e1306c' },
  { id: 'facebook', label: 'Facebook', color: '#1877f2' },
];

const SECTION_LABELS = {
  titles: 'Titles',
  descriptions: 'Descriptions',
  hashtags: 'Hashtags',
};

function scoreColor(n) {
  if (n >= 90) return '#22c55e';
  if (n >= 80) return '#eab308';
  return '#ef4444';
}

function fallbackImage(slug) {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/800/450`;
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) { const o = btn.textContent; btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = o, 2000); }
  });
}

export default function AIContentGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/ai-content-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), platform, lang })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">AI Content Generator</h1>
          <p className="section-subtitle">Generate SEO titles, descriptions, hashtags &amp; thumbnail ideas — in seconds.</p>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Form */}
          <div style={{ flex: '1 1 0', minWidth: 280, maxWidth: 640 }}>
            <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 12, padding: 24 }}>
              {/* Platform selector */}
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #9a9890)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Platform</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
                {PLATFORMS.map(p => (
                  <button key={p.id} type="button" onClick={() => setPlatform(p.id)}
                    style={{
                      padding: '10px 4px', borderRadius: 8, border: `2px solid ${platform === p.id ? p.color : 'var(--card-border, #2a2a2e)'}`,
                      background: platform === p.id ? `${p.color}15` : 'transparent', cursor: 'pointer',
                      color: platform === p.id ? p.color : 'var(--text-secondary, #9a9890)', fontWeight: 700, fontSize: 13, transition: 'all .15s'
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Topic */}
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #9a9890)', marginBottom: 8, marginTop: 4 }}>Your Topic / Idea</label>
              <textarea value={topic} onChange={e => setTopic(e.target.value)} maxLength={300} rows={4}
                placeholder="e.g. Top 10 places to visit in Dubai this summer"
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--card-border, #2a2a2e)', background: 'var(--input-bg, #0d0d0f)', color: 'var(--text-primary, #e8e6e0)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }}
              />
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-tertiary, #5a5a62)', marginTop: 4 }}>{topic.length} / 300</div>

              {/* Language */}
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #9a9890)', marginBottom: 8, marginTop: 16 }}>Language</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[{ id: 'en', label: 'English' }, { id: 'ar', label: 'العربية' }].map(l => (
                  <button key={l.id} type="button" onClick={() => setLang(l.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${lang === l.id ? 'var(--accent, #d4a827)' : 'var(--card-border, #2a2a2e)'}`,
                      background: lang === l.id ? 'rgba(212,168,39,0.1)' : 'transparent', cursor: 'pointer',
                      color: lang === l.id ? 'var(--accent, #d4a827)' : 'var(--text-secondary, #9a9890)', fontWeight: 600, fontSize: 13
                    }}>
                    {l.label}
                  </button>
                ))}
              </div>

              <button type="submit" disabled={loading || !topic.trim()}
                style={{
                  width: '100%', padding: '14px', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 8,
                  background: 'linear-gradient(135deg, #7c3aed, #d946ef)', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: loading ? 0.6 : 1, marginTop: 8
                }}>
                {loading ? 'Generating...' : 'Generate Content with AI'}
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
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 16, color: 'var(--text-secondary, #9a9890)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: 14 }}>AI is crafting your content...</p>
              </div>
            )}

            {result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Share bar */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))',
                  border: '1px solid rgba(139,92,246,0.25)', borderRadius: 10, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
                }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary, #9a9890)', margin: 0 }}>Love this result? <strong style={{ color: '#8b5cf6' }}>Share the tool</strong></p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[
                      { href: `https://twitter.com/intent/tweet?text=${encodeURIComponent('I just generated content with AI! Try it free:')}&url=${encodeURIComponent('https://www.chafiktech.com/tools/ai-content-generator')}`, label: '𝕏', bg: '#000' },
                      { href: `https://wa.me/?text=${encodeURIComponent('I just generated content with AI! Try it free: https://www.chafiktech.com/tools/ai-content-generator')}`, label: '💬', bg: '#25d366' },
                      { href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.chafiktech.com/tools/ai-content-generator')}`, label: '📘', bg: '#1877f2' },
                    ].map(s => (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener"
                        style={{ fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', color: '#fff', background: s.bg, textDecoration: 'none' }}>
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Titles */}
                <div style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--card-border, #1e1e22)', background: 'var(--surface, #0d0d0f)' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>TITLES</h3>
                    <button onClick={() => copyText(result.titles.map(t => `${t.score}% — ${t.title}`).join('\n'))}
                      style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>
                      Copy All
                    </button>
                  </div>
                  <div>
                    {result.titles.map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < result.titles.length - 1 ? '1px solid var(--card-border, #1e1e22)' : 'none' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, minWidth: 80 }}>
                          <span style={{ display: 'inline-block', width: 50, height: 8, background: `linear-gradient(90deg, ${scoreColor(t.score)} 0%, ${scoreColor(t.score)} ${t.score}%, #2a2a2e ${t.score}%, #2a2a2e 100%)`, borderRadius: 4 }} />
                          <span style={{ fontWeight: 800, fontSize: 12, color: scoreColor(t.score), fontFamily: 'monospace' }}>{t.score}%</span>
                        </span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', lineHeight: 1.4 }}>{t.title}</span>
                        <button onClick={(e) => copyText(t.title, e.currentTarget)}
                          style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descriptions */}
                {Object.entries(result.descriptions).filter(([, v]) => v).map(([key, text]) => (
                  <div key={key} style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--card-border, #1e1e22)', background: 'var(--surface, #0d0d0f)' }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                        {key === 'youtube' ? 'YouTube Description' : key === 'tiktok' ? 'TikTok Description' : key === 'instagram' ? 'Instagram Caption' : 'Facebook Description'}
                      </h3>
                      <button onClick={(e) => copyText(text, e.currentTarget)}
                        style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>
                        Copy
                      </button>
                    </div>
                    <div style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-primary, #e8e6e0)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{text}</div>
                  </div>
                ))}

                {/* Hashtags */}
                {result.hashtags && Object.keys(result.hashtags).length > 0 && (
                  <div style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--card-border, #1e1e22)', background: 'var(--surface, #0d0d0f)' }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>HASHTAGS</h3>
                      <button onClick={() => {
                        const all = Object.values(result.hashtags).flat().map(t => '#' + t).join(' ');
                        copyText(all);
                      }} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>
                        Copy All
                      </button>
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      {Object.entries(result.hashtags).filter(([, v]) => v && v.length).map(([key, tags]) => (
                        <div key={key} style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{key}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {tags.filter(t => t).map((tag, i) => (
                              <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)' }}>
                                #{tag.replace(/^#/, '')}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generate Again */}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={() => { setResult(null); setTopic(''); }}
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

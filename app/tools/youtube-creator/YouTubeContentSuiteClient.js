'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const TABS = [
  { id: 'rewrite', label: 'âœï¸ Rewrite', emoji: 'âœï¸' },
  { id: 'keywords', label: 'ðŸ”‘ Keywords', emoji: 'ðŸ”‘' },
  { id: 'titles', label: 'ðŸŽ¯ Titles', emoji: 'ðŸŽ¯' },
  { id: 'hooks', label: 'ðŸª Hooks', emoji: 'ðŸª' },
  { id: 'script', label: 'ðŸ“œ Script', emoji: 'ðŸ“œ' },
  { id: 'description', label: 'ðŸ“ Description', emoji: 'ðŸ“' },
  { id: 'tags', label: 'ðŸ·ï¸ Tags', emoji: 'ðŸ·ï¸' },
  { id: 'thumbnails', label: 'ðŸŽ¨ Thumbnails', emoji: 'ðŸŽ¨' },
  { id: 'seo', label: 'ðŸ“Š SEO Score', emoji: 'ðŸ“Š' },
  { id: 'ideas', label: 'ðŸ’¡ Ideas', emoji: 'ðŸ’¡' }
];

const TITLE_STYLE_META = {
  viral: { label: 'ðŸ”¥ Viral', color: '#f72585' },
  professional: { label: 'ðŸ’¼ Professional', color: '#6c63ff' },
  seo: { label: 'ðŸ” SEO-Optimized', color: '#10b981' }
};

const HOOK_STYLE_META = {
  question: { label: 'â“ Question Hook', color: '#6c63ff' },
  shock: { label: 'âš¡ Shock Hook', color: '#f72585' },
  story: { label: 'ðŸ“– Story Hook', color: '#fbbf24' }
};

const SCORE_COLORS = {
  high: '#10b981',
  medium: '#fbbf24',
  low: '#ef4444'
};

function scoreColor(n) {
  if (n >= 75) return SCORE_COLORS.high;
  if (n >= 50) return SCORE_COLORS.medium;
  return SCORE_COLORS.low;
}

function scoreLabel(n) {
  if (n >= 85) return 'Excellent';
  if (n >= 75) return 'Strong';
  if (n >= 50) return 'Needs Work';
  return 'Weak';
}

function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const p of patterns) {
    const m = String(url).trim().match(p);
    if (m) return m[1];
  }
  return null;
}

function CopyButton({ text, id, label = 'Copy', style = 'primary' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
      document.body.removeChild(ta);
    }
  };
  const bg = copied ? '#10b981' : (style === 'ghost' ? 'transparent' : '#2d2d4e');
  const border = style === 'ghost' ? '1px solid #2d2d4e' : 'none';
  return (
    <button onClick={copy} data-tool-action
      style={{ background: bg, color: '#fff', border, borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
      {copied ? 'âœ… Copied' : `ðŸ“‹ ${label}`}
    </button>
  );
}

function LoadingCard({ label }) {
  return (
    <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 36, textAlign: 'center', marginTop: 12 }}>
      <div style={{ width: 44, height: 44, border: '4px solid #2d2d4e', borderTopColor: '#f72585', borderRadius: '50%', animation: 'ycsSpin 1s linear infinite', margin: '0 auto 12px' }} />
      <style>{`@keyframes ycsSpin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: '#cbd5e1', fontSize: 13 }}>â³ {label}...</div>
      <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>OpenRouter is generating Â· ~10-30s</div>
    </div>
  );
}

function ErrorCard({ error, onRetry }) {
  return (
    <div style={{ background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 10, padding: 14, color: '#fca5a5', fontSize: 13, marginTop: 12 }}>
      âš ï¸ {error}
      {onRetry && (
        <button onClick={onRetry} data-tool-action
          style={{ marginLeft: 12, background: '#2d2d4e', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>
          ðŸ”„ Retry
        </button>
      )}
    </div>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div style={{ background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 10, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontSize: 18, fontWeight: 800 }}>{value}<span style={{ fontSize: 10, color: '#64748b' }}>/100</span></span>
      </div>
      <div style={{ height: 8, background: '#2d2d4e', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}cc)`, transition: 'width 0.6s' }} />
      </div>
      <div style={{ marginTop: 6, fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase' }}>{scoreLabel(value)}</div>
    </div>
  );
}

function ConfigMissingCard({ onGoAdmin }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #7f1d1d22, #f7258522)', border: '1px solid #ef4444', borderRadius: 14, padding: 24, textAlign: 'center', marginTop: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>ðŸ”‘</div>
      <h3 style={{ color: '#fff', fontSize: 16, margin: '0 0 6px' }}>OpenRouter API Key Missing</h3>
      <p style={{ color: '#fca5a5', fontSize: 13, margin: '0 0 14px', lineHeight: 1.5 }}>
        Please configure the OpenRouter API Key in Admin Settings to use the YouTube AI Content Suite.
      </p>
      <a href="/admin-login" onClick={(e) => { e.preventDefault(); onGoAdmin && onGoAdmin(); }} data-tool-action
        style={{ display: 'inline-block', background: 'linear-gradient(135deg, #f72585, #6c63ff)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700 }}>
        âš™ï¸ Go to Admin Settings
      </a>
    </div>
  );
}

export default function YouTubeContentSuiteClient() {
  const [transcript, setTranscript] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [fetchingTranscript, setFetchingTranscript] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState('rewrite');
  const [rewritePercent, setRewritePercent] = useState(80);
  const [apiStatus, setApiStatus] = useState({ ok: true, checked: false });
  const [copiedKey, setCopiedKey] = useState(null);
  const [progress, setProgress] = useState({ loaded: 0, total: TABS.length });

  const [sectionData, setSectionData] = useState({});
  const [sectionLoading, setSectionLoading] = useState({});
  const [sectionError, setSectionError] = useState({});
  const [pendingQueue, setPendingQueue] = useState(0);
  const sectionCache = useRef({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/creator-suite/youtube-content', { method: 'GET' });
        if (!cancelled) setApiStatus({ ok: res.ok, checked: true });
      } catch {
        if (!cancelled) setApiStatus({ ok: false, checked: true });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
  }, []);

  const handleFetchTranscript = async () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setFetchError('Please paste a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...) or just the 11-character video ID.');
      return;
    }
    setFetchingTranscript(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/creator-suite/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, url: videoUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || `Transcript fetch failed (HTTP ${res.status}). The video may not have captions, or all public transcript APIs are down. Please paste the transcript manually below.`);
      const text = data.transcript || data.text || (Array.isArray(data.segments) ? data.segments.map(s => s.text).join(' ') : '');
      if (!text) throw new Error('No transcript available for this video. The video may be private, age-restricted, or have captions disabled.');
      setTranscript(text);
      sectionCache.current = {};
      setSectionData({});
      setSectionError({});
      setProgress({ loaded: 0, total: TABS.length });
    } catch (e) {
      setFetchError(e.message);
    } finally {
      setFetchingTranscript(false);
    }
  };

  const generateSection = useCallback(async (section) => {
    if (!transcript || transcript.trim().length < 10) {
      setSectionError(prev => ({ ...prev, [section]: 'Please paste a transcript or fetch one from a YouTube URL first.' }));
      return;
    }
    if (sectionData[section] || sectionLoading[section]) return;
    if (sectionCache.current[section]) {
      setSectionData(prev => ({ ...prev, [section]: sectionCache.current[section] }));
      setProgress(p => ({ ...p, loaded: p.loaded + 1 }));
      return;
    }
    setSectionLoading(prev => ({ ...prev, [section]: true }));
    setSectionError(prev => ({ ...prev, [section]: null }));
    setPendingQueue(q => q + 1);
    try {
      const res = await fetch('/api/creator-suite/youtube-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          text: transcript,
          rewritePercent: section === 'rewrite' ? rewritePercent : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      sectionCache.current[section] = data.data;
      setSectionData(prev => ({ ...prev, [section]: data.data }));
      setProgress(p => ({ ...p, loaded: p.loaded + 1 }));
    } catch (e) {
      setSectionError(prev => ({ ...prev, [section]: e.message }));
    } finally {
      setSectionLoading(prev => ({ ...prev, [section]: false }));
      setPendingQueue(q => Math.max(0, q - 1));
    }
  }, [transcript, rewritePercent, sectionData, sectionLoading]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (!sectionData[tabId] && !sectionLoading[tabId] && !sectionError[tabId] && transcript.trim().length >= 10) {
      generateSection(tabId);
    }
  };

  const copy = (text, key) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1800);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopiedKey(key); setTimeout(() => setCopiedKey(null), 1800); } catch {}
      document.body.removeChild(ta);
    }
  };

  const renderRewrite = () => {
    const data = sectionData.rewrite;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            ðŸ”„ Rewrite percentage: <span style={{ color: '#f72585' }}>{rewritePercent}%</span>
          </label>
          <input type="range" min="50" max="100" step="5" value={rewritePercent}
            onChange={e => setRewritePercent(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f72585' }}
            data-tool-action />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginTop: 4 }}>
            <span>50% â€” Heavy paraphrase</span>
            <span>100% â€” Light polish</span>
          </div>
          <button onClick={() => { sectionCache.current.rewrite = null; setSectionData(prev => { const n = { ...prev }; delete n.rewrite; return n; }); generateSection('rewrite'); }}
            disabled={!transcript.trim() || sectionLoading.rewrite}
            data-tool-action
            style={{ marginTop: 12, background: 'linear-gradient(135deg, #6c63ff, #f72585)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {sectionLoading.rewrite ? 'â³ Rewriting...' : 'âœ¨ Rewrite Now'}
          </button>
        </div>
        {sectionLoading.rewrite && <LoadingCard label="Rewriting your text" />}
        {sectionError.rewrite && <ErrorCard error={sectionError.rewrite} onRetry={() => generateSection('rewrite')} />}
        {data?.rewritten && (
          <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ margin: 0, color: '#fff', fontSize: 14 }}>âœï¸ Rewritten Text</h4>
              <CopyButton text={data.rewritten} id="rewrite-text" label="Copy Text" />
            </div>
            <div style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.rewritten}</div>
          </div>
        )}
      </div>
    );
  };

  const renderKeywords = () => {
    const data = sectionData.keywords;
    return (
      <div>
        {sectionLoading.keywords && <LoadingCard label="Extracting SEO keywords" />}
        {sectionError.keywords && <ErrorCard error={sectionError.keywords} onRetry={() => generateSection('keywords')} />}
        {data?.keywords && (
          <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, color: '#fff', fontSize: 14 }}>ðŸ”‘ {data.keywords.length} SEO Keywords</h4>
              <CopyButton text={data.keywords.join(', ')} id="kw-all" label="Copy All" />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.keywords.map((kw, i) => (
                <button key={i} onClick={() => copy(kw, `kw-${i}`)} data-tool-action
                  style={{ background: copiedKey === `kw-${i}` ? '#10b981' : '#6c63ff22', color: copiedKey === `kw-${i}` ? '#fff' : '#a5b4fc', border: '1px solid #6c63ff55', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {copiedKey === `kw-${i}` ? 'âœ…' : '#'}{kw}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTitles = () => {
    const data = sectionData.titles;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sectionLoading.titles && <LoadingCard label="Generating 3 title variations" />}
        {sectionError.titles && <ErrorCard error={sectionError.titles} onRetry={() => generateSection('titles')} />}
        {data?.titles?.map((t, i) => {
          const meta = TITLE_STYLE_META[t.style] || { label: t.style, color: '#6c63ff' };
          return (
            <div key={i} style={{ background: '#16162a', border: '1px solid ' + meta.color, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ background: meta.color + '22', color: meta.color, border: '1px solid ' + meta.color + '55', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{meta.label}</span>
                <CopyButton text={t.title} id={`title-${i}`} label="Copy" />
              </div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{t.title}</div>
              <div style={{ color: '#64748b', fontSize: 10, marginTop: 6 }}>{t.title.length} characters</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderHooks = () => {
    const data = sectionData.hooks;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sectionLoading.hooks && <LoadingCard label="Generating 3 viral hooks" />}
        {sectionError.hooks && <ErrorCard error={sectionError.hooks} onRetry={() => generateSection('hooks')} />}
        {data?.hooks?.map((h, i) => {
          const meta = HOOK_STYLE_META[h.style] || { label: h.style, color: '#6c63ff' };
          return (
            <div key={i} style={{ background: '#16162a', border: '1px solid ' + meta.color, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ background: meta.color + '22', color: meta.color, border: '1px solid ' + meta.color + '55', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{meta.label}</span>
                <CopyButton text={h.text} id={`hook-${i}`} label="Copy" />
              </div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 500, lineHeight: 1.5, fontStyle: 'italic' }}>&quot;{h.text}&quot;</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderScript = () => {
    const data = sectionData.script;
    const fullText = data?.script ? `${data.script.intro}\n\n${data.script.main}\n\n${data.script.cta}` : '';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sectionLoading.script && <LoadingCard label="Writing full video script" />}
        {sectionError.script && <ErrorCard error={sectionError.script} onRetry={() => generateSection('script')} />}
        {data?.script && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <CopyButton text={fullText} id="script-full" label="Copy Full Script" />
            </div>
            <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
              <h4 style={{ color: '#f72585', margin: '0 0 8px', fontSize: 13, textTransform: 'uppercase' }}>ðŸŽ¬ Intro Hook (15-20s)</h4>
              <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.script.intro}</div>
            </div>
            <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
              <h4 style={{ color: '#6c63ff', margin: '0 0 8px', fontSize: 13, textTransform: 'uppercase' }}>ðŸ“– Main Content</h4>
              <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.script.main}</div>
            </div>
            <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
              <h4 style={{ color: '#10b981', margin: '0 0 8px', fontSize: 13, textTransform: 'uppercase' }}>ðŸ“¢ Call To Action</h4>
              <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.script.cta}</div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderDescription = () => {
    const data = sectionData.description;
    return (
      <div>
        {sectionLoading.description && <LoadingCard label="Writing YouTube-optimized description" />}
        {sectionError.description && <ErrorCard error={sectionError.description} onRetry={() => generateSection('description')} />}
        {data?.description && (
          <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ margin: 0, color: '#fff', fontSize: 14 }}>ðŸ“ YouTube Description</h4>
              <CopyButton text={data.description} id="desc" label="Copy" />
            </div>
            <div style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.description}</div>
            <div style={{ color: '#64748b', fontSize: 10, marginTop: 8 }}>{data.description.length} characters</div>
          </div>
        )}
      </div>
    );
  };

  const renderTags = () => {
    const data = sectionData.tags;
    return (
      <div>
        {sectionLoading.tags && <LoadingCard label="Generating 25 SEO tags" />}
        {sectionError.tags && <ErrorCard error={sectionError.tags} onRetry={() => generateSection('tags')} />}
        {data?.tags && (
          <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, color: '#fff', fontSize: 14 }}>ðŸ·ï¸ {data.tags.length} YouTube Tags</h4>
              <CopyButton text={data.tags.join(', ')} id="tags-all" label="Copy All (CSV)" />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.tags.map((t, i) => (
                <button key={i} onClick={() => copy(t, `tag-${i}`)} data-tool-action
                  style={{ background: copiedKey === `tag-${i}` ? '#10b981' : '#fbbf2422', color: copiedKey === `tag-${i}` ? '#fff' : '#fbbf24', border: '1px solid #fbbf2455', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {copiedKey === `tag-${i}` ? 'âœ…' : ''}{t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderThumbnails = () => {
    const data = sectionData.thumbnails;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {sectionLoading.thumbnails && <div style={{ gridColumn: '1 / -1' }}><LoadingCard label="Generating 3 thumbnail prompts" /></div>}
        {sectionError.thumbnails && <div style={{ gridColumn: '1 / -1' }}><ErrorCard error={sectionError.thumbnails} onRetry={() => generateSection('thumbnails')} /></div>}
        {data?.thumbnails?.map((t, i) => (
          <div key={i} style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ background: '#f7258522', color: '#f72585', border: '1px solid #f7258555', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>ðŸŽ¨ Style: {t.style || `Variant ${i + 1}`}</span>
              <CopyButton text={t.prompt} id={`thumb-${i}`} label="Copy" />
            </div>
            <div style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.6, fontStyle: 'italic' }}>{t.prompt}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderSEO = () => {
    const data = sectionData.seo;
    return (
      <div>
        {sectionLoading.seo && <LoadingCard label="Scoring your YouTube SEO" />}
        {sectionError.seo && <ErrorCard error={sectionError.seo} onRetry={() => generateSection('seo')} />}
        {data?.seo && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
              <ScoreBar label="ðŸ“Œ Title Score" value={data.seo.title_score} color={scoreColor(data.seo.title_score)} />
              <ScoreBar label="ðŸ“ Description Score" value={data.seo.description_score} color={scoreColor(data.seo.description_score)} />
              <ScoreBar label="ðŸ·ï¸ Tags Score" value={data.seo.tags_score} color={scoreColor(data.seo.tags_score)} />
              <ScoreBar label="ðŸŒŸ Overall Score" value={data.seo.overall_score} color={scoreColor(data.seo.overall_score)} />
            </div>
            {data.seo.tips && data.seo.tips.length > 0 && (
              <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
                <h4 style={{ color: '#fff', fontSize: 14, margin: '0 0 10px' }}>ðŸ’¡ Actionable Improvement Tips</h4>
                {data.seo.tips.map((tip, i) => (
                  <div key={i} style={{ background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                    <div style={{ color: '#fbbf24', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                      {tip.area} Â· Priority
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.6 }}>{tip.tip}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderIdeas = () => {
    const data = sectionData.ideas;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
        {sectionLoading.ideas && <div style={{ gridColumn: '1 / -1' }}><LoadingCard label="Suggesting 5 related video ideas" /></div>}
        {sectionError.ideas && <div style={{ gridColumn: '1 / -1' }}><ErrorCard error={sectionError.ideas} onRetry={() => generateSection('ideas')} /></div>}
        {data?.ideas?.map((idea, i) => (
          <div key={i} style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <h4 style={{ margin: 0, color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.4, flex: 1 }}>{idea.title}</h4>
              <CopyButton text={`${idea.title}\n\n${idea.description}`} id={`idea-${i}`} label="Copy" />
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>{idea.description}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'rewrite': return renderRewrite();
      case 'keywords': return renderKeywords();
      case 'titles': return renderTitles();
      case 'hooks': return renderHooks();
      case 'script': return renderScript();
      case 'description': return renderDescription();
      case 'tags': return renderTags();
      case 'thumbnails': return renderThumbnails();
      case 'seo': return renderSEO();
      case 'ideas': return renderIdeas();
      default: return null;
    }
  };

  return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh', color: '#e2e8f0', direction: 'ltr' }}>
      <nav style={{ background: '#16162a', borderBottom: '1px solid #2d2d4e', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="ycsgrad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#ff0033" /><stop offset="100%" stopColor="#ff4444" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#ycsgrad)" />
            <path d="M12 10l10 6-10 6z" fill="white" />
          </svg>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>YouTube AI Content Suite</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {pendingQueue > 0 && <span style={{ background: '#f7258522', color: '#f72585', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>â³ {pendingQueue} pending</span>}
          <span style={{ background: '#10b98122', color: '#10b981', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>ðŸ“Š {progress.loaded}/{progress.total} generated</span>
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: 0, minHeight: 'calc(100vh - 60px)' }}>
        <aside style={{ background: '#16162a', borderRight: '1px solid #2d2d4e', padding: 20, overflowY: 'auto' }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>ðŸ”— Fetch from YouTube URL</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                data-tool-action
                style={{ flex: 1, background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 12, boxSizing: 'border-box' }} />
              <button onClick={handleFetchTranscript} disabled={fetchingTranscript || !videoUrl.trim()} data-tool-action
                style={{ background: fetchingTranscript || !videoUrl.trim() ? '#2d2d4e' : 'linear-gradient(135deg, #ff0033, #ff4444)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {fetchingTranscript ? 'â³' : 'ðŸ“¥'}
              </button>
            </div>
            {fetchError && <div style={{ marginTop: 6, color: '#fca5a5', fontSize: 11, lineHeight: 1.4 }}>âš ï¸ {fetchError}</div>}
            <div style={{ marginTop: 6, color: '#64748b', fontSize: 10, lineHeight: 1.4 }}>Free transcript fetch via Piped Â· no YouTube API needed</div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
              <span>ðŸ“ Or paste transcript</span>
              <span style={{ color: '#64748b', fontSize: 10, fontWeight: 400 }}>{transcript.length} chars</span>
            </label>
            <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
              placeholder="Paste your video transcript or any text here. The AI will use it to generate all 10 sections."
              rows={10}
              data-tool-action
              style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 12, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', minHeight: 180 }} />
          </div>

          {transcript && (
            <div style={{ background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: 10, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>âœ… Ready</span>
                <button onClick={() => { setTranscript(''); setVideoUrl(''); sectionCache.current = {}; setSectionData({}); setSectionError({}); setProgress({ loaded: 0, total: TABS.length }); }} data-tool-action
                  style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #2d2d4e', borderRadius: 6, padding: '3px 8px', fontSize: 10, cursor: 'pointer' }}>Clear</button>
              </div>
              <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>Click any tab to generate that section. Results are cached â€” no re-fetch when switching.</div>
            </div>
          )}

          <div style={{ background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>ðŸ”‘ Powered by</div>
            <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>OpenRouter API (admin-configured). All 10 sections use real AI â€” no hardcoded outputs.</div>
          </div>
        </aside>

        <main style={{ padding: 24, overflowY: 'auto' }}>
          {apiStatus.checked && !apiStatus.ok && <ConfigMissingCard />}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {TABS.map(t => {
              const isActive = activeTab === t.id;
              const hasData = !!sectionData[t.id];
              const isLoading = !!sectionLoading[t.id];
              return (
                <button key={t.id} onClick={() => handleTabClick(t.id)} data-tool-action
                  style={{ background: isActive ? 'linear-gradient(135deg, #ff0033, #ff4444)' : 'transparent', color: isActive ? '#fff' : '#94a3b8', border: '1px solid ' + (isActive ? 'transparent' : '#2d2d4e'), borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                  <span style={{ fontSize: 14 }}>{t.emoji}</span>
                  {t.label}
                  {hasData && !isActive && <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, background: '#10b981', borderRadius: '50%' }} />}
                  {isLoading && <span style={{ marginLeft: 4 }}>â³</span>}
                </button>
              );
            })}
          </div>

          {renderActiveTab()}

          {!transcript && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>ðŸŽ¬</div>
              <h2 style={{ color: '#cbd5e1', fontSize: 22, marginBottom: 8 }}>Ready to optimize your YouTube video?</h2>
              <p style={{ maxWidth: 480, fontSize: 14, lineHeight: 1.6, margin: 0 }}>Paste a transcript in the left panel or fetch one from a YouTube URL. Then click any tab to generate that section â€” titles, hooks, scripts, descriptions, tags, thumbnails, SEO scores, and video ideas.</p>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          aside { border-right: none !important; border-bottom: 1px solid #2d2d4e; }
          nav h1 { font-size: 14px !important; }
        }
      `}</style>
    </div>
  );
}


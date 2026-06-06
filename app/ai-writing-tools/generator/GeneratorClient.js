'use client';
import { useState } from 'react';
import ToolBanner from '@/components/ads/ToolBanner';

const ACCENT = '#7c3aed';
const LANGUAGES = [
  'Arabic', 'English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese',
  'Russian', 'Chinese', 'Japanese', 'Turkish', 'Dutch', 'Polish', 'Hindi',
  'Korean', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek', 'Czech',
  'Romanian', 'Hungarian', 'Ukrainian', 'Hebrew', 'Persian', 'Malay',
  'Indonesian', 'Vietnamese', 'Thai'
];
const TONES = ['Professional', 'Casual', 'Academic', 'Persuasive', 'Informative', 'Creative', 'Journalistic'];
const WORD_OPTIONS = [900, 1200, 1500];

export default function GeneratorClient() {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Professional');
  const [wordCount, setWordCount] = useState(900);
  const [article, setArticle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHowTo, setShowHowTo] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setArticle('');
    try {
      const res = await fetch('/api/article-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language, tone, wordCount })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Request failed');
      setArticle(d.result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    const plain = article.replace(/<[^>]*>/g, '').replace(/[#*`\[\]]/g, '');
    await navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const plain = article.replace(/<[^>]*>/g, '').replace(/[#*`\[\]]/g, '');
    const blob = new Blob([plain], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${topic?.slice(0, 30) || 'article'}.txt`;
    a.click();
  };

  const mdToHtml = (md) => {
    return md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/\d+\. (.+)/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, (m) => m.includes('<ul>') ? m : '<ol>' + m + '</ol>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[huloi])/gm, (m) => m.trim() ? '' : m)
      .replace(/(<p>)?\n(<\/?[hul])/g, '$2')
      .replace(/(<\/[hul]>)\n(<p>)?/g, '$1')
      .replace(/<\/ol>\n<ol>/g, '')
      .replace(/<\/ul>\n<ul>/g, '');
  };

  const wordCountNum = article
    ? article.replace(/<[^>]*>/g, '').replace(/[#*`\[\]]/g, '').trim().split(/\s+/).length
    : 0;

  const encodedTopic = encodeURIComponent(topic?.slice(0, 50) || 'article');
  const imgUrl = `https://image.pollinations.ai/prompt/${encodedTopic}?width=800&height=450&nologo=true`;

  const htmlParts = article ? article.split(/(?=## )/).filter(Boolean) : [];
  const introIndex = htmlParts.findIndex(p => p.startsWith('## Introduction'));
  const section3Index = htmlParts.findIndex(p => p.match(/^## Section 3/i) || p.match(/^## \d+\./));
  const conclusionIndex = htmlParts.findIndex(p => p.startsWith('## Conclusion') || p.startsWith('## FAQ'));

  let finalHtml = '';
  if (article) {
    finalHtml = mdToHtml(article);
    const imgHtml = `<div style="margin:24px 0;border-radius:12px;overflow:hidden"><img src="${imgUrl}" alt="${topic}" style="width:100%;display:block;border-radius:12px"/></div>`;
    if (conclusionIndex >= 0 && conclusionIndex < htmlParts.length) {
      const beforeConclusion = htmlParts.slice(0, conclusionIndex).join('\n');
      const conclusionPart = htmlParts.slice(conclusionIndex).join('\n');
      let afterIntro = '';
      if (introIndex >= 0 && introIndex < htmlParts.length) {
        const beforeIntro = htmlParts.slice(0, introIndex + 1).join('\n');
        const rest = htmlParts.slice(introIndex + 1, conclusionIndex).join('\n');
        const restParts = rest.split(/(?=## )/);
        let mid = '';
        if (restParts.length >= 3) {
          mid = restParts.slice(0, 2).join('\n') + imgHtml + restParts.slice(2).join('\n');
        } else {
          mid = rest + imgHtml;
        }
        finalHtml = mdToHtml(beforeIntro) + imgHtml + mdToHtml(mid) + mdToHtml(conclusionPart);
      } else {
        finalHtml = mdToHtml(beforeConclusion) + imgHtml + mdToHtml(conclusionPart);
      }
    } else {
      finalHtml = mdToHtml(article) + imgHtml;
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #374151', background: '#1f2937',
    color: '#e5e7eb', fontSize: 14, outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: '#9ca3af', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: '0.3px'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '100vh' }}>
        {/* LEFT PANEL */}
        <div style={{ flex: '1 1 480px', padding: '32px 28px', borderRight: '1px solid #1e293b' }}>
          <a href="/ai-writing-tools" style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            ← Back to Tools
          </a>

          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>
            <span style={{ marginRight: 8 }}>✍️</span> AI Article Generator
          </h1>

          <ToolBanner slotId="ai-generator" />

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Topic</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. The Future of Renewable Energy in 2030"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={inputStyle}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tone</label>
              <select value={tone} onChange={e => setTone(e.target.value)} style={inputStyle}>
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Word Count</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {WORD_OPTIONS.map(w => (
                <button
                  key={w}
                  onClick={() => setWordCount(w)}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 8,
                    border: w === wordCount ? '2px solid #8b5cf6' : '1px solid #374151',
                    background: w === wordCount ? '#8b5cf614' : '#1f2937',
                    color: w === wordCount ? '#a78bfa' : '#9ca3af',
                    fontSize: 13, fontWeight: w === wordCount ? 600 : 400,
                    cursor: 'pointer', textAlign: 'center'
                  }}
                >
                  {w.toLocaleString()} words
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !topic.trim()}
            style={{
              width: '100%', padding: '14px 24px', borderRadius: 8,
              border: 'none',
              background: loading ? '#4b5563' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff', fontSize: 16, fontWeight: 600,
              cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !topic.trim() ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            {loading ? '✍️ Writing your article, please wait...' : '✨ Generate Article'}
          </button>

          {/* How to use */}
          <div style={{ marginTop: 24, borderTop: '1px solid #1e293b', paddingTop: 16 }}>
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
            >
              {showHowTo ? '▼' : '▶'} How to use
            </button>
            {showHowTo && (
              <ol style={{ marginTop: 12, paddingLeft: 20, color: '#94a3b8', fontSize: 13, lineHeight: 2 }}>
                <li>Enter your article topic in the field above</li>
                <li>Select your preferred language</li>
                <li>Choose the tone and word count</li>
                <li>Click Generate and wait 10-20 seconds</li>
                <li>Copy or download your article</li>
              </ol>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - PREVIEW */}
        <div style={{ flex: '1 1 480px', padding: '32px 28px', background: '#0b1120', overflowY: 'auto', maxHeight: '100vh', position: 'sticky', top: 0 }}>
          {loading && (
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <div style={{ width: '100%', height: 4, background: '#1e293b', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 2, animation: 'shimmer 1.5s infinite ease-in-out' }} />
              </div>
              <div style={{ fontSize: 24, marginBottom: 12 }}>✍️</div>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Writing your article, please wait...</p>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 40, textAlign: 'center', padding: 24, background: '#1e293b', borderRadius: 12 }}>
              <p style={{ color: '#ef4444', marginBottom: 16 }}>Something went wrong. Please try again.</p>
              <button onClick={generate} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', cursor: 'pointer', fontSize: 14 }}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && !article && (
            <div style={{ marginTop: 60, textAlign: 'center', color: '#475569' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
              <p style={{ fontSize: 16 }}>Your article will appear here...</p>
            </div>
          )}

          {article && !loading && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ padding: '4px 12px', borderRadius: 999, background: '#1e293b', color: '#94a3b8', fontSize: 12 }}>
                  {wordCountNum.toLocaleString()} words
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={copy} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #374151', background: '#1f2937', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={download} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #374151', background: '#1f2937', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>
                    Download .txt
                  </button>
                </div>
              </div>
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: finalHtml }}
                style={{ lineHeight: 1.8, fontSize: 15, color: '#cbd5e1' }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .article-content h1 { font-size: 1.8rem; font-weight: 700; margin: 0 0 16px; color: #f1f5f9; }
        .article-content h2 { font-size: 1.35rem; font-weight: 600; margin: 28px 0 12px; color: #e2e8f0; }
        .article-content h3 { font-size: 1.1rem; font-weight: 600; margin: 20px 0 8px; color: #cbd5e1; }
        .article-content p { margin: 0 0 14px; line-height: 1.8; }
        .article-content ul, .article-content ol { margin: 0 0 14px; padding-left: 24px; }
        .article-content li { margin-bottom: 6px; }
        .article-content strong { color: #e2e8f0; }
        .article-content em { color: #94a3b8; }
        @media (max-width: 960px) {
          div[style*="flex: 1 1 480px"] { flex: 1 1 100% !important; }
          div[style*="maxHeight: 100vh"] { max-height: none !important; position: static !important; }
        }
      `}</style>
    </div>
  );
}

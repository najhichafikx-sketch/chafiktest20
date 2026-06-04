'use client';
import { useState, useRef } from 'react';

const ACCENT_GREEN = '#10b981';

const CHECK_ITEMS = [
  { item: 'H1 title present and optimized', key: 'h1_title' },
  { item: 'Meta description suggestion', key: 'meta_desc' },
  { item: 'Keyword distribution throughout article', key: 'keyword_dist' },
  { item: 'Heading hierarchy (H1→H2→H3)', key: 'heading_hierarchy' },
  { item: 'Paragraph length (under 150 words each)', key: 'para_length' },
  { item: 'Transition words usage (min 30%)', key: 'transition_words' },
  { item: 'Passive voice percentage (under 10%)', key: 'passive_voice' },
  { item: 'Article length (min 300 words)', key: 'article_length' },
  { item: 'Sentence length variety', key: 'sentence_variety' },
  { item: 'Conclusion present', key: 'conclusion' },
];

export default function AnalyzerClient() {
  const [article, setArticle] = useState('');
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [improved, setImproved] = useState('');
  const [showHowTo, setShowHowTo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [improvedCopied, setImprovedCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setArticle(ev.target.result);
    reader.readAsText(file);
  };

  const analyze = async () => {
    if (!article.trim()) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setImproved('');
    try {
      const res = await fetch('/api/seo-analyze-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', article })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Request failed');
      setAnalysis(d.analysis);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const improve = async () => {
    if (!analysis || !article) return;
    setImproving(true);
    try {
      const res = await fetch('/api/seo-analyze-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'improve', article, topIssues: analysis.topIssues })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Request failed');
      setImproved(d.result);
    } catch (e) {
      setError(e.message);
    } finally {
      setImproving(false);
    }
  };

  const copyPlain = (text, setter) => {
    const plain = text.replace(/<[^>]*>/g, '').replace(/[#*`\[\]]/g, '');
    navigator.clipboard.writeText(plain);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const downloadTxt = (text, name) => {
    const plain = text.replace(/<[^>]*>/g, '').replace(/[#*`\[\]]/g, '');
    const blob = new Blob([plain], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
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
      .replace(/(<li>.*<\/li>\n?)+/g, m => m.includes('<ul>') ? m : '<ol>' + m + '</ol>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/(<p>)?\n(<\/?[hul])/g, '$2')
      .replace(/(<\/[hul]>)\n(<p>)?/g, '$1')
      .replace(/<\/ol>\n<ol>/g, '').replace(/<\/ul>\n<ul>/g, '');
  };

  const scoreColor = analysis
    ? analysis.score >= 80 ? '#10b981' : analysis.score >= 50 ? '#f59e0b' : '#ef4444'
    : '#10b981';
  const scoreLabel = analysis
    ? analysis.score >= 80 ? 'Excellent' : analysis.score >= 50 ? 'Needs Work' : 'Poor'
    : '';

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #d0d4dc', background: '#fff',
    color: '#1a1a2e', fontSize: 14, outline: 'none',
    boxSizing: 'borderBox', fontFamily: 'inherit'
  };

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <a href="/ai-writing-tools" style={{ color: 'var(--neon-purple)', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          ← Back to Tools
        </a>

        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          <span style={{ marginRight: 8 }}>📊</span> SEO Article Analyzer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
          Paste any article and get a full SEO audit with a score out of 100.
        </p>

        {/* Input */}
        <div style={{ background: 'var(--bg-glass)', borderRadius: 12, padding: 24, marginBottom: 16, border: '1px solid var(--bg-glass-border)' }}>
          <textarea
            value={article}
            onChange={e => setArticle(e.target.value)}
            placeholder="Paste your article here..."
            rows={10}
            style={{ ...inputStyle, minHeight: 250, resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={analyze}
              disabled={loading || !article.trim()}
              style={{
                padding: '12px 28px', borderRadius: 8, border: 'none',
                background: loading ? '#9ca3af' : ACCENT_GREEN,
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading || !article.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !article.trim() ? 0.7 : 1
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze SEO'}
            </button>
            <input ref={fileInputRef} type="file" accept=".txt" onChange={handleFile} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid var(--bg-glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14 }}>
              📁 Upload .txt file
            </button>
          </div>
        </div>

        {/* How to use */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowHowTo(!showHowTo)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
          >
            {showHowTo ? '▼' : '▶'} How to use
          </button>
          {showHowTo && (
            <ol style={{ marginTop: 12, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 2 }}>
              <li>Paste your article text or upload a .txt file</li>
              <li>Click &quot;Analyze SEO&quot;</li>
              <li>Review your SEO score and detailed checklist</li>
              <li>Click &quot;Improve Article&quot; to let AI fix all issues automatically</li>
              <li>Copy or download the improved version</li>
            </ol>
          )}
        </div>

        {error && (
          <div style={{ padding: 16, background: 'rgba(239,68,68,0.1)', borderRadius: 8, borderLeft: '4px solid #ef4444', marginBottom: 16 }}>
            <p style={{ color: '#ef4444', margin: 0, fontSize: 14 }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div>
            {/* Score */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke={scoreColor} strokeWidth="8"
                    strokeDasharray={`${analysis.score * 3.39} 339.3`}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <text x="60" y="56" textAnchor="middle" fontSize="28" fontWeight="700" fill={scoreColor}>{analysis.score}</text>
                  <text x="60" y="76" textAnchor="middle" fontSize="12" fill="#9ca3af">/ 100</text>
                </svg>
                <div style={{ fontSize: 14, fontWeight: 600, color: scoreColor, marginTop: 4 }}>{scoreLabel}</div>
              </div>

              {/* Stats */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: '📝', label: 'Word Count', value: analysis.wordCount?.toLocaleString() },
                  { icon: '📌', label: 'Headings Found', value: `H1(${analysis.headings?.h1 || 0}) H2(${analysis.headings?.h2 || 0}) H3(${analysis.headings?.h3 || 0})` },
                  { icon: '🔑', label: 'Top Keyword Density', value: `"${analysis.topKeyword?.word || '—'}" — ${analysis.topKeyword?.density || 0}%` },
                  { icon: '📖', label: 'Readability', value: analysis.readability },
                ].map((stat, i) => (
                  <div key={i} style={{ background: 'var(--bg-glass)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--bg-glass-border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{stat.icon} {stat.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div style={{ background: 'var(--bg-glass)', borderRadius: 12, padding: 24, border: '1px solid var(--bg-glass-border)', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>SEO Checklist</h3>
              {analysis.checks?.map((check, i) => {
                const icon = check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
                const color = check.status === 'pass' ? '#10b981' : check.status === 'warning' ? '#f59e0b' : '#ef4444';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: i < analysis.checks.length - 1 ? '1px solid var(--bg-glass-border)' : 'none' }}>
                    <span style={{ flexShrink: 0 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{check.item}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{check.message}</div>
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      color: color, background: `${color}14`
                    }}>
                      {check.status === 'pass' ? 'Pass' : check.status === 'warning' ? 'Warning' : 'Fail'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Improve Button */}
            <button
              onClick={improve}
              disabled={improving}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: 8, border: 'none',
                background: improving ? '#9ca3af' : '#7c3aed',
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: improving ? 'not-allowed' : 'pointer',
                opacity: improving ? 0.7 : 1,
                marginBottom: 20
              }}
            >
              {improving ? '🔧 Improving your article...' : '🚀 Improve Article with AI'}
            </button>

            {/* Improved article */}
            {improved && (
              <div style={{ background: 'var(--bg-glass)', borderRadius: 12, padding: 24, border: '1px solid var(--bg-glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Improved Article</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => copyPlain(improved, setImprovedCopied)} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--bg-glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 }}>
                      {improvedCopied ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={() => downloadTxt(improved, 'improved-article.txt')} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--bg-glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 }}>
                      Download .txt
                    </button>
                  </div>
                </div>
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: mdToHtml(improved) }}
                  style={{ lineHeight: 1.8, fontSize: 14, color: 'var(--text-secondary)' }}
                />
              </div>
            )}
          </div>
        )}

        {!analysis && !loading && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <p style={{ fontSize: 15 }}>Paste an article above to see the SEO analysis</p>
          </div>
        )}
      </div>

      <style>{`
        .article-content h1 { font-size: 1.6rem; font-weight: 700; margin: 0 0 14px; color: var(--text-primary); }
        .article-content h2 { font-size: 1.25rem; font-weight: 600; margin: 24px 0 10px; color: var(--text-primary); }
        .article-content h3 { font-size: 1.05rem; font-weight: 600; margin: 16px 0 8px; color: var(--text-primary); }
        .article-content p { margin: 0 0 12px; line-height: 1.8; }
        .article-content ul, .article-content ol { margin: 0 0 12px; padding-left: 24px; }
        .article-content li { margin-bottom: 4px; }
      `}</style>
    </section>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';

const PLATFORMS = [
  { id: 'etsy', name: 'Etsy', color: '#F56400', emoji: '🛍️' },
  { id: 'kdp', name: 'Amazon KDP', color: '#FF9900', emoji: '📚' },
  { id: 'gumroad', name: 'Gumroad', color: '#FF90E8', emoji: '💸' },
  { id: 'creative-fabrica', name: 'Creative Fabrica', color: '#5C2D91', emoji: '🎨' },
  { id: 'tpt', name: 'TPT', color: '#00B4D8', emoji: '🎓' }
];

const TABS = [
  { id: 'seo', label: 'SEO' },
  { id: 'page', label: 'صفحة المنتج' },
  { id: 'cover', label: 'الغلاف' },
  { id: 'pricing', label: 'التسعير' },
  { id: 'marketing', label: 'التسويق' },
  { id: 'cro', label: 'CRO' }
];

const READINESS_FIELDS = ['title', 'description', 'keywords'];

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('seo');
  const [copiedKey, setCopiedKey] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  const readiness = Math.round(
    READINESS_FIELDS.reduce((sum, field) => {
      const values = { title, description, keywords };
      return sum + (values[field] && values[field].trim() ? 25 : 0);
    }, 0) +
    (price && price.trim() ? 15 : 0) +
    (imageBase64 ? 10 : 0)
  );

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('حجم الصورة يتجاوز 5 ميجا'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      setImageBase64(base64);
      setImageMimeType(file.type);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageBase64(null);
    setImageMimeType(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!title.trim()) { setError('عنوان المنتج مطلوب'); return; }
    setError(null);
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch('/api/digital-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, title, description, keywords, price, url, imageBase64, imageMimeType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setAnalysis(data.analysis);
      setActiveTab('seo');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000); } catch {}
      document.body.removeChild(ta);
    }
  };

  const download = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ScoreRing = ({ value, label, color }) => {
    const v = Math.max(0, Math.min(100, value || 0));
    const r = 30, c = 2 * Math.PI * r;
    const dash = (v / 100) * c;
    return (
      <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 14, textAlign: 'center' }}>
        <svg width="76" height="76" viewBox="0 0 76 76" style={{ display: 'block', margin: '0 auto 8px' }}>
          <circle cx="38" cy="38" r={r} fill="none" stroke="#2d2d4e" strokeWidth="6" />
          <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
            transform="rotate(-90 38 38)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
          <text x="38" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">{v}</text>
        </svg>
        <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      </div>
    );
  };

  const ResultCard = ({ title, content, copyKey, filename, isList, isText }) => {
    const text = Array.isArray(content) ? content.join('\n• ') : (content || '');
    return (
      <div style={{ background: '#16162a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>{title}</h4>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => copy(isList ? content.join('\n') : text, copyKey)} data-tool-action
              style={{ background: copiedKey === copyKey ? '#10b981' : '#2d2d4e', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
              {copiedKey === copyKey ? '✅ تم النسخ' : '📋 نسخ'}
            </button>
            <button onClick={() => download(isList ? content.join('\n') : text, filename)} data-tool-action
              style={{ background: '#2d2d4e', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              ⬇️ تحميل
            </button>
          </div>
        </div>
        {isList ? (
          <ul style={{ margin: 0, paddingRight: 18, color: '#cbd5e1', fontSize: 13, lineHeight: 1.7 }}>
            {content.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{item}</li>)}
          </ul>
        ) : (
          <div style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</div>
        )}
      </div>
    );
  };

  const renderTab = () => {
    if (!analysis) return null;
    if (activeTab === 'seo') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <ResultCard title="العنوان المحسّن (SEO)" content={analysis.optimized_title} copyKey="title" filename="optimized-title.txt" />
          <ResultCard title="Long-tail Keywords" content={analysis.keywords || []} copyKey="kw" filename="keywords.txt" isList />
        </div>
      );
    }
    if (activeTab === 'page') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
          <ResultCard title="Bullet Points مقنعة" content={analysis.bullets || []} copyKey="bullets" filename="bullets.txt" isList />
        </div>
      );
    }
    if (activeTab === 'cover') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
          <ResultCard title="نصائح تصميم الغلاف" content={analysis.cover_tips || []} copyKey="cover" filename="cover-tips.txt" isList />
        </div>
      );
    }
    if (activeTab === 'pricing') {
      const pricingText = `الحد الأدنى: $${analysis.price_min}\nالموصى به: $${analysis.price_recommended}\nPremium: $${analysis.price_premium}\n\n💡 Bundle Idea: ${analysis.bundle_idea}\n\n🎁 Upsell Idea: ${analysis.upsell_idea}`;
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid #334155', borderRadius: 12, padding: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>الحد الأدنى</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '8px 0' }}>${analysis.price_min}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #6c63ff22, #f7258522)', border: '2px solid #6c63ff', borderRadius: 12, padding: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#a5b4fc', textTransform: 'uppercase' }}>الموصى به ⭐</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '8px 0' }}>${analysis.price_recommended}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid #334155', borderRadius: 12, padding: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Premium</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '8px 0' }}>${analysis.price_premium}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <ResultCard title="استراتيجية التسعير الكاملة" content={pricingText} copyKey="pricing" filename="pricing-strategy.txt" />
          </div>
        </div>
      );
    }
    if (activeTab === 'marketing') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <ResultCard title="📸 Instagram" content={analysis.instagram} copyKey="ig" filename="instagram.txt" />
          <ResultCard title="📌 Pinterest" content={analysis.pinterest} copyKey="pin" filename="pinterest.txt" />
          <ResultCard title="🐦 Twitter/X" content={analysis.twitter} copyKey="tw" filename="twitter.txt" />
          <ResultCard title="📘 Facebook" content={analysis.facebook} copyKey="fb" filename="facebook.txt" />
          <ResultCard title="✉️ Email" content={`Subject: ${analysis.email_subject}\n\n${analysis.email_body}`} copyKey="email" filename="email.txt" />
        </div>
      );
    }
    if (activeTab === 'cro') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <ResultCard title="✅ نقاط القوة" content={analysis.strengths || []} copyKey="str" filename="strengths.txt" isList />
          <ResultCard title="⚠️ نقاط الضعف" content={analysis.weaknesses || []} copyKey="wk" filename="weaknesses.txt" isList />
        </div>
      );
    }
  };

  return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh', color: '#e2e8f0', direction: 'rtl' }}>
      <nav style={{ background: '#16162a', borderBottom: '1px solid #2d2d4e', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="dcgrad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#6c63ff" /><stop offset="100%" stopColor="#f72585" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#dcgrad)" />
            <path d="M8 12h16M8 16h10M8 20h13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="24" cy="10" r="3" fill="#f72585" />
          </svg>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>AI Digital Creator Suite</h1>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background: activeTab === t.id ? 'linear-gradient(135deg, #6c63ff, #f72585)' : 'transparent', color: activeTab === t.id ? '#fff' : '#94a3b8', border: '1px solid ' + (activeTab === t.id ? 'transparent' : '#2d2d4e'), borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>
        <button style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0f0f1a', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Pro ⚡</button>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: 0, minHeight: 'calc(100vh - 60px)' }}>
        <aside style={{ background: '#16162a', borderLeft: '1px solid #2d2d4e', padding: 20, overflowY: 'auto' }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>المنصة</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 6 }}>
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  style={{ background: platform === p.id ? p.color : '#0f0f1a', color: '#fff', border: '1px solid ' + (platform === p.id ? p.color : '#2d2d4e'), borderRadius: 8, padding: '8px 4px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 18 }}>{p.emoji}</span>{p.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>صورة المنتج (اختياري)</label>
            <div onClick={() => fileInputRef.current?.click()} style={{ background: '#0f0f1a', border: '2px dashed #2d2d4e', borderRadius: 10, padding: 14, textAlign: 'center', cursor: 'pointer', position: 'relative', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 6 }} />
                  <button onClick={(e) => { e.stopPropagation(); removeImage(); }} style={{ position: 'absolute', top: 4, left: 4, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, width: 22, height: 22, fontSize: 12, cursor: 'pointer' }}>✕</button>
                </>
              ) : (
                <div style={{ color: '#64748b', fontSize: 12 }}>📎 اضغط لرفع صورة</div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>عنوان المنتج *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: Budget Planner Printable PDF"
              style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>وصف المنتج (اختياري)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="وصف مختصر للمنتج..." rows={3}
              style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 12, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>الكلمات المفتاحية (اختياري)</label>
            <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="budget, planner, printable"
              style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 12, boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>السعر ($)</label>
              <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" placeholder="9.99"
                style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 12, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>رابط المنتج</label>
              <input value={url} onChange={e => setUrl(e.target.value)} type="url" placeholder="https://..."
                style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 12, boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ background: '#0f0f1a', border: '1px solid #2d2d4e', borderRadius: 8, padding: 10, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>نقاط الجاهزية</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: readiness >= 80 ? '#10b981' : readiness >= 50 ? '#fbbf24' : '#ef4444' }}>{readiness}%</span>
            </div>
            <div style={{ height: 4, background: '#2d2d4e', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: readiness + '%', height: '100%', background: readiness >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : readiness >= 50 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #ef4444, #f87171)', transition: 'width 0.4s' }} />
            </div>
          </div>

          <button onClick={handleAnalyze} disabled={loading || !title.trim()} data-tool-action
            style={{ width: '100%', background: loading || !title.trim() ? '#2d2d4e' : 'linear-gradient(135deg, #6c63ff, #f72585)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 700, cursor: loading || !title.trim() ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ جاري التحليل...' : '🚀 تحليل المنتج الآن'}
          </button>
        </aside>

        <main style={{ padding: 24, overflowY: 'auto' }}>
          {error && <div style={{ background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 10, padding: 14, marginBottom: 18, color: '#fca5a5', fontSize: 13 }}>⚠️ {error}</div>}

          {!analysis && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
              <h2 style={{ color: '#cbd5e1', fontSize: 22, marginBottom: 8 }}>جاهز لتحسين منتجك؟</h2>
              <p style={{ maxWidth: 400, fontSize: 14, lineHeight: 1.6 }}>املأ تفاصيل المنتج في اللوحة اليسرى واضغط "تحليل المنتج" للحصول على 6 مخرجات احترافية: عنوان SEO، كلمات مفتاحية، نقاط بيع، نصائح غلاف، استراتيجية تسعير، ومحتوى تسويقي.</p>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, border: '4px solid #2d2d4e', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 18 }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>الذكاء الاصطناعي يحلل منتجك...</p>
            </div>
          )}

          {analysis && !loading && (
            <>
              <div style={{ background: 'linear-gradient(135deg, #16162a, #1e1e3a)', border: '1px solid #2d2d4e', borderRadius: 14, padding: 20, marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>{title}</h2>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>📊 تحليل AI مكتمل</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #6c63ff22, #f7258522)', border: '1px solid #6c63ff', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#a5b4fc', textTransform: 'uppercase' }}>المبيعات المتوقعة</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{analysis.monthly_prediction_min} - {analysis.monthly_prediction_max} <span style={{ fontSize: 11, color: '#94a3b8' }}>شهرياً</span></div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 18 }}>
                <ScoreRing value={analysis.seo_score} label="SEO Score" color="#6c63ff" />
                <ScoreRing value={analysis.competition_score} label="Competition" color="#f72585" />
                <ScoreRing value={analysis.demand_score} label="Demand" color="#10b981" />
                <ScoreRing value={analysis.conversion_score} label="Conversion" color="#fbbf24" />
              </div>

              {renderTab()}
            </>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          aside { border-left: none !important; border-bottom: 1px solid #2d2d4e; }
          nav h1 { font-size: 14px !important; }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const LANGUAGES = [
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'ar', label: 'العربية', flag: '🇸🇦' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const SOCIAL_PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'twitter', label: 'Twitter / X', icon: '𝕏' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'snapchat', label: 'Snapchat', icon: '👻' },
];

const QUICK_TEMPLATES = [
  { id: 'saas', label: 'SaaS', icon: '☁️', industry: 'SaaS', audience: 'Business professionals', tone: 'Professional & Modern' },
  { id: 'aitool', label: 'AI Tool', icon: '🤖', industry: 'AI Technology', audience: 'Tech-savvy early adopters', tone: 'Innovative & Bold' },
  { id: 'digital', label: 'Digital Product', icon: '📦', industry: 'Digital Products', audience: 'Online creators & entrepreneurs', tone: 'Benefit-driven' },
  { id: 'course', label: 'Online Course', icon: '🎓', industry: 'Education', audience: 'Lifelong learners', tone: 'Inspiring & Authoritative' },
  { id: 'coaching', label: 'Coaching', icon: '🎯', industry: 'Coaching', audience: 'Professionals seeking growth', tone: 'Personal & Trustworthy' },
  { id: 'agency', label: 'Agency', icon: '🏢', industry: 'Agency Services', audience: 'Business owners', tone: 'Professional & Results-driven' },
  { id: 'ecommerce', label: 'E-commerce', icon: '🛍️', industry: 'E-commerce', audience: 'Online shoppers', tone: 'Persuasive & Urgent' },
  { id: 'app', label: 'Mobile App', icon: '📱', industry: 'Mobile Apps', audience: 'Smartphone users', tone: 'Modern & Exciting' },
  { id: 'newsletter', label: 'Newsletter', icon: '📧', industry: 'Media', audience: 'Content consumers', tone: 'Engaging & Curious' },
  { id: 'leadgen', label: 'Lead Gen', icon: '📈', industry: 'Lead Generation', audience: 'B2B decision makers', tone: 'Direct & Compelling' },
  { id: 'affiliate', label: 'Affiliate Offer', icon: '🤝', industry: 'Affiliate Marketing', audience: 'Affiliate partners', tone: 'Energetic & Opportunistic' },
];

const COLOR_PRESETS = ['#6D28D9', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#06B6D4'];
const TONES = ['Professional', 'Modern', 'Bold', 'Friendly', 'Luxury', 'Minimal', 'Playful', 'Authoritative', 'Empathetic'];

const C = {
  bg: '#0F0F0F', card: '#1A1A2E', cardAlt: '#16213E', border: '#2D2D4E',
  text: '#F1F0FF', textMuted: '#8B8AA8', primary: '#6D28D9', primaryAlt: '#4F46E5',
  success: '#10B981', warning: '#F59E0B'
};

function maskKey(key) {
  if (!key || key.length < 8) return '';
  return key.slice(0, 7) + '•'.repeat(Math.min(20, key.length - 12)) + key.slice(-4);
}

const EXPORT_TABS = [
  { id: 'preview', label: 'Preview', icon: '🖥️' },
  { id: 'copy', label: 'Copy', icon: '📝' },
  { id: 'html', label: 'HTML', icon: '🔧' },
  { id: 'react', label: 'React', icon: '⚛️' },
  { id: 'nextjs', label: 'Next.js', icon: '▲' },
  { id: 'tailwind', label: 'Tailwind', icon: '🎨' },
  { id: 'seo', label: 'SEO', icon: '🔍' },
  { id: 'images', label: 'Image Prompts', icon: '🖼️' },
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

function Input({ label, value, keyName, placeholder, type = 'text', maxLength, C, updateForm }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label className="lp-label">{label}</label>
      {type === 'textarea' ? (
        <textarea className="lp-input" value={value} onChange={e => updateForm(keyName, e.target.value)} placeholder={placeholder} rows={3} maxLength={maxLength} />
      ) : (
        <input type={type} className="lp-input" value={value} onChange={e => updateForm(keyName, e.target.value)} placeholder={placeholder} maxLength={maxLength} />
      )}
    </div>
  );
}

function CodeBlock({ content, label, lang, C }) {
  if (!content) return <div className="lp-card" style={{ textAlign: 'center', padding: 24, color: C.textMuted, fontSize: 13 }}>Not generated. Available with premium subscription.</div>;
  return (
    <div className="lp-card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={(e) => copyText(content, e.currentTarget)} className="lp-export-btn" style={{ padding: '6px 14px', fontSize: 12 }}>📋 Copy</button>
          <button onClick={() => downloadFile(content, `landing-page-${lang || 'code'}.${lang === 'html' ? 'html' : 'txt'}`, 'text/plain')} className="lp-export-btn" style={{ padding: '6px 14px', fontSize: 12 }}>⬇ Download</button>
        </div>
      </div>
      <pre style={{ background: '#0a0a0a', border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 1.5, maxHeight: 500, overflow: 'auto', color: '#e8e6e0', margin: 0 }}><code>{content}</code></pre>
    </div>
  );
}

export default function LandingPageClient() {
  const [form, setForm] = useState({
    productName: '', serviceName: '', businessName: '', websiteName: '',
    description: '', targetAudience: '', industry: '', ctaText: 'Get Started',
    toneOfVoice: 'Professional', competitorUrls: ''
  });
  const [language, setLanguage] = useState('en');
  const [primaryColor, setPrimaryColor] = useState(C.primary);
  const [conversionMode, setConversionMode] = useState(false);
  const [monetizationFeatures, setMonetizationFeatures] = useState(false);
  const [images, setImages] = useState([]);
  const [socialEnabled, setSocialEnabled] = useState({});
  const [contact, setContact] = useState({ phone: '', whatsapp: '', email: '', location: '' });
  const [socialLinks, setSocialLinks] = useState({});
  const [activeTab, setActiveTab] = useState('preview');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [step, setStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [apiStatus, setApiStatus] = useState({ isConfigured: false });

  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/landing-page/key-status');
        if (r.ok) { const d = await r.json(); if (!cancelled) setApiStatus(d); }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  function updateForm(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function applyTemplate(tmpl) {
    setForm(prev => ({ ...prev, industry: tmpl.industry, targetAudience: tmpl.audience, toneOfVoice: tmpl.tone }));
    setError('');
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  const handleFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) { setError('Max 5 images allowed.'); return; }
    const toAdd = files.slice(0, remaining);
    const newImages = await Promise.all(toAdd.map(async (file) => ({
      id: Math.random().toString(36).slice(2, 10), name: file.name, size: file.size, dataUrl: await readFileAsDataURL(file)
    })));
    setImages(prev => [...prev, ...newImages].slice(0, 5));
    setError('');
  }, [images.length]);

  async function handleGenerate() {
    if (generating) return;
    setGenerating(true);
    setError('');
    setSuccess('');
    setResult(null);
    setStep('Researching industry & audience...');
    setProgress(15);

    const enabledSocials = {};
    SOCIAL_PLATFORMS.forEach(p => { if (socialEnabled[p.id] && socialLinks[p.id]?.trim()) enabledSocials[p.id] = socialLinks[p.id].trim(); });
    const cleanedContact = {};
    Object.entries(contact).forEach(([k, v]) => { if (v && v.trim()) cleanedContact[k] = v.trim(); });

    try {
      const res = await fetch('/api/landing-page/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, language, ctaText: form.ctaText || 'Get Started', primaryColor, contactInfo: cleanedContact, socialLinks: enabledSocials, imageUrls: images.map(img => img.dataUrl), conversionMode, monetizationFeatures })
      });

      const data = await res.json();

      if (res.status === 429) {
        setError(`Rate limit reached. Try again later.`);
        return;
      }
      if (!res.ok || !data.success) {
        setError(data.message || 'Generation failed.');
        return;
      }

      setProgress(70);
      setStep('Building components...');

      // Small delay for UX
      await new Promise(r => setTimeout(r, 500));
      setProgress(100);
      setStep('Complete!');
      setResult(data);
      setSuccess('✅ Landing page generated successfully!');
      setActiveTab('preview');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setGenerating(false);
      setStep('');
      setProgress(0);
    }
  }

  const canGenerate = !generating && (form.productName || form.serviceName);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
      <style jsx>{`
        .lp-input { width: 100%; padding: 10px 14px; background: ${C.cardAlt}; border: 1px solid ${C.border}; border-radius: 8px; color: ${C.text}; font-size: 14px; font-family: inherit; transition: border-color 0.15s; box-sizing: border-box; }
        .lp-input:focus { outline: none; border-color: ${C.primary}; }
        .lp-input::placeholder { color: ${C.textMuted}; }
        .lp-label { display: block; font-size: 11px; font-weight: 600; color: ${C.textMuted}; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        .lp-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .lp-section-title { font-size: 12px; font-weight: 700; color: ${C.textMuted}; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.06em; }
        .lp-pill { padding: 7px 12px; border-radius: 999px; border: 1px solid ${C.border}; background: ${C.cardAlt}; color: ${C.text}; cursor: pointer; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s; }
        .lp-pill:hover { border-color: ${C.primary}; }
        .lp-pill.active { background: linear-gradient(135deg, ${C.primary}, ${C.primaryAlt}); border-color: ${C.primary}; color: white; font-weight: 600; }
        .lp-pill.toggle.on { background: linear-gradient(135deg, ${C.primary}, ${C.primaryAlt}); border-color: ${C.primary}; color: white; }
        .lp-generate-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, ${C.primary}, ${C.primaryAlt}); border: none; border-radius: 10px; color: white; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 20px rgba(109, 40, 217, 0.3); }
        .lp-generate-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(109, 40, 217, 0.5); }
        .lp-generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .lp-export-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid ${C.border}; background: ${C.cardAlt}; color: ${C.text}; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .lp-export-btn:hover { border-color: ${C.primary}; }
        .lp-tab { padding: 10px 16px; border-radius: 8px 8px 0 0; border: none; background: transparent; color: ${C.textMuted}; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; border-bottom: 2px solid transparent; }
        .lp-tab.active { color: ${C.primary}; border-bottom-color: ${C.primary}; background: rgba(109,40,217,0.06); }
        .lp-tab:hover:not(.active) { color: ${C.text}; }
        @media (max-width: 1024px) { .lp-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
            <span style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryAlt})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Landing Page Generator</span>
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, margin: '4px 0 0' }}>Generate high-converting SaaS-quality landing pages with AI</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: apiStatus.isConfigured ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: apiStatus.isConfigured ? C.success : C.warning, border: `1px solid ${apiStatus.isConfigured ? C.success : C.warning}` }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span>
          {apiStatus.isConfigured ? 'AI Connected' : 'No API Key'}
        </div>
      </div>

      <div className="lp-grid" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 16, padding: 20, maxWidth: 1400, margin: '0 auto' }}>
        {/* Left Panel - Form */}
        <div>
          {/* Quick Templates */}
          <div className="lp-card">
            <h3 className="lp-section-title">⚡ Quick Templates</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_TEMPLATES.map(t => (
                <button key={t.id} type="button" onClick={() => applyTemplate(t)} className="lp-pill" title={`${t.industry} · ${t.audience}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="lp-card">
            <h3 className="lp-section-title">📋 Basic Info</h3>
            <Input label="Product Name" keyName="productName" value={form.productName} placeholder="e.g. AnalyticsPro" maxLength={60} C={C} updateForm={updateForm} />
            <Input label="Service Name" keyName="serviceName" value={form.serviceName} placeholder="e.g. SEO Consulting" maxLength={60} C={C} updateForm={updateForm} />
            <Input label="Business Name" keyName="businessName" value={form.businessName} placeholder="e.g. Acme Inc." maxLength={60} C={C} updateForm={updateForm} />
            <Input label="Website URL" keyName="websiteName" value={form.websiteName} placeholder="e.g. acme.com" maxLength={80} C={C} updateForm={updateForm} />
          </div>

          {/* Description */}
          <div className="lp-card">
            <h3 className="lp-section-title">📄 Description</h3>
            <Input label="Product Description" keyName="description" value={form.description} placeholder="Describe what you offer, key features, and value..." type="textarea" maxLength={1000} C={C} updateForm={updateForm} />
            <Input label="Target Audience" keyName="targetAudience" value={form.targetAudience} placeholder="e.g. Small business owners, marketers" C={C} updateForm={updateForm} />
            <Input label="Industry" keyName="industry" value={form.industry} placeholder="e.g. SaaS, E-commerce, Education" C={C} updateForm={updateForm} />
          </div>

          {/* Settings */}
          <div className="lp-card">
            <h3 className="lp-section-title">⚙️ Settings</h3>
            <div style={{ marginBottom: 10 }}>
              <label className="lp-label">Language</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {LANGUAGES.map(l => (
                  <button key={l.id} type="button" onClick={() => setLanguage(l.id)} className={`lp-pill ${language === l.id ? 'active' : ''}`}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="lp-label">CTA Button Text</label>
              <input type="text" className="lp-input" value={form.ctaText} onChange={e => updateForm('ctaText', e.target.value)} placeholder="Get Started" maxLength={30} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="lp-label">Tone of Voice</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TONES.map(t => (
                  <button key={t} type="button" onClick={() => updateForm('toneOfVoice', t)} className={`lp-pill ${form.toneOfVoice === t ? 'active' : ''}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="lp-label">Color</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {COLOR_PRESETS.map(color => (
                  <button key={color} type="button" onClick={() => setPrimaryColor(color)} style={{ width: 32, height: 32, borderRadius: 6, background: color, border: primaryColor === color ? `2px solid white` : `1px solid ${C.border}`, cursor: 'pointer', boxShadow: primaryColor === color ? `0 0 0 2px ${C.primary}` : 'none' }} />
                ))}
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${C.border}`, padding: 0, cursor: 'pointer', background: 'transparent' }} />
              </div>
            </div>
            <Input label="Competitor URLs (optional)" keyName="competitorUrls" value={form.competitorUrls} placeholder="e.g. competitor.com, rival.io" C={C} updateForm={updateForm} />
          </div>

          {/* Advanced */}
          <div className="lp-card">
            <h3 className="lp-section-title">🚀 Advanced</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={conversionMode} onChange={e => setConversionMode(e.target.checked)} style={{ accentColor: C.primary }} />
              <div><span style={{ fontWeight: 600, fontSize: 13 }}>Conversion Optimization Mode</span><br /><span style={{ fontSize: 11, color: C.textMuted }}>AIDA + PAS + StoryBrand frameworks for max conversions</span></div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={monetizationFeatures} onChange={e => setMonetizationFeatures(e.target.checked)} style={{ accentColor: C.primary }} />
              <div><span style={{ fontWeight: 600, fontSize: 13 }}>Monetization Features</span><br /><span style={{ fontSize: 11, color: C.textMuted }}>Email capture, lead magnet, pricing table, affiliates</span></div>
            </label>
          </div>

          {/* Images */}
          <div className="lp-card">
            <h3 className="lp-section-title">🖼️ Images (up to 5)</h3>
            <div onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              style={{ border: `2px dashed ${isDragging ? C.primary : C.border}`, borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer', background: isDragging ? 'rgba(109,40,217,0.08)' : C.cardAlt, transition: 'all 0.15s' }}>
              <div style={{ fontSize: 24 }}>📁</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Drop images or click to browse</div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }} style={{ display: 'none' }} />
            </div>
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {images.map(img => (
                  <div key={img.id} style={{ position: 'relative', width: 64, height: 64, borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                    <img src={img.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))} style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="lp-card">
            <h3 className="lp-section-title">📞 Contact</h3>
            {['phone', 'whatsapp', 'email', 'location'].map(k => (
              <div key={k} style={{ marginBottom: 8 }}>
                <label className="lp-label">{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                <input type={k === 'email' ? 'email' : 'text'} className="lp-input" value={contact[k] || ''} onChange={e => setContact(c => ({ ...c, [k]: e.target.value }))} placeholder={k === 'email' ? 'hello@example.com' : k === 'location' ? 'City, Country' : '+1 234 567 890'} />
              </div>
            ))}
          </div>

          {/* Social */}
          <div className="lp-card">
            <h3 className="lp-section-title">🔗 Social Media</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {SOCIAL_PLATFORMS.map(p => (
                <button key={p.id} type="button" onClick={() => { const next = { ...socialEnabled, [p.id]: !socialEnabled[p.id] }; if (!next[p.id]) { const s = { ...socialLinks }; delete s[p.id]; setSocialLinks(s); } setSocialEnabled(next); }} className={`lp-pill toggle ${socialEnabled[p.id] ? 'on' : ''}`}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
            {SOCIAL_PLATFORMS.filter(p => socialEnabled[p.id]).map(p => (
              <div key={p.id} style={{ marginBottom: 6 }}>
                <label className="lp-label">{p.icon} {p.label} URL</label>
                <input type="url" className="lp-input" value={socialLinks[p.id] || ''} onChange={e => setSocialLinks(s => ({ ...s, [p.id]: e.target.value }))} placeholder={`https://${p.id === 'twitter' ? 'x' : p.id}.com/...`} />
              </div>
            ))}
          </div>

          {error && <div style={{ padding: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid #ef4444', borderRadius: 8, color: '#ef4444', fontSize: 13, marginBottom: 10 }}>⚠️ {error}</div>}
          {success && <div style={{ padding: 10, background: 'rgba(16,185,129,0.12)', border: `1px solid ${C.success}`, borderRadius: 8, color: C.success, fontSize: 13, marginBottom: 10 }}>{success}</div>}

          <button type="button" onClick={handleGenerate} disabled={!canGenerate} className="lp-generate-btn">
            {generating ? '⏳ Generating...' : '✨ Generate Landing Page'}
          </button>

          {generating && (
            <div className="lp-card" style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div className="saas-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{step}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: C.textMuted, fontFamily: 'monospace' }}>{progress}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: C.border, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryAlt})`, borderRadius: 2, transition: 'width 0.4s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Preview & Results */}
        <div>
          {result ? (
            <>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${C.border}`, marginBottom: 12, overflowX: 'auto', flexWrap: 'nowrap' }}>
                {EXPORT_TABS.map(tab => (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`lp-tab ${activeTab === tab.id ? 'active' : ''}`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'preview' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>🖥️ Live Preview</span>
                    <div style={{ display: 'flex', gap: 4, background: C.card, padding: 3, borderRadius: 8, border: `1px solid ${C.border}` }}>
                      <button type="button" onClick={() => setPreviewMode('mobile')} className={`lp-pill ${previewMode === 'mobile' ? 'active' : ''}`} style={{ padding: '5px 10px', fontSize: 11, border: 'none' }}>📱 Mobile</button>
                      <button type="button" onClick={() => setPreviewMode('desktop')} className={`lp-pill ${previewMode === 'desktop' ? 'active' : ''}`} style={{ padding: '5px 10px', fontSize: 11, border: 'none' }}>🖥️ Desktop</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, overflow: 'auto' }}>
                    <div ref={previewRef} style={{ width: previewMode === 'mobile' ? 360 : '100%', height: previewMode === 'mobile' ? 640 : 600, borderRadius: previewMode === 'mobile' ? 24 : 10, border: `2px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', background: C.card }}>
                      <iframe srcDoc={result.html} title="Landing page preview" style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} sandbox="allow-scripts allow-same-origin" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button onClick={() => downloadFile(result.html, 'landing-page.html', 'text/html')} className="lp-export-btn">📄 Download HTML</button>
                    <button onClick={() => downloadFile(JSON.stringify(result.copy, null, 2), 'landing-page-copy.txt', 'text/plain')} className="lp-export-btn">📝 Download Copy</button>
                    <button onClick={() => { copyText(result.html); }} className="lp-export-btn">📋 Copy HTML</button>
                  </div>
                </>
              )}

              {activeTab === 'copy' && result.copy && (
                <div>
                  {['headline', 'subheadline', 'heroDescription', 'benefits', 'features', 'howItWorks', 'testimonials', 'faq', 'ctaSection'].filter(k => result.copy[k]).map(k => {
                    const val = result.copy[k];
                    let display = typeof val === 'string' ? val : Array.isArray(val) ? val.map((v, i) => typeof v === 'object' ? `${v.icon || ''} ${v.title || ''}: ${v.description || v.quote || ''}` : `${i+1}. ${v}`).join('\n') : '';
                    if (k === 'ctaSection' && typeof val === 'object') display = `${val.headline}\n${val.subheadline}\n[${val.buttonText}]`;
                    return (
                      <div key={k} className="lp-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <button onClick={(e) => copyText(display, e.currentTarget)} className="lp-export-btn" style={{ padding: '4px 10px', fontSize: 11 }}>Copy</button>
                        </div>
                        <pre style={{ fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{display}</pre>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'html' && <CodeBlock content={result.html} label="HTML" lang="html" C={C} />}
              {activeTab === 'react' && <CodeBlock content={result.react} label="React Component" lang="react" C={C} />}
              {activeTab === 'nextjs' && <CodeBlock content={result.nextjs} label="Next.js Component" lang="nextjs" C={C} />}
              {activeTab === 'tailwind' && <CodeBlock content={result.tailwind} label="TailwindCSS" lang="tailwind" C={C} />}

              {activeTab === 'seo' && result.seo && (
                <div className="lp-card">
                  <h3 className="lp-section-title" style={{ marginBottom: 12 }}>🔍 SEO Preview</h3>
                  {Object.entries(result.seo).filter(([, v]) => v).map(([key, val]) => (
                    <div key={key} style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 6, background: C.cardAlt, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div style={{ fontSize: 13, color: C.text }}>{val}</div>
                    </div>
                  ))}
                  <button onClick={() => copyText(JSON.stringify(result.seo, null, 2))} className="lp-export-btn" style={{ marginTop: 8 }}>📋 Copy All SEO</button>
                </div>
              )}

              {activeTab === 'images' && result.imagePrompts && result.imagePrompts.length > 0 && (
                <div>
                  {result.imagePrompts.map((img, i) => (
                    <div key={i} className="lp-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase' }}>{img.type} Image Prompt</span>
                        <button onClick={(e) => copyText(img.prompt, e.currentTarget)} className="lp-export-btn" style={{ padding: '4px 10px', fontSize: 11 }}>Copy</button>
                      </div>
                      <pre style={{ fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{img.prompt}</pre>
                    </div>
                  ))}
                  {result.imagePrompts.length > 1 && (
                    <button onClick={() => copyText(result.imagePrompts.map(i => i.prompt).join('\n\n---\n\n'))} className="lp-export-btn" style={{ marginTop: 4 }}>📋 Copy All Prompts</button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 12, padding: 60, textAlign: 'center', color: C.textMuted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎨</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>Ready to create your landing page</div>
              <div style={{ fontSize: 13 }}>Fill in your details and click <strong style={{ color: C.primary }}>Generate</strong></div>
              <div style={{ marginTop: 16, display: 'flex', gap: 16, justifyContent: 'center', fontSize: 11, color: C.textMuted, flexWrap: 'wrap' }}>
                <span>📝 7 output formats</span>
                <span>🔍 SEO optimized</span>
                <span>🖼️ AI image prompts</span>
                <span>🚀 CRO mode</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

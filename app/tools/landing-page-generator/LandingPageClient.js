'use client';

import { useState, useMemo, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';

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

const COOLDOWN_MS = 5 * 60 * 60 * 1000;
const STORAGE_KEY = 'lp_last_used';
const MAX_IMAGES = 5;

const COLOR_PRESETS = [
  '#6D28D9', '#4F46E5', '#10B981', '#F59E0B',
  '#EF4444', '#3B82F6', '#EC4899', '#06B6D4'
];

const C = {
  bg: '#0F0F0F',
  card: '#1A1A2E',
  cardAlt: '#16213E',
  border: '#2D2D4E',
  text: '#F1F0FF',
  textMuted: '#8B8AA8',
  primary: '#6D28D9',
  primaryAlt: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
};

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function maskKey(key) {
  if (!key || typeof key !== 'string' || key.length < 8) return '';
  if (key.length <= 14) return key.slice(0, 4) + '••••••' + key.slice(-4);
  return key.slice(0, 7) + '•'.repeat(Math.min(20, key.length - 12)) + key.slice(-4);
}

function formatCooldown(remainingMs) {
  if (remainingMs <= 0) return null;
  const h = Math.floor(remainingMs / (60 * 60 * 1000));
  const m = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function LandingPageClient() {
  const [form, setForm] = useState('');
  const [language, setLanguage] = useState('en');
  const [primaryColor, setPrimaryColor] = useState(C.primary);
  const [ctaText, setCtaText] = useState('Get Started');
  const [images, setImages] = useState([]);
  const [socialEnabled, setSocialEnabled] = useState({});
  const [contact, setContact] = useState({ phone: '', whatsapp: '', email: '', location: '' });
  const [socialLinks, setSocialLinks] = useState({});
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [generating, setGenerating] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const last = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    return last ? last + COOLDOWN_MS : 0;
  });
  const [previewMode, setPreviewMode] = useState('mobile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiStatus, setApiStatus] = useState({ isConfigured: false, maskedKey: '', source: null });
  const [sessionId, setSessionId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  const now = useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => {};
      const id = setInterval(callback, 60000);
      return () => clearInterval(id);
    },
    () => Date.now(),
    () => 0
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sid = localStorage.getItem('lp_session_id');
        if (!sid) {
          try {
            const r = await fetch('/api/landing-page/session', { credentials: 'include' });
            if (r.ok) {
              const d = await r.json();
              if (d?.sessionId) {
                localStorage.setItem('lp_session_id', d.sessionId);
                if (!cancelled) setSessionId(d.sessionId);
              }
            }
          } catch {}
        } else {
          if (!cancelled) setSessionId(sid);
        }
      } catch {}
      try {
        const r = await fetch('/api/landing-page/key-status');
        if (r.ok) {
          const d = await r.json();
          if (!cancelled) setApiStatus(d);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const cooldownRemaining = Math.max(0, cooldownUntil - now);
  const isOnCooldown = cooldownRemaining > 0;
  const canGenerate = !isOnCooldown && !generating && form.trim().length > 0;

  const handleFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    const toAdd = files.slice(0, remaining);
    const newImages = await Promise.all(
      toAdd.map(async (file) => ({
        id: Math.random().toString(36).slice(2, 10),
        name: file.name,
        size: file.size,
        dataUrl: await readFileAsDataURL(file)
      }))
    );
    setImages(prev => [...prev, ...newImages].slice(0, MAX_IMAGES));
    setError('');
  }, [images.length]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  }, [handleFiles]);

  const removeImage = useCallback((id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const toggleSocial = useCallback((id) => {
    setSocialEnabled(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) {
        setSocialLinks(s => { const c = { ...s }; delete c[id]; return c; });
      }
      return next;
    });
  }, []);

  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    setError('');
    setSuccess('');

    const enabledSocials = {};
    SOCIAL_PLATFORMS.forEach(p => {
      if (socialEnabled[p.id] && socialLinks[p.id]?.trim()) {
        enabledSocials[p.id] = socialLinks[p.id].trim();
      }
    });

    const cleanedContact = {};
    Object.entries(contact).forEach(([k, v]) => {
      if (v && v.trim()) cleanedContact[k] = v.trim();
    });

    try {
      const res = await fetch('/api/landing-page/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: form || 'My Product',
          description: '',
          language,
          ctaText: ctaText || 'Get Started',
          primaryColor,
          contactInfo: cleanedContact,
          socialLinks: enabledSocials,
          imageUrls: images.map(img => img.dataUrl)
        })
      });

      const data = await res.json();

      if (res.status === 429) {
        const retryHrs = Math.ceil((data.retry_after_seconds || 18000) / 3600);
        setError(`Rate limit reached. Try again in ~${retryHrs}h.`);
        const newUntil = Date.now() + (data.retry_after_seconds || 18000) * 1000;
        setCooldownUntil(newUntil);
        localStorage.setItem(STORAGE_KEY, String(newUntil));
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.message || 'Generation failed. Please try again.');
        return;
      }

      setGeneratedHtml(data.html);
      const newUntil = Date.now() + COOLDOWN_MS;
      setCooldownUntil(newUntil);
      localStorage.setItem(STORAGE_KEY, String(newUntil));
      setSuccess('✓ Landing page generated successfully');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  function buildShareLink() {
    if (typeof window === 'undefined' || !generatedHtml) return '';
    try {
      const encoded = btoa(unescape(encodeURIComponent(generatedHtml)));
      const url = new URL(window.location.href);
      url.hash = `html=${encoded}`;
      return url.toString();
    } catch {
      return window.location.href;
    }
  }

  async function copyShareLink() {
    const link = buildShareLink();
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setSuccess('✓ Share link copied to clipboard');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to copy link');
    }
  }

  async function exportPng() {
    if (!previewRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#0F0F0F',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `landing-page-${language}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setSuccess('✓ PNG exported');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('PNG export failed: ' + (err?.message || 'unknown error'));
    }
  }

  function exportHtmlFile() {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `landing-page-${language}-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
    setSuccess('✓ HTML file downloaded');
    setTimeout(() => setSuccess(''), 3000);
  }

  const previewFrameStyle = previewMode === 'mobile'
    ? { width: 360, height: 720, borderRadius: 32 }
    : { width: '100%', height: 720, borderRadius: 12 };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, direction: 'ltr' }}>
      <style jsx>{`
        .lp-input {
          width: 100%;
          padding: 10px 14px;
          background: ${C.cardAlt};
          border: 1px solid ${C.border};
          border-radius: 8px;
          color: ${C.text};
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .lp-input:focus {
          outline: none;
          border-color: ${C.primary};
        }
        .lp-input::placeholder { color: ${C.textMuted}; }
        .lp-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: ${C.textMuted};
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .lp-card {
          background: ${C.card};
          border: 1px solid ${C.border};
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 14px;
        }
        .lp-section-title {
          font-size: 13px;
          font-weight: 700;
          color: ${C.textMuted};
          margin: 0 0 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .lp-pill {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid ${C.border};
          background: ${C.cardAlt};
          color: ${C.text};
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .lp-pill:hover { border-color: ${C.primary}; }
        .lp-pill.active {
          background: linear-gradient(135deg, ${C.primary}, ${C.primaryAlt});
          border-color: ${C.primary};
          color: white;
          font-weight: 600;
        }
        .lp-pill.toggle.on {
          background: linear-gradient(135deg, ${C.primary}, ${C.primaryAlt});
          border-color: ${C.primary};
          color: white;
        }
        .lp-generate-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, ${C.primary}, ${C.primaryAlt});
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(109, 40, 217, 0.3);
        }
        .lp-generate-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(109, 40, 217, 0.5);
        }
        .lp-generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .lp-dropzone {
          border: 2px dashed ${C.border};
          border-radius: 10px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s;
          background: ${C.cardAlt};
        }
        .lp-dropzone:hover, .lp-dropzone.dragging {
          border-color: ${C.primary};
          background: rgba(109, 40, 217, 0.08);
        }
        .lp-export-bar {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }
        .lp-export-btn {
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid ${C.border};
          background: ${C.cardAlt};
          color: ${C.text};
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .lp-export-btn:hover { border-color: ${C.primary}; }
        .lp-export-btn.primary {
          background: linear-gradient(135deg, ${C.primary}, ${C.primaryAlt});
          border-color: ${C.primary};
        }
        .lp-cooldown {
          padding: 14px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lp-thumbnail {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid ${C.border};
        }
        .lp-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .lp-thumb-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(0,0,0,0.7);
          border: none;
          color: white;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 1024px) {
          .lp-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ padding: '24px 28px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: C.text }}>
            <span style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryAlt})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Landing Page Generator
            </span>
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, margin: '4px 0 0 0' }}>
            Create professional landing pages in 6 languages with AI
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: apiStatus.isConfigured ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: apiStatus.isConfigured ? C.success : C.warning, border: `1px solid ${apiStatus.isConfigured ? C.success : C.warning}` }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span>
          {apiStatus.isConfigured ? 'AI Connected' : 'AI Not Configured'}
        </div>
      </div>

      <div className="lp-grid" style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 20, padding: 24, maxWidth: 1400, margin: '0 auto' }}>
        <div>
          {isOnCooldown && (
            <div className="lp-cooldown">
              <span style={{ fontSize: 22 }}>⏱️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.warning }}>Cooldown Active</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>
                  Next generation available in {formatCooldown(cooldownRemaining)}
                </div>
              </div>
            </div>
          )}

          <div className="lp-card">
            <h3 className="lp-section-title">🌐 Language</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  className={`lp-pill ${language === lang.id ? 'active' : ''}`}
                  style={{ justifyContent: 'center' }}
                >
                  <span style={{ fontSize: 16 }}>{lang.flag}</span>
                  <span style={{ fontSize: 12 }}>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lp-card">
            <h3 className="lp-section-title">🖼️ Product Images (up to {MAX_IMAGES})</h3>
            {images.length < MAX_IMAGES && (
              <div
                className={`lp-dropzone ${isDragging ? 'dragging' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Drag & drop images here</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>PNG, JPG, WEBP — click to browse</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>
            )}
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {images.map(img => (
                  <div key={img.id} className="lp-thumbnail">
                    <img src={img.dataUrl} alt={img.name} />
                    <button type="button" onClick={() => removeImage(img.id)} className="lp-thumb-remove" aria-label="Remove">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>{images.length} / {MAX_IMAGES} uploaded</div>
          </div>

          <div className="lp-card">
            <h3 className="lp-section-title">📝 Product Information</h3>
            <div style={{ marginBottom: 12 }}>
              <label className="lp-label">Product Name *</label>
              <input
                type="text"
                className="lp-input"
                value={form}
                onChange={e => setForm(e.target.value)}
                placeholder="e.g. FitnessTracker Pro"
                maxLength={80}
              />
            </div>
            <div>
              <label className="lp-label">CTA Button Text</label>
              <input
                type="text"
                className="lp-input"
                value={ctaText}
                onChange={e => setCtaText(e.target.value)}
                placeholder="e.g. Get Started, Buy Now, Try Free"
                maxLength={30}
              />
            </div>
          </div>

          <div className="lp-card">
            <h3 className="lp-section-title">📞 Contact Information</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <label className="lp-label">Phone</label>
                <input type="tel" className="lp-input" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="lp-label">WhatsApp</label>
                <input type="tel" className="lp-input" value={contact.whatsapp} onChange={e => setContact(c => ({ ...c, whatsapp: e.target.value }))} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="lp-label">Email</label>
                <input type="email" className="lp-input" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} placeholder="hello@example.com" />
              </div>
              <div>
                <label className="lp-label">Location</label>
                <input type="text" className="lp-input" value={contact.location} onChange={e => setContact(c => ({ ...c, location: e.target.value }))} placeholder="San Francisco, CA" />
              </div>
            </div>
          </div>

          <div className="lp-card">
            <h3 className="lp-section-title">🔗 Social Media</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              {SOCIAL_PLATFORMS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleSocial(p.id)}
                  className={`lp-pill toggle ${socialEnabled[p.id] ? 'on' : ''}`}
                  style={{ justifyContent: 'center' }}
                >
                  <span style={{ fontSize: 14 }}>{p.icon}</span>
                  <span style={{ fontSize: 11 }}>{p.label}</span>
                </button>
              ))}
            </div>
            {SOCIAL_PLATFORMS.filter(p => socialEnabled[p.id]).map(p => (
              <div key={p.id} style={{ marginTop: 10 }}>
                <label className="lp-label">{p.icon} {p.label} URL</label>
                <input
                  type="url"
                  className="lp-input"
                  value={socialLinks[p.id] || ''}
                  onChange={e => setSocialLinks(s => ({ ...s, [p.id]: e.target.value }))}
                  placeholder={`https://${p.id === 'twitter' ? 'x' : p.id}.com/yourprofile`}
                />
              </div>
            ))}
          </div>

          <div className="lp-card">
            <h3 className="lp-section-title">🎨 Primary Color</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {COLOR_PRESETS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPrimaryColor(color)}
                  aria-label={`Color ${color}`}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: color, border: primaryColor === color ? `3px solid ${C.text}` : `1px solid ${C.border}`,
                    cursor: 'pointer', transition: 'transform 0.15s',
                    boxShadow: primaryColor === color ? `0 0 0 2px ${C.primary}` : 'none'
                  }}
                />
              ))}
            </div>
            <input
              type="color"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
              className="lp-input"
              style={{ height: 44, padding: 4, cursor: 'pointer' }}
            />
          </div>

          {error && (
            <div style={{ padding: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid #ef4444', borderRadius: 8, color: '#ef4444', fontSize: 13, marginBottom: 12 }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ padding: 12, background: 'rgba(16,185,129,0.12)', border: `1px solid ${C.success}`, borderRadius: 8, color: C.success, fontSize: 13, marginBottom: 12 }}>
              {success}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="lp-generate-btn"
          >
            {generating ? '⏳ Generating...' : '✨ Generate Landing Page'}
          </button>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: C.text }}>Live Preview</h2>
            <div style={{ display: 'flex', gap: 6, background: C.card, padding: 4, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <button type="button" onClick={() => setPreviewMode('mobile')} className={`lp-pill ${previewMode === 'mobile' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: 12, border: 'none' }}>📱 Mobile</button>
              <button type="button" onClick={() => setPreviewMode('desktop')} className={`lp-pill ${previewMode === 'desktop' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: 12, border: 'none' }}>🖥️ Desktop</button>
            </div>
          </div>

          {generatedHtml ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, overflow: 'auto' }}>
                <div
                  ref={previewRef}
                  style={{
                    ...previewFrameStyle,
                    background: C.card,
                    border: `2px solid ${C.border}`,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                  }}
                >
                  <iframe
                    srcDoc={generatedHtml}
                    title="Landing page preview"
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>

              <div className="lp-export-bar">
                <button type="button" onClick={copyShareLink} className="lp-export-btn primary">
                  🔗 Share Link
                </button>
                <button type="button" onClick={exportPng} className="lp-export-btn">
                  📷 Export PNG
                </button>
                <button type="button" onClick={exportHtmlFile} className="lp-export-btn">
                  📄 Download HTML
                </button>
              </div>
            </>
          ) : (
            <div style={{
              background: C.card, border: `1px dashed ${C.border}`, borderRadius: 12,
              padding: 60, textAlign: 'center', color: C.textMuted
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎨</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>No preview yet</div>
              <div style={{ fontSize: 13 }}>Fill the form and click <strong style={{ color: C.primary }}>Generate</strong> to see your landing page</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

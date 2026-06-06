'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { generateLandingPage, getDefaultFormData, TEMPLATES } from '@/lib/landing-page-templates';

const LANGUAGES = [
  { id: 'ar', label: 'العربية', flag: '🇸🇦' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const COOLDOWN_MS = 5 * 60 * 60 * 1000;
const STORAGE_KEY = 'lp_last_used';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--bg-glass-border)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  marginBottom: 6,
  fontWeight: 500,
};

export default function LandingPageClient() {
  const [form, setForm] = useState(getDefaultFormData());
  const [previewMode, setPreviewMode] = useState('desktop');
  const [aiLoading, setAiLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [now, setNow] = useState(() => Date.now());
  const [serverCooldown, setServerCooldown] = useState(0);
  const [pngLoading, setPngLoading] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#form=/, '');
    if (hash) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(hash)));
        if (decoded && typeof decoded === 'object') {
          setForm(prev => ({ ...prev, ...decoded }));
          setMsg({ text: '✅ Loaded from shareable link', type: 'success' });
          setTimeout(() => setMsg({ text: '', type: '' }), 3000);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (aiLoading) return;
    const localRemaining = getLocalCooldownRemaining();
    const totalRemaining = Math.max(localRemaining, serverCooldown);
    if (totalRemaining <= 0) return;
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [aiLoading, serverCooldown]);

  function getLocalCooldownRemaining() {
    try {
      const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
      if (!last) return 0;
      const diff = Date.now() - last;
      return diff < COOLDOWN_MS ? COOLDOWN_MS - diff : 0;
    } catch { return 0; }
  }

  const localRemaining = Math.max(0, COOLDOWN_MS - (now - Number((typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 0)));
  const cooldownRemaining = Math.max(localRemaining, serverCooldown);
  const isOnCooldown = cooldownRemaining > 0;

  function formatCooldown(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    if (h > 0) return `${h} ساعة ${m} دقيقة`;
    if (m > 0) return `${m} دقيقة`;
    return `${totalSec} ثانية`;
  }

  const generatedHTML = useMemo(() => generateLandingPage(form), [form]);

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    if (type !== 'error') {
      setTimeout(() => setMsg({ text: '', type: '' }), 3500);
    }
  }

  async function aiEnhance() {
    if (aiLoading) return;
    if (isOnCooldown) {
      showMsg(`⏳ الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً. المحاولة التالية بعد ${formatCooldown(cooldownRemaining)}`, 'error');
      return;
    }
    setAiLoading(true);
    showMsg('✨ AI is enhancing your texts...', 'info');

    const customPrompt = `You are an expert landing page copywriter specializing in conversion optimization.

Given the following product info, improve the headline and description to be more professional, compelling, and conversion-focused. Keep the same meaning but make it more persuasive.

Product name: ${form.name}
Current headline: ${form.headline}
Current description: ${form.description}

Return your response in EXACTLY this plain text format (no markdown, no code blocks, no quotes):
HEADLINE: [improved headline, max 80 characters]
DESCRIPTION: [improved description, 1-2 sentences, max 200 characters]`;

    try {
      const res = await fetch('/api/landing-page/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt,
          language: form.language || 'en',
          template_type: form.template || 'default'
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        const retryMs = (data.retry_after_seconds || 18000) * 1000;
        setServerCooldown(retryMs);
        showMsg('⏳ الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً', 'error');
        return;
      }

      const data = await res.json();
      if (!data.success && !data.text) {
        showMsg(data.message || 'الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً', 'error');
        return;
      }

      const text = (data.text || data.html || '').replace(/<[^>]*>/g, '');
      const headlineMatch = text.match(/HEADLINE:\s*([^\n]+?)(?:\s*DESCRIPTION:|$)/i);
      const descMatch = text.match(/DESCRIPTION:\s*([\s\S]+?)$/i);

      if (headlineMatch) updateField('headline', headlineMatch[1].trim().slice(0, 120));
      if (descMatch) updateField('description', descMatch[1].trim().slice(0, 300));

      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        setNow(Date.now());
        setServerCooldown(0);
      } catch {}
      showMsg('✅ Texts improved by AI!', 'success');
    } catch (err) {
      showMsg('الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setAiLoading(false);
    }
  }

  function copyHTML() {
    navigator.clipboard.writeText(generatedHTML).then(
      () => showMsg('✅ HTML copied to clipboard!', 'success'),
      () => showMsg('❌ Failed to copy', 'error')
    );
  }

  function downloadHTML() {
    const blob = new Blob([generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (form.name || 'landing-page').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    a.href = url;
    a.download = `${safeName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMsg('✅ HTML file downloaded!', 'success');
  }

  async function downloadPNG() {
    if (!iframeRef.current) {
      showMsg('❌ Preview not ready', 'error');
      return;
    }
    setPngLoading(true);
    showMsg('🖼️ Generating PNG...', 'info');
    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc || !iframeDoc.body) {
        showMsg('❌ Cannot access preview', 'error');
        return;
      }
      const rect = iframe.getBoundingClientRect();
      const width = Math.max(800, Math.round(rect.width));
      const height = Math.max(600, Math.round(iframeDoc.documentElement.scrollHeight || rect.height));
      const clonedHTML = iframeDoc.documentElement.outerHTML;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${clonedHTML.replace(/<script[\s\S]*?<\/script>/gi, '')}</foreignObject></svg>`;
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) { showMsg('❌ Failed to create PNG', 'error'); return; }
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeName = (form.name || 'landing-page').replace(/[^a-z0-9]/gi, '-').toLowerCase();
        a.href = pngUrl;
        a.download = `${safeName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
        showMsg('✅ PNG downloaded!', 'success');
      }, 'image/png');
    } catch (err) {
      showMsg('❌ PNG export failed: ' + err.message, 'error');
    } finally {
      setPngLoading(false);
    }
  }

  function generateShareLink() {
    try {
      const payload = btoa(encodeURIComponent(JSON.stringify(form)));
      const url = `${window.location.origin}${window.location.pathname}#form=${payload}`;
      navigator.clipboard.writeText(url).then(
        () => { setShowShareLink(true); showMsg('✅ Shareable link copied to clipboard!', 'success'); },
        () => showMsg('❌ Failed to copy link', 'error')
      );
    } catch {
      showMsg('❌ Failed to generate link', 'error');
    }
  }

  const iframeStyle = previewMode === 'mobile'
    ? { width: 375, height: 600, maxWidth: '100%' }
    : { width: '100%', height: 620 };

  const msgColor = msg.type === 'error' ? '#ef4444' : msg.type === 'success' ? '#10b981' : 'var(--neon-purple)';

  return (
    <section className="section tool-page">
      <div className="container">
        <div className="tool-page-header">
          <div className="tool-page-icon">🚀</div>
          <h1 className="tool-page-title">Landing Page Generator</h1>
          <p className="tool-page-desc">Create professional landing pages in seconds with AI-powered templates, live preview, and instant HTML export.</p>
        </div>

        {msg.text && (
          <div
            role="status"
            style={{
              padding: '12px 20px',
              background: 'var(--bg-tertiary)',
              border: `1px solid ${msgColor}`,
              borderRadius: 10,
              marginBottom: 20,
              textAlign: 'center',
              fontWeight: 600,
              color: msgColor,
            }}
          >
            {msg.text}
          </div>
        )}

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {/* LEFT COLUMN: Form */}
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <div className="tool-section">
              <h2>Step 1 — Choose Template</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateField('template', t.id)}
                    className={form.template === t.id ? 'btn btn-primary' : 'btn btn-outline'}
                    style={{ padding: '14px 6px', fontSize: '0.78rem', flexDirection: 'column', gap: 4, display: 'flex', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="tool-section">
              <h2>Step 2 — Fill Basic Info</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label>
                  <span style={labelStyle}>Product / Service Name *</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="e.g. MyAwesomeApp"
                    style={inputStyle}
                  />
                </label>

                <label>
                  <span style={labelStyle}>Main Headline</span>
                  <input
                    type="text"
                    value={form.headline}
                    onChange={e => updateField('headline', e.target.value)}
                    placeholder="e.g. The Smarter Way to Build Your Business"
                    style={inputStyle}
                  />
                </label>

                <label>
                  <span style={labelStyle}>Short Description</span>
                  <textarea
                    value={form.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder="e.g. A powerful platform that helps you grow faster."
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    <span style={labelStyle}>CTA Button Text</span>
                    <input
                      type="text"
                      value={form.ctaText}
                      onChange={e => updateField('ctaText', e.target.value)}
                      placeholder="Get Started"
                      style={inputStyle}
                    />
                  </label>
                  <label>
                    <span style={labelStyle}>CTA Button URL</span>
                    <input
                      type="url"
                      value={form.ctaUrl}
                      onChange={e => updateField('ctaUrl', e.target.value)}
                      placeholder="https://..."
                      style={inputStyle}
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
                  <label>
                    <span style={labelStyle}>Primary Color</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="color"
                        value={form.color}
                        onChange={e => updateField('color', e.target.value)}
                        style={{ width: 50, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
                        aria-label="Pick color"
                      />
                      <input
                        type="text"
                        value={form.color}
                        onChange={e => updateField('color', e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                    </div>
                  </label>
                  <label>
                    <span style={labelStyle}>Language ({LANGUAGES.length})</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                      {LANGUAGES.map(l => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => updateField('language', l.id)}
                          className={form.language === l.id ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                          style={{ padding: '8px 4px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexDirection: 'column', minHeight: 50 }}
                          title={l.label}
                        >
                          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{l.flag}</span>
                          <span style={{ fontSize: '0.7rem' }}>{l.label}</span>
                        </button>
                      ))}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="tool-section">
              <h2>Step 3 — AI Enhancement</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginBottom: 12, lineHeight: 1.6 }}>
                Let AI rewrite your headline and description to be more professional, compelling, and conversion-focused. Updates the form fields automatically.
              </p>
              <button
                type="button"
                onClick={aiEnhance}
                disabled={aiLoading || isOnCooldown}
                className="btn btn-primary"
                data-tool-action
                style={{ width: '100%' }}
              >
                {aiLoading ? '⏳ Enhancing with AI...' : isOnCooldown ? '⏳ الخدمة غير متاحة حالياً' : '✨ Improve texts with AI'}
              </button>
              {isOnCooldown && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--bg-glass-border)', borderRadius: 8, textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                  ⏱️ المحاولة التالية بعد <strong style={{ color: 'var(--text-primary)' }}>{formatCooldown(cooldownRemaining)}</strong>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Live Preview */}
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <div className="tool-section" style={{ position: 'sticky', top: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ margin: 0 }}>Live Preview</h2>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    className={previewMode === 'desktop' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                    aria-pressed={previewMode === 'desktop'}
                  >
                    🖥️ Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    className={previewMode === 'mobile' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                    aria-pressed={previewMode === 'mobile'}
                  >
                    📱 Mobile
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                <iframe
                  ref={iframeRef}
                  srcDoc={generatedHTML}
                  style={{ ...iframeStyle, border: '1px solid var(--bg-glass-border)', borderRadius: 8, background: '#fff' }}
                  title="Landing Page Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="tool-section" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={copyHTML}
            className="btn btn-primary btn-lg"
            data-tool-action
            style={{ minWidth: 180 }}
          >
            📋 Copy HTML
          </button>
          <button
            type="button"
            onClick={downloadHTML}
            className="btn btn-secondary btn-lg"
            data-tool-action
            style={{ minWidth: 180 }}
          >
            ⬇️ Download HTML
          </button>
          <button
            type="button"
            onClick={downloadPNG}
            disabled={pngLoading}
            className="btn btn-secondary btn-lg"
            data-tool-action
            style={{ minWidth: 180 }}
          >
            {pngLoading ? '⏳ Generating...' : '🖼️ Download PNG'}
          </button>
          <button
            type="button"
            onClick={generateShareLink}
            className="btn btn-secondary btn-lg"
            data-tool-action
            style={{ minWidth: 180 }}
          >
            🔗 Share Link
          </button>
        </div>
      </div>
    </section>
  );
}

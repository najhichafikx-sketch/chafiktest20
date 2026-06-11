'use client';
import { useState, useRef, useCallback } from 'react';

const MAX_DIM = 2000;

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

export default function PngToWebp() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [webpUrl, setWebpUrl] = useState(null);
  const [webpSize, setWebpSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [converted, setConverted] = useState(false);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFile = useCallback((f) => {
    setError('');
    setWebpUrl(null);
    setConverted(false);
    if (!f || !f.type.match(/^image\//)) {
      setError('Please select a valid image file (PNG, JPG, BMP, etc.)');
      return;
    }
    setFile(f);
    setOriginalSize(f.size);
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleConvert = useCallback(() => {
    if (!originalUrl || !file) return;
    setConverting(true);
    setError('');
    setConverted(false);
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (Math.max(w, h) > MAX_DIM) {
        const scale = MAX_DIM / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setWebpUrl(url);
          setWebpSize(blob.size);
          setConverted(true);
        } else {
          setError('Conversion failed. Try a different image or quality setting.');
        }
        setConverting(false);
      }, 'image/webp', quality / 100);
    };
    img.onerror = () => {
      setError('Failed to load image. The file may be corrupted.');
      setConverting(false);
    };
    img.src = originalUrl;
  }, [originalUrl, file, quality]);

  const handleDownload = useCallback(() => {
    if (!webpUrl) return;
    const name = file ? file.name.replace(/\.[^.]+$/, '') + '.webp' : 'converted.webp';
    const a = document.createElement('a');
    a.href = webpUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [webpUrl, file]);

  const savings = originalSize && webpSize
    ? Math.round((1 - webpSize / originalSize) * 100)
    : 0;

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="section-header">
          <span className="section-badge">🖼️ Image Tool</span>
          <h1 className="section-title">PNG to WebP Converter</h1>
          <p className="section-subtitle">Convert PNG, JPG, BMP and other images to WebP format. Reduce image size by up to 80% without visible quality loss — perfect for blog articles and web performance.</p>
        </div>

        {error && (
          <div className="glass-card" style={{ padding: '12px 16px', marginBottom: 16, borderLeft: '3px solid #ef4444', fontSize: '0.85rem', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div className="glass-card" style={{ padding: 24 }}>
          <div
            className="upload-zone"
            style={{
              border: dragOver ? '2px dashed #6c63ff' : '2px dashed var(--border-color)',
              borderRadius: 10, padding: 40, textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'rgba(108,99,255,0.05)' : 'transparent',
              transition: 'all 0.2s'
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
            {!originalUrl ? (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📂</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Drop an image here or click to browse
                </p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: 4 }}>
                  Supports PNG, JPG, BMP, GIF, WebP
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✅</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {file?.name} — {formatBytes(originalSize)}
                </p>
                <button className="btn btn-ghost" style={{ marginTop: 8, fontSize: '0.8rem' }}
                  onClick={(e) => { e.stopPropagation(); setOriginalUrl(null); setFile(null); setWebpUrl(null); setConverted(false); setError(''); }}>
                  Choose a different image
                </button>
              </>
            )}
          </div>

          {originalUrl && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>Original</p>
                  <div style={{ borderRadius: 7, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                    <img src={originalUrl} alt="Original" style={{ width: '100%', height: 200, objectFit: 'contain', display: 'block' }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {formatBytes(originalSize)}
                    {file?.type && <span> &middot; {file.type}</span>}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>
                    WebP
                    {converted && <span style={{ color: '#22c55e', marginLeft: 6 }}>✓ Converted</span>}
                  </p>
                  <div style={{ borderRadius: 7, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border-color)', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {webpUrl ? (
                      <img src={webpUrl} alt="WebP" style={{ width: '100%', height: 200, objectFit: 'contain', display: 'block' }} />
                    ) : (
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Preview will appear here</p>
                    )}
                  </div>
                  {webpUrl && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {formatBytes(webpSize)} &middot; image/webp
                    </p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Quality: <strong>{quality}%</strong>
                  </label>
                  <input type="range" min="10" max="100" value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#6c63ff' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    <span>Smaller</span>
                    <span>Better quality</span>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleConvert} disabled={converting}
                  style={{ minWidth: 140 }}>
                  {converting ? 'Converting...' : webpUrl ? 'Reconvert' : 'Convert to WebP'}
                </button>
              </div>

              {converted && (
                <div className="glass-card" style={{ marginTop: 20, padding: 16, border: '1px solid rgba(34,197,94,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#22c55e' }}>✓ Conversion complete</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {formatBytes(originalSize)} → {formatBytes(webpSize)}
                        {savings > 0 && <span style={{ color: '#22c55e', fontWeight: 600 }}> &middot; -{savings}%</span>}
                        {savings <= 0 && <span style={{ color: 'var(--text-tertiary)' }}> &middot; {savings === 0 ? 'Same size' : '+0%'}</span>}
                      </p>
                    </div>
                    <button className="btn btn-primary" onClick={handleDownload}>
                      ⬇ Download WebP
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ marginTop: 20, padding: 20 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>How to Use</h2>
          <ol style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 20 }}>
            <li><strong>Upload your image</strong> — Drag and drop or click to select a PNG, JPG, BMP, or any image file</li>
            <li><strong>Adjust quality</strong> — Use the slider to find the perfect balance between file size and quality (80% is recommended for most images)</li>
            <li><strong>Convert</strong> — Click &quot;Convert to WebP&quot; and the tool processes everything in your browser — no server upload needed</li>
            <li><strong>Download</strong> — Save the optimized WebP file and use it in your blog articles or website</li>
          </ol>
        </div>

        <div className="glass-card" style={{ marginTop: 16, padding: 20 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Why WebP?</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p>WebP is a modern image format that provides superior lossless and lossy compression for images on the web. Compared to PNG, WebP files are typically <strong>25-80% smaller</strong> while maintaining the same visual quality. This means:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Faster page load times for your blog articles</li>
              <li>Better Core Web Vitals scores (LCP)</li>
              <li>Less bandwidth usage for your visitors</li>
              <li>Improved SEO rankings from better performance</li>
            </ul>
          </div>
        </div>

        <div className="glass-card" style={{ marginTop: 16, padding: 20 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Frequently Asked Questions</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p><strong>Is this tool free?</strong><br />Yes, 100% free. Everything runs in your browser — no files are uploaded to any server.</p>
            <p style={{ marginTop: 12 }}><strong>What images work best?</strong><br />Photos and complex images benefit the most from WebP compression. Simple PNG graphics may see less reduction.</p>
            <p style={{ marginTop: 12 }}><strong>Will WebP work in all browsers?</strong><br />WebP is supported in all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. For very old browsers, consider adding a fallback.</p>
            <p style={{ marginTop: 12 }}><strong>Can I convert multiple images?</strong><br />Currently one at a time. Convert each image individually and download the WebP versions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

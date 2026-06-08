'use client';

import { useState, useRef, useCallback } from 'react';

const ALLOWED_EXTS = ['mp4', 'mov', 'avi', 'webm'];
const MAX_SIZE = 500 * 1024 * 1024;

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) { const o = btn.textContent; btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = o, 2000); }
  });
}

function downloadAsTxt(prompts, filename) {
  let txt = '';
  for (const [key, label] of Object.entries(PROMPT_LABELS)) {
    if (prompts[key]) {
      txt += `${label}\n${'='.repeat(label.length)}\n${prompts[key]}\n\n`;
    }
  }
  const blob = new Blob([txt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename.replace(/\.[^.]+$/, '') + '-prompts.txt';
  a.click(); URL.revokeObjectURL(url);
}

function downloadAsMd(prompts, filename, metadata) {
  let md = `# Video to Prompt - Analysis Report\n\n`;
  if (metadata) {
    md += `**File:** ${metadata.fileName || 'Unknown'}\n`;
    md += `**Duration:** ${Math.round(metadata.duration || 0)}s\n`;
    md += `**Resolution:** ${metadata.width}x${metadata.height}\n`;
    md += `**Frames Analyzed:** ${metadata.frameCount || 0}\n\n`;
  }
  md += `---\n\n`;
  for (const [key, label] of Object.entries(PROMPT_LABELS)) {
    if (prompts[key]) {
      md += `## ${label}\n\n${prompts[key]}\n\n---\n\n`;
    }
  }
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename.replace(/\.[^.]+$/, '') + '-prompts.md';
  a.click(); URL.revokeObjectURL(url);
}

const PROMPT_LABELS = {
  universalPrompt: 'Universal Prompt',
  veoPrompt: 'Google Veo Prompt',
  klingPrompt: 'Kling Prompt',
  runwayPrompt: 'Runway Prompt',
  cinematicDirectorPrompt: 'Cinematic Director Prompt',
  negativePrompt: 'Negative Prompt'
};

const PROMPT_ICONS = {
  universalPrompt: '🎯',
  veoPrompt: '🔵',
  klingPrompt: '🟣',
  runwayPrompt: '🟢',
  cinematicDirectorPrompt: '🎬',
  negativePrompt: '🚫'
};

export default function VideoToPromptClient() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [ultraDetailed, setUltraDetailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [frameAnalysis, setFrameAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractProgress, setExtractProgress] = useState(0);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const videoRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);

  function validateFile(f) {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      setError('Invalid file type. Accepted: MP4, MOV, AVI, WEBM');
      return false;
    }
    if (f.size > MAX_SIZE) {
      setError('File too large. Max size: 500MB');
      return false;
    }
    setError('');
    return true;
  }

  function handleFile(f) {
    if (!validateFile(f)) return;
    setFile(f);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(f));
    setResult(null);
    setFrameAnalysis(null);
    setStep('preview');
    setUploadProgress(100);
  }

  async function extractFrames() {
    const video = videoRef.current;
    if (!video) return [];

    await new Promise(resolve => {
      video.onloadedmetadata = resolve;
      if (video.readyState >= 1) resolve();
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const duration = video.duration;
    const targetFrames = ultraDetailed ? 10 : 5;
    const totalFrames = Math.min(targetFrames, Math.floor(duration));
    if (totalFrames < 1) return [{ time: 0, data: captureFrame(video, canvas, ctx, 0) }];
    const interval = duration / totalFrames;
    const frames = [];

    for (let i = 0; i < totalFrames; i++) {
      const time = i * interval;
      video.currentTime = time;
      await new Promise(resolve => {
        video.onseeked = resolve;
        if (Math.abs(video.currentTime - time) < 0.1) resolve();
      });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      frames.push({ time, data: canvas.toDataURL('image/jpeg', 0.65) });
      setExtractProgress(Math.round(((i + 1) / totalFrames) * 100));
    }
    return frames;
  }

  function captureFrame(video, canvas, ctx, time) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.65);
  }

  async function handleGenerate() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setFrameAnalysis(null);
    setError('');
    setExtractProgress(0);
    setAnalyzeProgress(0);
    setStep('extracting');

    try {
      const frames = await extractFrames();
      setStep('analyzing');
      setAnalyzeProgress(10);

      const metadata = {
        fileName: file.name,
        fileSize: file.size,
        duration: videoRef.current?.duration || 0,
        width: videoRef.current?.videoWidth || 0,
        height: videoRef.current?.videoHeight || 0
      };

      setAnalyzeProgress(30);

      const res = await fetch('/api/tools/video-to-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames, metadata, ultraDetailed })
      });

      setAnalyzeProgress(80);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      if (!data.success) throw new Error(data.error || 'Analysis failed');

      setAnalyzeProgress(100);
      setResult(data);
      setFrameAnalysis(data.frameAnalysis);
      setStep('results');
    } catch (err) {
      setError(err.message);
      setStep('upload');
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function PromptCard({ id, content }) {
    if (!content) return null;
    return (
      <div style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--card-border, #1e1e22)', background: 'var(--surface, #0d0d0f)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary, #5a5a62)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            {PROMPT_ICONS[id] || ''} {PROMPT_LABELS[id] || id}
          </h3>
          <button onClick={(e) => copyText(content, e.currentTarget)}
            style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>
            Copy
          </button>
        </div>
        <pre style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-primary, #e8e6e0)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit', maxHeight: 400, overflow: 'auto', margin: 0 }}>{content}</pre>
      </div>
    );
  }

  return (
    <section className="section tool-page" style={{ paddingTop: 120 }}>
      <div className="container">
        <div className="tool-page-header">
          <div className="tool-page-icon">🎥</div>
          <h1 className="tool-page-title">Video to Prompt Generator</h1>
          <p className="tool-page-desc">Upload any video and get detailed AI prompts for Veo, Kling, Runway, Pika, Hailuo, Luma, and other AI video generators.</p>
        </div>

        <div className="tool-layout" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div className="tool-workspace" style={{ flex: 1, minWidth: 0 }}>
            <div className="tool-section">
              <h2>Upload Video</h2>
              <div className="usage-steps" style={{ marginBottom: 16 }}>
                <ol>
                  <li><strong>Upload</strong> – MP4, MOV, AVI, or WEBM (up to 500MB)</li>
                  <li><strong>AI Analysis</strong> – Frames extracted and analyzed for visual style, camera, lighting, composition, and more</li>
                  <li><strong>6 Prompts</strong> – Universal, Veo, Kling, Runway, Cinematic Director, and Negative prompts</li>
                </ol>
              </div>
            </div>

            <div onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('v2p-input')?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--neon-purple, #8b5cf6)' : 'var(--card-border, #2a2a2e)'}`,
                borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                background: dragOver ? 'rgba(139,92,246,0.06)' : 'var(--card-bg, #111114)',
                transition: 'all 0.15s', marginBottom: 16
              }}>
              <input id="v2p-input" type="file" accept=".mp4,.mov,.avi,.webm" style={{ display: 'none' }}
                onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
              <div style={{ fontSize: 40, marginBottom: 12 }}>{file ? '🎬' : '📁'}</div>
              {file ? (
                <>
                  <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)' }}>{file.name}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary, #5a5a62)' }}>{formatSize(file.size)}</p>
                </>
              ) : (
                <>
                  <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)' }}>Drop video here or click to browse</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary, #5a5a62)' }}>MP4, MOV, AVI, WEBM — Max 500MB</p>
                </>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: 'var(--card-border, #1e1e22)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', borderRadius: 2, transition: 'width 0.3s' }} />
                </div>
              )}
            </div>

            {/* Ultra Detailed toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 16px', borderRadius: 8, background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)' }}>🔬 Ultra Detailed Analysis</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary, #5a5a62)', marginTop: 2 }}>Extract more frames, deeper scene analysis, detect transitions and editing style (slower but more accurate)</div>
              </div>
              <button onClick={() => setUltraDetailed(!ultraDetailed)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
                  background: ultraDetailed ? 'linear-gradient(90deg, #8b5cf6, #d946ef)' : 'var(--card-border, #2a2a2e)',
                  transition: 'background 0.2s'
                }}>
                <span style={{
                  position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  left: ultraDetailed ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 8, background: '#2a0f0f', border: '1px solid #ef4444', color: '#ef4444', fontSize: 14, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {file && (
              <div style={{ marginBottom: 16 }}>
                <video ref={videoRef} src={videoUrl} style={{ width: '100%', maxHeight: 400, borderRadius: 12, background: '#000' }} controls />
              </div>
            )}

            <button className="btn btn-primary generate-btn" onClick={handleGenerate} disabled={loading || !file}
              style={{ width: '100%', marginBottom: 16 }}>
              {loading ? '⏳ Processing...' : '✨ Generate Prompts'}
            </button>

            {/* Progress indicators */}
            {step === 'extracting' && (
              <div style={{ marginBottom: 16, padding: '16px 20px', borderRadius: 10, background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="saas-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)' }}>Extracting frames...</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-tertiary, #5a5a62)', fontFamily: 'monospace' }}>{extractProgress}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--card-border, #1e1e22)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${extractProgress}%`, background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', borderRadius: 2, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {step === 'analyzing' && (
              <div style={{ marginBottom: 16, padding: '16px 20px', borderRadius: 10, background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="saas-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)' }}>AI analyzing video...</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-tertiary, #5a5a62)', fontFamily: 'monospace' }}>{analyzeProgress}%</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-tertiary, #5a5a62)' }}>
                  <span>🔍 Visual style & composition</span>
                  <span>🎬 Camera & lighting</span>
                  <span>🎨 Color & mood</span>
                  {ultraDetailed && <span>🔬 Scene transitions & editing</span>}
                </div>
                <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: 'var(--card-border, #1e1e22)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${analyzeProgress}%`, background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', borderRadius: 2, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '12px 16px', borderRadius: 10, background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(217,70,239,0.05))', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)' }}>
                    🎯 {ultraDetailed ? 'Ultra Detailed' : 'Standard'} Analysis Complete
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => downloadAsTxt(result, file?.name || 'video')}
                      style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>
                      📄 Download TXT
                    </button>
                    <button onClick={() => downloadAsMd(result, file?.name || 'video', result.metadata)}
                      style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer', fontWeight: 600 }}>
                      📝 Download MD
                    </button>
                  </div>
                </div>

                <PromptCard id="universalPrompt" content={result.universalPrompt} />
                <PromptCard id="veoPrompt" content={result.veoPrompt} />
                <PromptCard id="klingPrompt" content={result.klingPrompt} />
                <PromptCard id="runwayPrompt" content={result.runwayPrompt} />
                <PromptCard id="cinematicDirectorPrompt" content={result.cinematicDirectorPrompt} />
                <PromptCard id="negativePrompt" content={result.negativePrompt} />

                {frameAnalysis && (
                  <details style={{ background: 'var(--card-bg, #111114)', border: '1px solid var(--card-border, #1e1e22)', borderRadius: 10, overflow: 'hidden' }}>
                    <summary style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary, #5a5a62)', cursor: 'pointer', userSelect: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🔬 View Raw Frame Analysis
                    </summary>
                    <pre style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary, #9a9890)', lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 500, overflow: 'auto', margin: 0, borderTop: '1px solid var(--card-border, #1e1e22)' }}>{frameAnalysis}</pre>
                  </details>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={() => { setResult(null); setFrameAnalysis(null); setFile(null); setStep('upload'); setUploadProgress(0); }}
                    style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid var(--card-border, #2a2a2e)', background: 'transparent', color: 'var(--text-primary, #e8e6e0)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Start Over
                  </button>
                </div>
              </div>
            )}

            <div className="tool-section">
              <h2>FAQ</h2>
              <div className="faq-list">
                <div className="faq-item">
                  <div className="faq-question">
                    Which AI video generators are supported?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-content">Google Veo 2, Kling 1.6, Runway Gen-3, Pika, Hailuo, Luma Dream Machine, and any text-to-video model. Each prompt is optimized for its specific platform's strengths.</div>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-question">
                    How long does analysis take?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-content">Standard analysis (5 frames): 20-40 seconds. Ultra Detailed (10 frames): 45-90 seconds. Processing time depends on video length and AI model response time.</div>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-question">
                    What can I use the prompts for?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-content">Recreate the exact video style in any AI video generator, generate storyboards, create consistent visual styles, extract cinematography techniques for learning, or use as reference for manual video production.</div>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-question">
                    What is Ultra Detailed Analysis?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-content">Extracts 10 frames instead of 5, detects scene transitions, editing style, pacing, cinematic techniques, and storytelling structure. Produces a master prompt optimized for maximum similarity to the original video.</div>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-question">
                    Are my videos stored on your server?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-content">No. Videos are processed entirely in your browser. Only anonymized frame data is sent to the AI for analysis. Your video file never leaves your device.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tool-section">
              <h2>Related Tools</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href="/tools/youtube-creator" className="btn btn-sm btn-outline">AI YouTube Creator Suite</a>
                <a href="/tools/thumbnail-prompts" className="btn btn-sm btn-outline">Thumbnail Prompt Generator</a>
                <a href="/tools/youtube-script" className="btn btn-sm btn-outline">YouTube Script Generator</a>
                <a href="/tools/faceless-video" className="btn btn-sm btn-outline">Faceless Video Generator</a>
                <a href="/tools/image-to-prompt" className="btn btn-sm btn-outline">Image to Prompt Generator</a>
              </div>
            </div>
          </div>

          <aside className="tool-sidebar" style={{ width: 300, flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: 100 }}></div>
          </aside>
        </div>
      </div>
    </section>
  );
}

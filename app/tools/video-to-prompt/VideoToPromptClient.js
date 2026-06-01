'use client';

import { useState, useRef, useCallback } from 'react';
import AdManager from '@/components/AdManager';

export default function VideoToPromptClient() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [result, setResult] = useState(null);
  const [rewrites, setRewrites] = useState(null);
  const [showRewrites, setShowRewrites] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('upload');
  const videoRef = useRef(null);

  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  const allowedExtensions = ['mp4', 'mov', 'avi', 'webm'];

  function validateFile(f) {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError('Invalid file type. Accepted: MP4, MOV, AVI, WEBM');
      return false;
    }
    if (f.size > 500 * 1024 * 1024) {
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
    setRewrites(null);
    setShowRewrites(false);
    setStep('preview');
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
    const totalFrames = Math.min(10, Math.floor(duration));
    const interval = duration / totalFrames;
    const frames = [];

    for (let i = 0; i < totalFrames; i++) {
      video.currentTime = i * interval;
      await new Promise(resolve => {
        video.onseeked = resolve;
        if (Math.abs(video.currentTime - i * interval) < 0.1) resolve();
      });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      frames.push({
        time: i * interval,
        data: canvas.toDataURL('image/jpeg', 0.7)
      });
    }
    return frames;
  }

  async function handleGenerate() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setRewrites(null);
    setShowRewrites(false);
    setStep('analyzing');

    try {
      const frames = await extractFrames();
      const metadata = {
        fileName: file.name,
        fileSize: file.size,
        duration: videoRef.current?.duration || 0,
        width: videoRef.current?.videoWidth || 0,
        height: videoRef.current?.videoHeight || 0
      };

      const res = await fetch('/api/tools/video-to-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames: frames.slice(0, 5).map(f => f.data),
          metadata
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        setStep('results');
      } else {
        setError(data.error || 'Analysis failed');
        setStep('upload');
      }
    } catch (err) {
      setError(err.message);
      setStep('upload');
    } finally {
      setLoading(false);
    }
  }

  async function handleRewrite() {
    if (!result) return;
    setRewriting(true);
    setRewrites(null);
    setShowRewrites(true);

    try {
      const res = await fetch('/api/tools/video-to-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewrite: true,
          originalPrompt: result.detailedPrompt,
          metadata: result.metadata
        })
      });

      const data = await res.json();
      if (data.success) {
        setRewrites(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRewriting(false);
    }
  }

  function copyText(text) {
    navigator.clipboard.writeText(text);
  }

  function PromptSection({ title, content }) {
    if (!content) return null;
    return (
      <div className="prompt-section">
        <div className="prompt-section-header">
          <h4>{title}</h4>
          <button className="btn btn-xs btn-secondary" onClick={() => copyText(content)}>Copy</button>
        </div>
        <pre className="prompt-content">{content}</pre>
      </div>
    );
  }

  const toolId = 'video-to-prompt';

  return (
    <section className="section tool-page" style={{ paddingTop: 120 }}>
      <div className="container">
        <div className="tool-page-header">
          <div className="tool-page-icon">🎥</div>
          <h1 className="tool-page-title">Video to Prompt</h1>
          <p className="tool-page-desc">Upload any video and get detailed AI prompts for image generators, video creators, and more.</p>
        </div>

        <AdManager location="content_top" toolId={toolId} />

        <div className="tool-layout" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div className="tool-workspace" style={{ flex: 1, minWidth: 0 }}>
            <AdManager location="in_tool" toolId={toolId} />

            <div className="tool-section">
              <h2>How to Use Video to Prompt</h2>
              <div className="usage-steps">
                <ol>
                  <li><strong>Upload a video</strong> – Select an MP4, MOV, AVI, or WEBM file (up to 500MB)</li>
                  <li><strong>AI extracts frames</strong> – Key frames are analyzed for visual elements, scenes, and composition</li>
                  <li><strong>Receive prompts</strong> – Get 5 types of prompts: detailed, short, cinematic, image gen, and video gen</li>
                </ol>
              </div>
            </div>

            <div className="upload-zone" onClick={() => document.getElementById('video-input')?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--neon-purple)'; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = ''; }}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '';
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}>
              <input id="video-input" type="file" accept=".mp4,.mov,.avi,.webm" style={{ display: 'none' }}
                onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
              <div className="upload-zone-icon">{file ? '🎬' : '📁'}</div>
              {file ? (
                <>
                  <h3>{file.name}</h3>
                  <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <h3>Upload a video</h3>
                  <p>MP4, MOV, AVI, WEBM – Max 500MB</p>
                </>
              )}
            </div>

            {error && (
              <div style={{ color: '#ef4444', textAlign: 'center', padding: 12, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {file && (
              <div style={{ marginBottom: 24 }}>
                <video ref={videoRef} src={videoUrl} style={{ width: '100%', maxHeight: 400, borderRadius: 12, background: '#000' }} controls />
              </div>
            )}

            <button className="btn btn-primary generate-btn" onClick={handleGenerate} disabled={loading || !file}>
              {loading ? '🔍 Analyzing...' : '✨ Generate Prompts'}
            </button>

            {loading && (
              <div className="results-section">
                <div className="results-placeholder">
                  <div className="saas-spinner" style={{ margin: '0 auto 16px' }}></div>
                  <p>Extracting frames and analyzing video...</p>
                </div>
              </div>
            )}

            {result && (
              <div className="results-section saas-result-fade">
                <div className="results-header">
                  <h3>Generated Prompts</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-sm btn-secondary" onClick={handleRewrite} disabled={rewriting}>
                      {rewriting ? 'Rewriting...' : '🔄 Make Prompt Unique'}
                    </button>
                  </div>
                </div>

                <div className="prompts-container">
                  <PromptSection title="📝 Detailed AI Prompt" content={result.detailedPrompt} />
                  <PromptSection title="⚡ Short Prompt" content={result.shortPrompt} />
                  <PromptSection title="🎬 Cinematic Prompt" content={result.cinematicPrompt} />
                  <PromptSection title="🖼️ Image Generation Prompt" content={result.imageGenPrompt} />
                  <PromptSection title="🎥 Video Generation Prompt" content={result.videoGenPrompt} />
                </div>

                <AdManager location="mid_result" toolId={toolId} />
              </div>
            )}

            {showRewrites && rewrites && (
              <div className="results-section saas-result-fade" style={{ marginTop: 24 }}>
                <div className="results-header">
                  <h3>Alternative Versions</h3>
                </div>
                <div className="rewrite-versions">
                  <div className="rewrite-version">
                    <h4>Version 1</h4>
                    <pre className="prompt-content">{rewrites.version1}</pre>
                    <button className="btn btn-xs btn-secondary" onClick={() => copyText(rewrites.version1)}>Copy</button>
                  </div>
                  <div className="rewrite-version">
                    <h4>Version 2</h4>
                    <pre className="prompt-content">{rewrites.version2}</pre>
                    <button className="btn btn-xs btn-secondary" onClick={() => copyText(rewrites.version2)}>Copy</button>
                  </div>
                  <div className="rewrite-version">
                    <h4>Version 3</h4>
                    <pre className="prompt-content">{rewrites.version3}</pre>
                    <button className="btn btn-xs btn-secondary" onClick={() => copyText(rewrites.version3)}>Copy</button>
                  </div>
                </div>
              </div>
            )}

            {showRewrites && rewriting && (
              <div className="results-section" style={{ marginTop: 24 }}>
                <div className="results-placeholder">
                  <div className="saas-spinner" style={{ margin: '0 auto 16px' }}></div>
                  <p>Generating alternative versions...</p>
                </div>
              </div>
            )}

            <div className="tool-section">
              <h2>FAQ</h2>
              <div className="faq-list">
                <div className="faq-item">
                  <div className="faq-question">
                    Can I use YouTube links?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-content">Currently we support direct video uploads. YouTube URL support coming soon.</div>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-question">
                    How long can the video be?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-content">We support videos up to 10 minutes for optimal analysis. Maximum file size is 500MB.</div>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-question">
                    What can I use the prompts for?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-content">Use them to recreate scenes, generate storyboards, create consistent visual styles in Midjourney, DALL-E, Stable Diffusion, and AI video generators like Runway and Pika.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tool-section">
              <h2>Related Tools</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href="/tools/youtube-creator" className="btn btn-sm btn-outline">AI YouTube Creator Suite</a>
                <a href="/tools/thumbnail-prompt" className="btn btn-sm btn-outline">Thumbnail Prompt Generator</a>
                <a href="/tools/youtube-script" className="btn btn-sm btn-outline">YouTube Script Generator</a>
                <a href="/tools/faceless-video" className="btn btn-sm btn-outline">Faceless Video Generator</a>
              </div>
            </div>
          </div>

          <aside className="tool-sidebar" style={{ width: 300, flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: 100 }}>
              <AdManager location="sidebar" toolId={toolId} />
            </div>
          </aside>
        </div>

        <AdManager location="content_bottom" toolId={toolId} />
      </div>
    </section>
  );
}

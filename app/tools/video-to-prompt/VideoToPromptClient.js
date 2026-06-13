'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

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

export default function VideoToPromptClient() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [ultraDetailed, setUltraDetailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [frameAnalysis, setFrameAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [promptsError, setPromptsError] = useState('');
  const [videoMeta, setVideoMeta] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const MAX_FRAME_WIDTH = 640;

  function resizeFrame(canvas, ctx, videoEl) {
    const scale = Math.min(1, MAX_FRAME_WIDTH / videoEl.videoWidth);
    canvas.width = Math.round(videoEl.videoWidth * scale);
    canvas.height = Math.round(videoEl.videoHeight * scale);
  }

  const extractFrames = useCallback(async (videoFile, ultraDetailed) => {
    const url = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.src = url;
    await video.play();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fps = ultraDetailed ? 1 : 0.5;
    const maxFrames = ultraDetailed ? 12 : 6;
    const frames = [];
    const totalFrames = Math.min(Math.floor(video.duration * fps), maxFrames);
    video.addEventListener('loadedmetadata', () => resizeFrame(canvas, ctx, video));
    await new Promise(r => { video.addEventListener('loadedmetadata', r, { once: true }); });
    resizeFrame(canvas, ctx, video);
    for (let i = 0; i < totalFrames; i++) {
      video.currentTime = i / fps;
      await new Promise(r => { video.addEventListener('seeked', r, { once: true }); });
      ctx.drawImage(video, 0, 0);
      frames.push(canvas.toDataURL('image/jpeg', 0.6));
    }
    video.remove();
    URL.revokeObjectURL(url);
    return { frames, duration: video.duration, width: video.videoWidth, height: video.videoHeight };
  }, []);
  const captureFrame = useCallback((videoFile) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(videoFile);
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        resizeFrame(canvas, ctx, video);
        video.currentTime = Math.min(video.duration * 0.25, 5);
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
      };
    });
  }, []);
  const handleGenerate = useCallback(async () => {
    if (!file) { setError('Please select a video file first.'); return; }
    setError('');
    setResult(null);
    setPrompts([]);
    setLoading(true);
    setProgress(0);
    try {
      setStage('Extracting frames');
      setProgress(10);
      await new Promise((r) => setTimeout(r, 100));
      const { frames, duration, width, height } = await extractFrames(file, ultraDetailed);
      if (frames.length === 0) throw new Error('Could not extract frames from this video.');
      setProgress(40);
      setStage(`Analyzing ${frames.length} frames (AI)...`);
      const res = await fetch('/api/tools/video-to-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames,
          ultraDetailed,
          metadata: { fileName: file.name, duration, width, height }
        })
      });
      setProgress(80);
      setStage('Finalizing');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Analysis failed with status ' + res.status);
      }
      const data = await res.json();
      setVideoMeta({ fileName: file.name, duration, width, height });
      setResult(data);
      setFrameAnalysis(data.frameAnalysis || '');
      const promptEntries = {};
      for (const key of ['universalPrompt', 'veoPrompt', 'klingPrompt', 'runwayPrompt', 'cinematicDirectorPrompt', 'negativePrompt']) {
        if (data[key]) promptEntries[key] = data[key];
      }
      setPrompts(promptEntries);
      setProgress(100);
      setStage('');
    } catch (err) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
      setStage('');
    }
  }, [file, ultraDetailed, extractFrames]);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const ext = droppedFile.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        setError('Invalid file type. Please upload MP4, MOV, AVI, or WEBM.');
        return;
      }
      if (droppedFile.size > MAX_SIZE) {
        setError('File size exceeds 500 MB limit.');
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  }, []);
  return (
    <div style={{ maxWidth: 800, margin: ' 0 auto', padding: '24px 16px', fontFamily: 'inherit' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: ' 0 0 8px', color: 'var(--text-primary, #e8e6e0)' }}>
          Video to Prompt
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary, #9a9890)', maxWidth: 560, margin: ' 0 auto' }}>
          Upload a video and get detailed AI-generated prompts for various AI video generation platforms
        </p>
      </div>

      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
        style={{ border: '2px dashed var(--card-border, #333)', borderRadius: 12, padding: '40px 20px', textAlign: 'center', marginBottom: 24, background: 'var(--surface, #0d0d0f)', cursor: 'pointer' }}
        onClick={() => fileInputRef.current?.click()}>
        {!file ? (
          <div>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎥</div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary, #9a9890)', margin: ' 0 0 8px' }}>
              Drag & drop your video here or click to browse
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary, #5a5a62)' }}>
              Supports MP4, MOV, AVI, WEBM (max 500 MB)
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: 'var(--text-primary, #e8e6e0)' }}>📰 {file.name}</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary, #5a5a62)' }}>({formatSize(file.size)})</span>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); setError(''); setResult(null); }}
              style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--card-border, #333)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer' }}>
              Remove
            </button>
          </div>
        )}
        <input ref={fileInputRef} type='file' accept='.mp4,.mov,.avi,.webm' style={{ display: 'none' }} onChange={(e) => {
          const f = e.target.files[0];
          if (f) { setFile(f); setError(''); }
        }} />
      </div>

      {file && !loading && !result && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary, #9a9890)' }}>
            <input type='checkbox' checked={ultraDetailed} onChange={(e) => setUltraDetailed(e.target.checked)}
              style={{ width: 16, height: 16 }} />
            Ultra-detailed analysis (slower, more comprehensive)
          </label>
          <button onClick={handleGenerate} disabled={loading}
            style={{ marginTop: 16, width: '100%', padding: '12px', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Analyzing...' : 'Analyze Video to Generate Prompts'}
          </button>
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: 24, background: 'var(--surface, #0d0d0f)', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary, #9a9890)' }}>
            <span>`${stage || 'Processing...'}`</span>
            <span>`${progress}%`</span>
          </div>
          <div style={{ height: 6, background: 'var(--card-border, #1e1e22)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#ef4444', fontSize: 14 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', margin: 0 }}>
              Generated Prompts
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => downloadAsTxt(prompts, file?.name || 'video')}
                style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '1px solid var(--card-border, #333)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer' }}>
                Download TXT
              </button>
              <button onClick={() => downloadAsMd(prompts, file?.name || 'video', videoMeta)}
                style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '1px solid var(--card-border, #333)', background: 'transparent', color: 'var(--text-secondary, #9a9890)', cursor: 'pointer' }}>
                Download MD
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(PROMPT_LABELS).map(([key, label]) => (
              prompts[key] ? <PromptCard key={key} id={key} content={prompts[key]} /> : null
            ))}
          </div>
          {promptsError && (
            <p style={{ fontSize: 13, color: 'var(--text-tertiary, #5a5a62)', marginTop: 12 }}>
              {promptsError}
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: 40, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', margin: ' 0 16px' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--surface, #0d0d0f)', borderRadius: 8, padding: '16px 20px', border: '1px solid var(--card-border, #1e1e22)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', margin: ' 0 6px' }}>How does the video to prompt analysis work?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary, #9a9890)', margin: 0, lineHeight: 1.6 }}>
              Our AI analyzes your video content, including visual elements, scene composition, motion patterns, and audio cues to generate optimized prompts for various AI video generation platforms.
            </p>
          </div>
          <div style={{ background: 'var(--surface, #0d0d0f)', borderRadius: 8, padding: '16px 20px', border: '1px solid var(--card-border, #1e1e22)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', margin: ' 0 6px' }}>What video formats are supported?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary, #9a9890)', margin: 0, lineHeight: 1.6 }}>
              We support MP4, MOV, AVI, and WEBM formats. Maximum file size is 500 MB.
            </p>
          </div>
          <div style={{ background: 'var(--surface, #0d0d0f)', borderRadius: 8, padding: '16px 20px', border: '1px solid var(--card-border, #1e1e22)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', margin: ' 0 6px' }}>What platforms are the prompts optimized for?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary, #9a9890)', margin: 0, lineHeight: 1.6 }}>
              We generate prompts optimized for Google Veo, Kling, Runway, and other major AI video platforms, plus a universal prompt that works across multiple platforms.
            </p>
          </div>
          <div style={{ background: 'var(--surface, #0d0d0f)', borderRadius: 8, padding: '16px 20px', border: '1px solid var(--card-border, #1e1e22)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', margin: ' 0 6px' }}>What does ultra-detailed analysis do?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary, #9a9890)', margin: 0, lineHeight: 1.6 }}>
              Ultra-detailed mode performs a more comprehensive analysis of your video, capturing more frames and generating more nuanced prompts that include specific visual details, color palettes, and stylistic elements.
            </p>
          </div>
          <div style={{ background: 'var(--surface, #0d0d0f)', borderRadius: 8, padding: '16px 20px', border: '1px solid var(--card-border, #1e1e22)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', margin: ' 0 6px' }}>How long does the analysis take?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary, #9a9890)', margin: 0, lineHeight: 1.6 }}>
              Analysis time depends on video length and complexity. Most videos are processed within a few minutes. Ultra-detailed mode may take longer.
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', margin: ' 0 16px' }}>
          Related Tools
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          <Link href='/tools/youtube-creator'
            style={{ textDecoration: 'none', padding: '16px', background: 'var(--surface, #0d0d0f)', borderRadius: 8, border: '1px solid var(--card-border, #1e1e22)', transition: 'border-color 0.2s' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🎬</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', marginBottom: 4 }}>YouTube Content Suite</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary, #9a9890)' }}>Generate ideas, scripts, and titles for your YouTube videos</div>
          </Link>
          <Link href='/tools/prompt-viral'
            style={{ textDecoration: 'none', padding: '16px', background: 'var(--surface, #0d0d0f)', borderRadius: 8, border: '1px solid var(--card-border, #1e1e22)', transition: 'border-color 0.2s' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🚀</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e8e6e0)', marginBottom: 4 }}>Prompt Viral</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary, #9a9890)' }}>Generate viral-worthy prompts for your AI content</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

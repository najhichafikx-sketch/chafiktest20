'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Inpainter } from './inpaint';

const MAX_DIM = 1400;
const MASK_COLOR = 'rgba(239,68,68,0.65)';
const UNDO_LIMIT = 25;

export default function WatermarkRemover() {
  const [step, setStep] = useState('source');
  const [tool, setTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(28);
  const [blurAmount, setBlurAmount] = useState(2);
  const [inpaintRadius, setInpaintRadius] = useState(3);
  const [algorithm, setAlgorithm] = useState('ns');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timerText, setTimerText] = useState('');
  const [resultImageData, setResultImageData] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  const [splitPos, setSplitPos] = useState(0.5);
  const [hasMask, setHasMask] = useState(false);

  const imageRef = useRef(null);
  const imageDataRef = useRef(null);
  const origImageDataRef = useRef(null);
  const imageCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const resultCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef(null);
  const lastPointRef = useRef(null);
  const undoStackRef = useRef([]);
  const maskDataRef = useRef(null);
  const timerRef = useRef(null);

  const [loadedImage, setLoadedImage] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const loadImage = useCallback((img) => {
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
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
    const data = ctx.getImageData(0, 0, w, h);
    imageDataRef.current = data;
    origImageDataRef.current = new ImageData(new Uint8ClampedArray(data.data), w, h);
    imageRef.current = img;
    setLoadedImage(img);
    setStep('editor');
  }, []);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.match(/image\/(png|jpeg|webp|bmp)/)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => loadImage(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [loadImage]);

  const handleClipboardPaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const blob = item.getAsFile();
        if (blob && blob.type.startsWith('image/')) {
          handleFile(blob);
          return;
        }
      }
    } catch {}
  }, [handleFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const initCanvases = useCallback(() => {
    const data = imageDataRef.current;
    if (!data) return;
    const ic = imageCanvasRef.current;
    const mc = maskCanvasRef.current;
    if (!ic || !mc) return;
    ic.width = data.width;
    ic.height = data.height;
    mc.width = data.width;
    mc.height = data.height;
    ic.getContext('2d').putImageData(data, 0, 0);
    const mctx = mc.getContext('2d');
    mctx.clearRect(0, 0, mc.width, mc.height);
    maskDataRef.current = mctx.getImageData(0, 0, mc.width, mc.height);
    undoStackRef.current = [];
    setHasMask(false);
  }, []);

  useEffect(() => {
    if (step === 'editor' && imageDataRef.current) {
      setTimeout(initCanvases, 50);
    }
  }, [step, initCanvases]);

  useEffect(() => {
    if (step === 'editor') {
      const mc = maskCanvasRef.current;
      if (!mc) return;
      mc.style.pointerEvents = isProcessing ? 'none' : 'auto';
    }
  }, [isProcessing, step]);

  const saveUndo = useCallback(() => {
    const mc = maskCanvasRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d');
    const snap = ctx.getImageData(0, 0, mc.width, mc.height);
    const stack = undoStackRef.current;
    stack.push(snap);
    if (stack.length > UNDO_LIMIT) stack.shift();
  }, []);

  const undo = useCallback(() => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const mc = maskCanvasRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d');
    const snap = stack.pop();
    ctx.putImageData(snap, 0, 0);
    checkMask();
  }, []);

  const clearMask = useCallback(() => {
    const mc = maskCanvasRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d');
    ctx.clearRect(0, 0, mc.width, mc.height);
    undoStackRef.current = [];
    setHasMask(false);
  }, []);

  const checkMask = useCallback(() => {
    const mc = maskCanvasRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d');
    const d = ctx.getImageData(0, 0, mc.width, mc.height);
    let has = false;
    for (let i = 3; i < d.data.length; i += 4) {
      if (d.data[i] > 16) { has = true; break; }
    }
    setHasMask(has);
  }, []);

  const getPointerPos = useCallback((e) => {
    const mc = maskCanvasRef.current;
    if (!mc) return { x: 0, y: 0 };
    const rect = mc.getBoundingClientRect();
    const scaleX = mc.width / rect.width;
    const scaleY = mc.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const startDrawing = useCallback((e) => {
    if (isProcessing) return;
    isDrawingRef.current = true;
    const pos = getPointerPos(e);
    drawStartRef.current = pos;
    lastPointRef.current = pos;
    if (tool === 'brush' || tool === 'eraser') {
      saveUndo();
      drawAt(pos);
    }
  }, [isProcessing, tool, getPointerPos, saveUndo]);

  const draw = useCallback((e) => {
    if (!isDrawingRef.current) return;
    const pos = getPointerPos(e);
    const last = lastPointRef.current;
    if (tool === 'brush' || tool === 'eraser') {
      const step = brushSize / 6;
      const dist = Math.hypot(pos.x - last.x, pos.y - last.y);
      if (dist > step) {
        const steps = Math.ceil(dist / step);
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          drawAt({ x: last.x + (pos.x - last.x) * t, y: last.y + (pos.y - last.y) * t });
        }
      } else {
        drawAt(pos);
      }
    }
    if (tool === 'rect') {
      previewRect(pos);
    }
    if (tool === 'lasso') {
      drawLassoTo(pos);
    }
    lastPointRef.current = pos;
  }, [isDrawingRef, tool, brushSize, getPointerPos]);

  const endDrawing = useCallback((e) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (tool === 'rect') {
      saveUndo();
      const pos = getPointerPos(e);
      finishRect(pos);
    }
    if (tool === 'lasso') {
      saveUndo();
      finishLasso();
    }
    checkMask();
  }, [tool, getPointerPos, saveUndo, checkMask]);

  const drawAt = useCallback((pos) => {
    const mc = maskCanvasRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d');
    ctx.save();
    if (tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = MASK_COLOR;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    setHasMask(true);
  }, [tool, brushSize]);

  const previewRect = useCallback((pos) => {
    const mc = maskCanvasRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d');
    const stack = undoStackRef.current;
    if (stack.length > 0) ctx.putImageData(stack[stack.length - 1], 0, 0);
    const start = drawStartRef.current;
    if (!start) return;
    const x = Math.min(start.x, pos.x);
    const y = Math.min(start.y, pos.y);
    const w = Math.abs(pos.x - start.x);
    const h = Math.abs(pos.y - start.y);
    ctx.fillStyle = MASK_COLOR;
    ctx.fillRect(x, y, w, h);
  }, []);

  const finishRect = useCallback((pos) => {
    const mc = maskCanvasRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d');
    const start = drawStartRef.current;
    if (!start) return;
    const x = Math.min(start.x, pos.x);
    const y = Math.min(start.y, pos.y);
    const w = Math.abs(pos.x - start.x);
    const h = Math.abs(pos.y - start.y);
    ctx.fillStyle = MASK_COLOR;
    ctx.fillRect(x, y, w, h);
    setHasMask(true);
  }, []);

  let lassoPathRef = useRef(null);

  const drawLassoTo = useCallback((pos) => {
    const mc = maskCanvasRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d');
    const stack = undoStackRef.current;
    if (stack.length > 0) ctx.putImageData(stack[stack.length - 1], 0, 0);
    ctx.save();
    ctx.fillStyle = MASK_COLOR;
    ctx.beginPath();
    if (!lassoPathRef.current) {
      const start = drawStartRef.current;
      if (!start) return;
      lassoPathRef.current = new Path2D();
      lassoPathRef.current.moveTo(start.x, start.y);
    }
    lassoPathRef.current.lineTo(pos.x, pos.y);
    ctx.fill(lassoPathRef.current);
    ctx.restore();
  }, []);

  const finishLasso = useCallback(() => {
    const mc = maskCanvasRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d');
    ctx.fillStyle = MASK_COLOR;
    if (lassoPathRef.current) {
      ctx.fill(lassoPathRef.current);
    }
    lassoPathRef.current = null;
    setHasMask(true);
  }, []);

  const resetToSource = useCallback(() => {
    setStep('source');
    setResultImageData(null);
    setProgress(0);
    setTimerText('');
    setHasMask(false);
    undoStackRef.current = [];
    imageDataRef.current = null;
    origImageDataRef.current = null;
    imageRef.current = null;
    setLoadedImage(null);
    setFileInputKey(k => k + 1);
  }, []);

  const removeWatermark = useCallback(async () => {
    const srcData = imageDataRef.current;
    const mc = maskCanvasRef.current;
    if (!srcData || !mc) return;
    const mctx = mc.getContext('2d');
    const maskData = mctx.getImageData(0, 0, mc.width, mc.height);

    setIsProcessing(true);
    setProgress(0);

    setTimerText('~3s');
    let count = 3;
    timerRef.current = setInterval(() => {
      count--;
      if (count > 0) setTimerText(`~${count}s`);
      else { setTimerText('Finishing...'); clearInterval(timerRef.current); }
    }, 1000);

    await new Promise(r => setTimeout(r, 30));

    const inp = new Inpainter();
    try {
      const result = await inp.inpaint(
        srcData, maskData, inpaintRadius, algorithm, blurAmount,
        { onProgress: (p) => setProgress(p) }
      );
      setResultImageData(result);
      if (timerRef.current) clearInterval(timerRef.current);
      setTimerText('');
      setProgress(1);
      setIsProcessing(false);
      setStep('result');
    } catch {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimerText('');
      setIsProcessing(false);
    }
  }, [inpaintRadius, algorithm, blurAmount]);

  const downloadResult = useCallback(() => {
    const rc = resultCanvasRef.current;
    if (!rc) return;
    rc.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `watermark-removed-${Date.now()}.png`;
      a.click();
    }, 'image/png');
  }, []);

  const handleSplitMove = useCallback((e) => {
    const rc = resultCanvasRef.current;
    if (!rc) return;
    const rect = rc.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setSplitPos(Math.max(0, Math.min(1, x / rect.width)));
  }, []);

  const renderSlider = useCallback(() => {
    const rc = resultCanvasRef.current;
    if (!rc || !resultImageData || !origImageDataRef.current) return;
    const ctx = rc.getContext('2d');
    const w = rc.width;
    const h = rc.height;
    ctx.clearRect(0, 0, w, h);

    if (viewMode === 'original') {
      ctx.putImageData(origImageDataRef.current, 0, 0);
      return;
    }
    if (viewMode === 'result') {
      ctx.putImageData(resultImageData, 0, 0);
      return;
    }
    const splitX = Math.round(splitPos * w);
    ctx.putImageData(origImageDataRef.current, 0, 0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, splitX, h);
    ctx.clip();
    ctx.putImageData(resultImageData, 0, 0);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, h);
    ctx.stroke();
    ctx.restore();
  }, [resultImageData, viewMode, splitPos]);

  useEffect(() => {
    if (step === 'result') {
      const rc = resultCanvasRef.current;
      if (rc && resultImageData) {
        rc.width = resultImageData.width;
        rc.height = resultImageData.height;
      }
      renderSlider();
    }
  }, [step, resultImageData, renderSlider]);

  useEffect(() => {
    if (step === 'result' && resultImageData) renderSlider();
  }, [viewMode, splitPos, step, resultImageData, renderSlider]);

  const cardStyle = {
    background: 'var(--card-bg, #1a1b26)',
    border: '0.5px solid var(--card-border, #2e2f3e)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  };

  const btnPrimary = {
    padding: '12px 24px',
    borderRadius: 8,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  };

  const btnSecondary = {
    padding: '10px 20px',
    borderRadius: 8,
    border: '1px solid var(--card-border, #2e2f3e)',
    background: 'transparent',
    color: 'var(--text-secondary, #a0a0b8)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  };

  const ACCENT = '#6366f1';

  return (
    <section className="section" style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/" style={{ color: 'var(--neon-purple)', fontSize: '0.9rem', display: 'inline-block', marginBottom: 12 }}>&larr; Back to Home</Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Watermark Remover</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '8px 0 0' }}>Remove watermarks locally — no upload, no server</p>
          {step !== 'source' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '4px 14px', borderRadius: 999, fontSize: '0.8rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Ready
            </span>
          )}
        </div>

        {/* STEP 1 - SOURCE */}
        {step === 'source' && (
          <div
            style={cardStyle}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16, opacity: 0.5 }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 17l-4-4 9-9 4 4-9 9z"/>
                <path d="M5 21h14"/>
                <path d="M14 6l4 4"/>
              </svg>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Select an image</h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: '0 0 24px' }}>Drag & drop or click to upload. PNG, JPEG, WebP, BMP supported.</p>
              <input
                key={fileInputKey}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/bmp"
                onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
                style={{ display: 'none' }}
                id="file-input"
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => document.getElementById('file-input').click()} style={btnPrimary}>
                  Choose Image
                </button>
                <button onClick={handleClipboardPaste} style={btnSecondary}>
                  Paste from clipboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 - EDITOR */}
        {step === 'editor' && (
          <>
            <div style={cardStyle}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16, justifyContent: 'center' }}>
                {['brush', 'rect', 'lasso', 'eraser'].map(t => (
                  <button
                    key={t}
                    onClick={() => { setTool(t); lassoPathRef.current = null; }}
                    style={{
                      padding: '8px 18px', borderRadius: 8, border: tool === t ? `1.5px solid ${ACCENT}` : '1px solid var(--card-border, #2e2f3e)',
                      background: tool === t ? `${ACCENT}20` : 'transparent', color: tool === t ? ACCENT : 'var(--text-secondary, #a0a0b8)',
                      fontSize: 13, fontWeight: tool === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize',
                    }}
                  >
                    {t === 'brush' ? '🖌 Brush' : t === 'rect' ? '▭ Rectangle' : t === 'lasso' ? '✧ Lasso' : '🧹 Eraser'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 60%', minWidth: 280, position: 'relative' }}>
                  <canvas ref={imageCanvasRef} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }} />
                  <canvas
                    ref={maskCanvasRef}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={endDrawing}
                    onPointerLeave={endDrawing}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: isProcessing ? 'wait' : 'crosshair', borderRadius: 8, touchAction: 'none' }}
                  />
                </div>
                <div style={{ flex: '0 0 200px' }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Brush size: {brushSize}px</label>
                    <input type="range" min="4" max="120" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Feathering: {blurAmount}</label>
                    <input type="range" min="0" max="10" value={blurAmount} onChange={e => setBlurAmount(Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Algorithm</label>
                    <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--card-border, #2e2f3e)', background: 'var(--input-bg, #22233a)', color: 'var(--text-primary)', fontSize: 13 }}>
                      <option value="ns">Diffusion (smoother)</option>
                      <option value="telea">Telea (small marks)</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Radius: {inpaintRadius}</label>
                    <input type="range" min="1" max="10" value={inpaintRadius} onChange={e => setInpaintRadius(Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={removeWatermark} disabled={!hasMask || isProcessing} style={{ ...btnPrimary, opacity: (!hasMask || isProcessing) ? 0.5 : 1 }}>
                  {isProcessing ? 'Processing...' : 'Remove Watermark'}
                </button>
                <button onClick={resetToSource} style={btnSecondary}>New Image</button>
                <button onClick={undo} style={{ ...btnSecondary, padding: '8px 16px', fontSize: 13 }} disabled={undoStackRef.current.length === 0}>Undo</button>
                <button onClick={clearMask} style={{ ...btnSecondary, padding: '8px 16px', fontSize: 13 }}>Clear selection</button>
              </div>
            </div>
          </>
        )}

        {/* STEP 3 - RESULT */}
        {step === 'result' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
              {[
                { key: 'split', label: 'Before / After' },
                { key: 'result', label: 'Result' },
                { key: 'original', label: 'Original' }
              ].map(m => (
                <button
                  key={m.key}
                  onClick={() => setViewMode(m.key)}
                  style={{
                    padding: '8px 18px', borderRadius: 8, border: viewMode === m.key ? `1.5px solid ${ACCENT}` : '1px solid var(--card-border, #2e2f3e)',
                    background: viewMode === m.key ? `${ACCENT}20` : 'transparent', color: viewMode === m.key ? ACCENT : 'var(--text-secondary, #a0a0b8)',
                    fontSize: 13, fontWeight: viewMode === m.key ? 600 : 400, cursor: 'pointer',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', userSelect: 'none' }}>
              <canvas
                ref={resultCanvasRef}
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
                onPointerDown={viewMode === 'split' ? handleSplitMove : undefined}
                onPointerMove={viewMode === 'split' ? (e) => { if (e.buttons > 0) handleSplitMove(e); } : undefined}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={downloadResult} style={btnPrimary}>Download Image</button>
              <button onClick={() => { setStep('editor'); setResultImageData(null); setHasMask(true); }} style={btnSecondary}>Edit selection</button>
              <button onClick={resetToSource} style={btnSecondary}>New Image</button>
            </div>
          </div>
        )}
      </div>

      {/* LOADING OVERLAY */}
      {isProcessing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', marginBottom: 24 }} />
          <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 500, margin: '0 0 8px' }}>
            Removing watermark... {Math.round(progress * 100)}%
          </p>
          <p id="loading-timer" style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', margin: 0 }}>
            {timerText}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </section>
  );
}

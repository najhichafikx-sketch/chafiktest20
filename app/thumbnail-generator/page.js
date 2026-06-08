'use client';

import { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import CanvasPreview from './components/CanvasPreview';
import { useGenerate } from '@/hooks/useGenerate';
import { MODEL_COSTS } from '@/lib/stripe';

export default function ThumbnailGeneratorPage() {
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [model, setModel] = useState('basic');
  const [dimension, setDimension] = useState('16:9');
  const [personImage, setPersonImage] = useState(null);
  const [references, setReferences] = useState([]);
  const [colors, setColors] = useState([]);

  const { loading, result, loadingMessage, progress, generate, reset } = useGenerate();
  const estimatedCost = MODEL_COSTS[model] || MODEL_COSTS.basic;

  const handleGenerate = useCallback(async () => {
    if (!title.trim() || loading) return;
    await generate({ title, style, dimension, model, personImage, references });
  }, [title, style, dimension, model, personImage, references, loading, generate]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `thumbnail-${Date.now()}.png`;
    link.click();
  }, [result]);

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#0B0E14] text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Top Banner */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#10131A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1A1D24] border border-white/5 flex items-center justify-center">
            <Sparkles size={18} className="text-[#EAB308]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Create AI Thumbnail</h1>
            <p className="text-[11px] text-gray-500">Generate professional thumbnails using AI — powered by your brand identity.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1D24] border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse" />
            <span className="text-[10px] font-bold text-[#EAB308] tracking-wider">AI POWERED</span>
          </div>
          <button className="bg-[#EAB308] hover:bg-[#FACC15] text-black text-sm font-bold rounded-full px-6 py-2 transition-colors shadow-lg shadow-[#EAB308]/20">
            Start now
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <CanvasPreview
          loading={loading}
          loadingMessage=""
          result={result}
          onDownload={handleDownload}
          onRedo={reset}
          progress={progress}
        />
        <Sidebar
          title={title}
          onTitleChange={setTitle}
          references={references}
          onReferencesChange={setReferences}
          personImage={personImage}
          onPersonImageChange={setPersonImage}
          colors={colors}
          onColorsChange={setColors}
          model={model}
          onModelChange={setModel}
          dimension={dimension}
          onDimensionChange={setDimension}
          onGenerate={handleGenerate}
          loading={loading}
          estimatedCost={estimatedCost}
        />
      </div>
    </div>
  );
}

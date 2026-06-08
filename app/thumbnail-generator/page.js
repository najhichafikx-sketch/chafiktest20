'use client';

import { useState, useCallback } from 'react';
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
    <div dir="rtl" className="min-h-screen flex bg-[#0B0E14] text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
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
      <CanvasPreview
        loading={loading}
        loadingMessage=""
        result={result}
        onDownload={handleDownload}
        onRedo={reset}
        progress={progress}
      />
    </div>
  );
}

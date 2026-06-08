'use client';

import { useState, useCallback } from 'react';
import HeroBanner from './components/HeroBanner';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import CanvasPreview from './components/CanvasPreview';
import RecentDesigns from './components/RecentDesigns';
import { useGenerate } from '@/hooks/useGenerate';
import { useHistory } from '@/hooks/useHistory';
import { MODEL_COSTS } from '@/lib/stripe';

export default function DashboardPage() {
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [model, setModel] = useState('basic');
  const [dimension, setDimension] = useState('16:9');
  const [personImage, setPersonImage] = useState(null);
  const [references, setReferences] = useState([]);
  const [colors, setColors] = useState([]);

  const { loading, result, error, loadingMessage, progress, generate, reset } = useGenerate();
  const { designs, refetch } = useHistory();

  const estimatedCost = MODEL_COSTS[model] || MODEL_COSTS.basic;

  const handleGenerate = useCallback(async () => {
    if (!title.trim() || loading) return;
    await generate({ title, style, dimension, model, personImage, references });
    refetch();
  }, [title, style, dimension, model, personImage, references, loading, generate, refetch]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `thumbnail-${Date.now()}.png`;
    link.click();
  }, [result]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0d0d0f', color: '#e8e6e0' }}>
      <HeroBanner />
      <Topbar />
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 124px)' }}>
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
        <div className="flex-1 flex flex-col">
          <CanvasPreview
            loading={loading}
            loadingMessage={loadingMessage}
            result={result}
            onDownload={handleDownload}
            onRedo={reset}
            progress={progress}
          />
          {!loading && (
            <RecentDesigns designs={designs} />
          )}
        </div>
      </div>
    </div>
  );
}

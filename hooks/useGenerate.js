'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { composeThumbnail, dataUrlToBlob } from '@/lib/canvas-utils';

const LOADING_MESSAGES = [
  'Generating background...',
  'Removing background...',
  'Applying effects...',
  'Compositing layers...',
  'Final touches...',
];

export function useGenerate() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startProgressAnimation = useCallback(() => {
    setProgress(0);
    let step = 0;
    const msgInterval = Math.floor(100 / LOADING_MESSAGES.length);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        const msgIdx = Math.min(Math.floor(next / msgInterval), LOADING_MESSAGES.length - 1);
        setLoadingMessage(LOADING_MESSAGES[msgIdx]);
        return Math.min(next, 95);
      });
    }, 300);
  }, []);

  const stopProgressAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(100);
    setLoadingMessage('Done!');
  }, []);

  const generate = useCallback(async ({ title, style, dimension, model, personImage, references }) => {
    setLoading(true);
    setResult(null);
    setError(null);
    startProgressAnimation();

    try {
      // Step 1: Remove background if person photo uploaded
      let personPng = null;
      if (personImage) {
        const personBlob = await fetch(personImage).then((r) => r.blob());
        const formData = new FormData();
        formData.append('image', personBlob, 'person.png');
        const bgRes = await fetch('/api/remove-bg', { method: 'POST', body: formData });
        if (bgRes.ok) {
          const bgData = await bgRes.json();
          personPng = bgData.imageBase64
            ? `data:image/png;base64,${bgData.imageBase64}`
            : personImage;
        } else {
          personPng = personImage;
        }
      }

      // Step 2: Generate background via Stability AI
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, style, dimension, model }),
      });

      if (!genRes.ok) {
        const err = await genRes.json();
        throw new Error(err.error || 'Background generation failed');
      }

      const genData = await genRes.json();
      const bgUrl = genData.imageBase64
        ? `data:image/png;base64,${genData.imageBase64}`
        : genData.imageUrl;

      if (!bgUrl) throw new Error('No image returned from generation');

      // Step 3: Composite layers client-side
      const compositeDataUrl = await composeThumbnail({
        backgroundUrl: bgUrl,
        personUrl: personPng,
        title,
        dimension,
      });

      // Step 4: Upload to Supabase
      const blob = await dataUrlToBlob(compositeDataUrl);
      const uploadRes = await fetch('/api/thumbnail-generator/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          style,
          dimension,
          model,
          imageBlob: await blobToBase64(blob),
        }),
      });

      let finalUrl = compositeDataUrl;
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        if (uploadData.imageUrl) finalUrl = uploadData.imageUrl;
      }

      stopProgressAnimation();
      await new Promise((r) => setTimeout(r, 500));
      setResult(finalUrl);
    } catch (err) {
      stopProgressAnimation();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startProgressAnimation, stopProgressAnimation]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
    setProgress(0);
    setLoadingMessage(LOADING_MESSAGES[0]);
  }, []);

  return { loading, result, error, loadingMessage, progress, generate, reset };
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

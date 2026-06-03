'use client';

import { useRef, useState, useEffect } from 'react';
import AdManager from '@/components/AdManager';

export default function AdToolSlot({ position, toolId }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div ref={ref} style={{ margin: '24px 0', minHeight: 90 }}>
      {ready && (
        <AdManager
          location={
            position === 'top'
              ? 'content_top'
              : position === 'mid'
              ? 'in_tool'
              : 'mid_result'
          }
          toolId={toolId}
        />
      )}
    </div>
  );
}
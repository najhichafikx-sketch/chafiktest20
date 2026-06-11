'use client';

import { useEffect, useRef, useState, startTransition } from 'react';
import { useAdController } from '@/hooks/useAdController';

const DEFAULT_SIZES = {
  bannerTop: { desktop: [728, 90], mobile: [320, 100] },
  bannerBottom: { desktop: [728, 90], mobile: [320, 100] },
  bannerInContent: { desktop: [728, 90], mobile: [300, 250] }
};

function pickSize(adType, isMobile) {
  const cfg = DEFAULT_SIZES[adType] || DEFAULT_SIZES.bannerTop;
  return isMobile ? cfg.mobile : cfg.desktop;
}

export default function SmartAdSlot({
  slot = 'site-top',
  adType = 'bannerTop',
  network = 'auto',
  label = 'Sponsored',
  className = '',
  lazy = true
}) {
  const { ready, canShow, loadBanner, recordClick } = useAdController();
  const ref = useRef(null);
  const [visible, setVisible] = useState(!lazy);
  const [loaded, setLoaded] = useState(false);
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    if (!ready) return;
    startTransition(() => setAllowed(canShow(adType)));
  }, [ready, adType, canShow]);

  useEffect(() => {
    if (!lazy || visible || !ref.current) return;
    if (typeof IntersectionObserver === 'undefined') { startTransition(() => setVisible(true)); return; }
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { startTransition(() => setVisible(true)); obs.disconnect(); break; }
      }
    }, { rootMargin: '200px' });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [lazy, visible]);

  useEffect(() => {
    if (!ready || !allowed || !visible || !ref.current || loaded) return;
    const cleanup = loadBanner(ref.current, slot, { adType, network });
    setLoaded(true);
    return cleanup;
  }, [ready, allowed, visible, loaded, slot, adType, network, loadBanner]);

  const handleClick = () => recordClick(adType, slot, network);

  if (!allowed) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [w, h] = pickSize(adType, isMobile);

  return (
    <div
      data-smart-ad-slot={slot}
      data-ad-type={adType}
      onClickCapture={handleClick}
      className={className}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '14px 0',
        minHeight: h
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: '#64748b',
          fontWeight: 600,
          marginBottom: 6
        }}
      >
        {label}
      </span>
      <div
        ref={ref}
        style={{
          width: '100%',
          maxWidth: w,
          minHeight: h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(99,102,241,0.04)',
          border: '1px dashed rgba(99,102,241,0.18)',
          borderRadius: 8
        }}
      />
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function CustomBanner({ size = 'leaderboard', href = '/pricing', title = 'Unlock Pro — Unlimited AI Generations', subtitle = 'Get 50% off this week • No credit card needed', cta = 'Get Started' }) {
  const sizes = {
    leaderboard: { w: 728, h: 90, fontSize: 18, subFont: 12 },
    rectangle: { w: 300, h: 250, fontSize: 16, subFont: 12 },
    mobile: { w: 320, h: 50, fontSize: 14, subFont: 11 },
  };
  const s = sizes[size] || sizes.leaderboard;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 8px', width: '100%' }}>
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          width: '100%',
          maxWidth: s.w,
          minHeight: s.h,
          padding: size === 'mobile' ? '8px 14px' : '14px 24px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
          color: '#fff',
          textDecoration: 'none',
          boxShadow: '0 10px 30px -10px rgba(99,102,241,0.6)',
          border: '1px solid rgba(255,255,255,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: '40%', width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1, flex: 1, minWidth: 0 }}>
          <div style={{ width: s.h - 20, height: s.h - 20, minWidth: s.h - 20, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: s.h * 0.4, backdropFilter: 'blur(10px)' }}>
            🚀
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: s.fontSize, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title}
            </div>
            {size !== 'mobile' && (
              <div style={{ fontSize: s.subFont, fontWeight: 500, opacity: 0.92, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: size === 'mobile' ? '6px 12px' : '10px 18px', background: '#fff', color: '#6366F1', borderRadius: 8, fontSize: size === 'mobile' ? 11 : 13, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {cta} →
        </div>
      </Link>
    </div>
  );
}

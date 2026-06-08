'use client';

import { useEffect, useState, useCallback } from 'react';

export default function ButtonCountdown() {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(3);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const showCountdown = useCallback((e) => {
    let target = e.target;
    while (target && target !== document.body) {
      if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button' || target.classList.contains('btn') || target.closest('button')) {
        const rect = target.getBoundingClientRect();
        setPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        setCount(3);
        setVisible(true);
        return;
      }
      target = target.parentElement;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', showCountdown);
    return () => document.removeEventListener('click', showCountdown);
  }, [showCountdown]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    const timeout = setTimeout(() => { setVisible(false); setCount(3); }, 3200);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.15s ease'
      }} />
      <div style={{
        position: 'relative', width: 100, height: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(13,13,15,0.85)', borderRadius: 16,
        border: '1px solid rgba(212,168,39,0.3)',
        boxShadow: '0 0 40px rgba(212,168,39,0.15), 0 0 80px rgba(99,102,241,0.08)',
        animation: 'countPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'none'
      }}>
        <span style={{
          fontSize: '2.5rem', fontWeight: 800,
          color: count > 0 ? 'var(--neon-cyan, #6c63ff)' : 'var(--neon-green, #22c55e)',
          textShadow: count > 0 ? '0 0 20px rgba(99,102,241,0.5)' : '0 0 20px rgba(34,197,94,0.5)',
          transition: 'all 0.2s'
        }}>
          {count > 0 ? count : '✓'}
        </span>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes countPop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

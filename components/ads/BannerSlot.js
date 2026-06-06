'use client';

import { useEffect, useRef, useState } from 'react';

const ADSTERRA_KEY = 'a64a753a91e1df2d14eac4534cea9820';
const MONETAG_PUSH_ZONE = '11103150';
const MONETAG_ONCLICK_ZONE = '11103201';

const ADSTERRA_CDNS = [
  'https://cdns.gtagserv.com',
  'https://www.highperformanceformat.com',
  'https://www.profitabledisplaynetwork.com',
];

const POPUP_KEY = 'chafik_popup_ts';
const POPUP_TURN_KEY = 'chafik_popup_turn';
const POPUP_LIMIT = 3 * 60 * 60 * 1000;
const POPUP_DELAY = 1200;

function loadAdsterra(container) {
  if (!container) return;
  let idx = 0;
  let stopped = false;
  let timeoutId;

  const cleanup = () => {
    container.innerHTML = '';
    if (timeoutId) clearTimeout(timeoutId);
  };

  const tryNext = () => {
    if (stopped || idx >= ADSTERRA_CDNS.length) return;
    const cdn = ADSTERRA_CDNS[idx++];
    const config = document.createElement('script');
    config.type = 'text/javascript';
    config.text = `window.atOptions={'key':'${ADSTERRA_KEY}','format':'iframe','height':250,'width':300,'params':{}};`;
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = `${cdn}/${ADSTERRA_KEY}/invoke.js`;
    s.async = false;
    s.dataset.cfasync = 'false';
    s.onerror = () => { if (stopped) return; cleanup(); tryNext(); };
    s.onload = () => {
      if (stopped) return;
      timeoutId = window.setTimeout(() => {
        if (!container.querySelector('iframe')) { cleanup(); tryNext(); }
      }, 2500);
    };
    container.appendChild(config);
    container.appendChild(s);
  };

  tryNext();
  return () => { stopped = true; cleanup(); };
}

function loadMonetagOnclick() {
  const s = document.createElement('script');
  s.dataset.zone = MONETAG_ONCLICK_ZONE;
  s.src = 'https://al5sm.com/tag.min.js';
  (document.body || document.documentElement).appendChild(s);
}

function canShowPopup() {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  if (path === '/') return false;
  if (path.startsWith('/blog') || path.startsWith('/prompts')) return false;
  if (window.__isUploading) return false;
  const last = Number(window.localStorage.getItem(POPUP_KEY) || 0);
  return !last || Date.now() - last > POPUP_LIMIT;
}

function markPopupShown() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(POPUP_KEY, String(Date.now()));
}

function nextTurn() {
  if (typeof window === 'undefined') return 'adsterra';
  const cur = window.localStorage.getItem(POPUP_TURN_KEY) || 'adsterra';
  const next = cur === 'adsterra' ? 'monetag' : 'adsterra';
  window.localStorage.setItem(POPUP_TURN_KEY, next);
  return cur;
}

function showPopup() {
  if (!canShowPopup()) return;
  const turn = nextTurn();

  const overlay = document.createElement('div');
  overlay.id = 'chafik-ad-popup';
  Object.assign(overlay.style, {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  const close = () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 200ms';
    setTimeout(() => overlay.remove(), 220);
  };

  const card = document.createElement('div');
  Object.assign(card.style, {
    background: '#fff', borderRadius: 12, padding: 16,
    maxWidth: 360, width: '92%', position: 'relative',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
  });

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  Object.assign(closeBtn.style, {
    position: 'absolute', top: 8, right: 10, fontSize: 22,
    border: 'none', background: 'none', cursor: 'pointer', lineHeight: 1,
  });
  closeBtn.onclick = close;

  const slot = document.createElement('div');
  slot.id = turn === 'adsterra' ? 'chafik-popup-adsterra' : 'chafik-popup-monetag';
  Object.assign(slot.style, { width: 300, minHeight: 250, margin: '0 auto' });

  const tag = document.createElement('div');
  tag.innerHTML = 'Sponsored';
  Object.assign(tag.style, {
    fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
    color: '#64748b', fontWeight: 600, textAlign: 'center', marginBottom: 8,
  });

  const overlay2 = document.createElement('div');
  overlay2.onclick = close;
  Object.assign(overlay2.style, { position: 'absolute', inset: 0 });

  card.appendChild(closeBtn);
  card.appendChild(tag);
  card.appendChild(slot);
  overlay.appendChild(overlay2);
  overlay.appendChild(card);
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
  document.body.appendChild(overlay);

  if (turn === 'adsterra') {
    loadAdsterra(slot);
  } else {
    slot.appendChild(Object.assign(document.createElement('div'), { style: 'min-height:250px;display:flex;align-items:center;justify-content:center;color:#475569;font-size:0.85rem;text-align:center;padding:12px' }));
    loadMonetagOnclick();
  }

  markPopupShown();
}

function bindToolButtons() {
  if (typeof window === 'undefined') return;
  if (window.__chafikBtnBound) return;
  window.__chafikBtnBound = true;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tool-btn, .generate-btn, [data-tool-action]');
    if (!btn) return;
    setTimeout(() => {
      if (canShowPopup()) showPopup();
    }, POPUP_DELAY);
  }, true);
}

export default function BannerSlot({ slotId = 'site-top' }) {
  const adsterraRef = useRef(null);
  const monetagRef = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__bannerSlotsLoaded === undefined) window.__bannerSlotsLoaded = {};
    if (window.__bannerSlotsLoaded[slotId]) return;
    window.__bannerSlotsLoaded[slotId] = true;
    setShow(true);
    bindToolButtons();
  }, [slotId]);

  useEffect(() => {
    if (!show || !adsterraRef.current) return;
    const cleanup = loadAdsterra(adsterraRef.current);
    return cleanup;
  }, [show]);

  useEffect(() => {
    if (!show || !monetagRef.current) return;
    const s = document.createElement('script');
    s.src = 'https://nap5k.com/tag.min.js';
    s.async = true;
    s.dataset.zone = '11103207';
    s.dataset.cfasync = 'false';
    monetagRef.current.appendChild(s);
  }, [show]);

  if (!show) return null;

  return (
    <div
      style={{
        paddingTop: '84px',
        paddingBottom: '14px',
        background: 'rgba(99,102,241,0.03)',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '0 16px',
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: '#64748b',
            fontWeight: 600,
          }}
        >
          Sponsored
        </span>
        <div
          ref={adsterraRef}
          data-adsterra-slot={slotId}
          style={{ width: 728, maxWidth: '100%', minHeight: 90 }}
        />
        <div
          ref={monetagRef}
          data-monetag-slot={slotId}
          style={{ minHeight: 60 }}
        />
      </div>
    </div>
  );
}

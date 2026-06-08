'use client';

import { useState, useRef, useCallback } from 'react';

const THUMBNAIL_PLACEHOLDERS = [
  'https://picsum.photos/seed/thumb1/320/180',
  'https://picsum.photos/seed/thumb2/320/180',
  'https://picsum.photos/seed/thumb3/320/180',
  'https://picsum.photos/seed/thumb4/320/180',
  'https://picsum.photos/seed/thumb5/320/180',
  'https://picsum.photos/seed/thumb6/320/180',
  'https://picsum.photos/seed/thumb7/320/180',
  'https://picsum.photos/seed/thumb8/320/180',
];

const STYLES = [
  { value: 'cinematic', label: 'سينمائي', emoji: '🎬' },
  { value: 'vlog', label: 'فلوق', emoji: '🎥' },
  { value: 'gaming', label: 'ألعاب', emoji: '🎮' },
];

export default function ThumbnailGeneratorPage() {
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [faceImage, setFaceImage] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFaceUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaceImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFacePreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('user_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/thumbnail-generator', {
        method: 'POST',
        headers,
        body: JSON.stringify({ topic: topic.trim(), style, faceImage: facePreview }),
      });
      const data = await res.json();
      setResult(data.success ? data : { error: data.error || 'فشل التوليد' });
    } catch {
      setResult({ error: 'خطأ في الشبكة' });
    } finally {
      setLoading(false);
    }
  }, [topic, style, facePreview]);

  return (
    <main dir="rtl" className="min-h-screen overflow-x-hidden" style={{
      background: '#050a14',
      color: '#f8fafc',
      fontFamily: "'Cairo', 'Inter', sans-serif",
    }}>
      {/* ===== Dot Grid Texture Overlay ===== */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* ===== Aurora Glow ===== */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0 rounded-full" style={{
        background: 'radial-gradient(circle, rgba(255,214,51,0.06), transparent 70%)',
        filter: 'blur(120px)',
      }} />

      {/* ===== MARQUEE ===== */}
      <section className="relative z-10 py-6">
        <div className="relative overflow-hidden">
          <div className="flex gap-4 animate-marquee" style={{ width: 'max-content' }}>
            {[...THUMBNAIL_PLACEHOLDERS, ...THUMBNAIL_PLACEHOLDERS].map((url, i) => (
              <div key={i} className="shrink-0 rounded-2xl overflow-hidden" style={{
                width: 280, height: 158,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 right-0 w-32 pointer-events-none z-10" style={{
            background: 'linear-gradient(to left, #050a14, transparent)'
          }} />
          <div className="absolute inset-y-0 left-0 w-32 pointer-events-none z-10" style={{
            background: 'linear-gradient(to right, #050a14, transparent)'
          }} />
        </div>
      </section>

      {/* ===== STATS ROW ===== */}
      <section className="relative z-10 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: '🖼️', value: '1', label: 'الإنشاءات' },
            { icon: '⚡', value: '80', label: 'النقاط' },
            { icon: '👤', value: '0', label: 'الشخصيات' },
            { icon: '🎨', value: '0', label: 'لوحات الألوان' },
          ].map((card, i) => (
            <div key={i} className="rounded-2xl p-4 md:p-5 text-center transition-all duration-300 hover:translate-y-[-2px]" style={{
              background: '#080c1a',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div className="text-2xl md:text-3xl mb-1">{card.icon}</div>
              <div className="text-xl md:text-2xl font-extrabold tracking-tight" style={{ color: '#f8fafc' }}>{card.value}</div>
              <div className="text-xs md:text-sm mt-0.5" style={{ color: '#94a3b8' }}>{card.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECTION DIVIDER ===== */}
      <div className="relative z-10 max-w-5xl mx-auto my-8 px-4">
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03) 30%, rgba(218,30,40,0.4) 50%, rgba(255,255,255,0.03) 70%, transparent)',
        }} />
      </div>

      {/* ===== MAIN ACTION CARD ===== */}
      <section className="relative z-10 px-4 pb-12 max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl p-1" style={{
          background: 'linear-gradient(135deg, rgba(218,30,40,0.15), transparent 30%, transparent 70%, rgba(218,30,40,0.15))',
        }}>
          <div className="relative rounded-[1.4rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8" style={{
            background: '#080c1a',
          }}>
            {/* subtle red glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none" style={{
              background: 'radial-gradient(circle, rgba(218,30,40,0.08), transparent 70%)',
            }} />

            {/* right side - icon + text */}
            <div className="flex items-center gap-4 flex-1 z-10">
              <div className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl" style={{
                background: '#0a0f1d',
                border: '1px solid rgba(255,214,51,0.15)',
                boxShadow: '0 0 24px rgba(255,214,51,0.08)',
              }}>
                ✨
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-wider" style={{
                  background: 'rgba(255,214,51,0.1)',
                  color: '#ffd633',
                }}>
                  AI POWERED ⚡
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold leading-tight" style={{
                  color: '#f8fafc',
                  fontFamily: "'Cairo', sans-serif",
                }}>
                  إنشاء صورة مصغرة
                </h2>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: '#94a3b8', maxWidth: 360 }}>
                  أنشئ صور مصغرة احترافية بالذكاء الاصطناعي في ثوان باستخدام هوية علامتك.
                </p>
              </div>
            </div>

            {/* left side - button with glow */}
            <div className="shrink-0 z-10">
              <button onClick={() => setShowModal(true)}
                className="relative group px-8 py-4 rounded-2xl text-base font-bold transition-all duration-500 overflow-hidden"
                style={{
                  background: '#ffd633',
                  color: '#000000',
                  boxShadow: '0 4px 24px rgba(255,214,51,0.25)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(255,214,51,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,214,51,0.25)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  ابدأ الآن
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(12px)',
        }}>
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden animate-fade-in-up" style={{
            background: '#0a0f1d',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}>
            {/* ===== Modal header ===== */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">🖼️</span>
                <h3 className="text-lg font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>مصمم الصور المصغرة</h3>
              </div>
              <button onClick={() => { setShowModal(false); setResult(null); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8' }}>
                ✕
              </button>
            </div>

            {/* ===== Modal body ===== */}
            <div className="p-6 space-y-5">
              {/* Topic */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>موضوع الفيديو</label>
                <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={2}
                  placeholder="مثال: مراجعة آيفون 16 برو"
                  className="w-full rounded-2xl px-4 py-3 text-sm resize-none transition-all"
                  style={{
                    background: '#050a14',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#f8fafc',
                    fontFamily: "'Cairo', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,214,51,0.3)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>

              {/* Style selector */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>النمط البصري</label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLES.map(s => (
                    <button key={s.value} onClick={() => setStyle(s.value)}
                      className="py-3 rounded-2xl text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1"
                      style={style === s.value ? {
                        background: 'rgba(255,214,51,0.1)',
                        border: '1px solid rgba(255,214,51,0.3)',
                        color: '#ffd633',
                      } : {
                        background: '#050a14',
                        border: '1px solid rgba(255,255,255,0.04)',
                        color: '#64748b',
                      }}>
                      <span className="text-lg">{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Face upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>صورة مرجعية للشخصية (اختياري)</label>
                <button onClick={() => fileRef.current?.click()}
                  className="w-full rounded-2xl p-4 text-center border-2 border-dashed transition-all duration-200"
                  style={{
                    borderColor: facePreview ? 'rgba(255,214,51,0.2)' : 'rgba(255,255,255,0.06)',
                    background: facePreview ? 'rgba(255,214,51,0.03)' : 'transparent',
                  }}>
                  {facePreview ? (
                    <div className="flex items-center gap-3 justify-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,214,51,0.2)' }}>
                        <img src={facePreview} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm" style={{ color: '#94a3b8' }}>تم الرفع — اضغط للتغيير</span>
                    </div>
                  ) : (
                    <div className="text-sm" style={{ color: '#64748b' }}>
                      <span className="text-2xl block mb-1">📷</span>
                      اضغط لرفع صورة الوجه
                    </div>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFaceUpload} />
              </div>

              {/* Generate button */}
              <button onClick={handleGenerate} disabled={loading || !topic.trim()}
                className="w-full py-3.5 rounded-2xl text-base font-bold transition-all duration-300 flex items-center justify-center gap-2"
                style={loading || !topic.trim() ? {
                  background: 'rgba(255,214,51,0.08)',
                  color: '#64748b',
                  cursor: 'not-allowed',
                } : {
                  background: '#ffd633',
                  color: '#000000',
                  boxShadow: '0 4px 20px rgba(255,214,51,0.2)',
                }}>
                {loading ? (
                  <>
                    <span className="inline-block w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{
                      borderColor: '#000000 transparent transparent transparent',
                    }} />
                    جاري التوليد...
                  </>
                ) : 'توليد الصورة المصغرة'}
              </button>

              {/* Result */}
              {result && (
                <div className="rounded-2xl p-5 animate-fade-in-up" style={{
                  background: '#050a14',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  {result.error ? (
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#ef4444' }}>
                      <span>❌</span>
                      <span>{result.error}</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#10b981' }}>
                        <span>✅</span>
                        <span>تم التوليد بنجاح</span>
                      </div>
                      <div className="text-sm leading-relaxed p-4 rounded-xl" style={{
                        background: '#080c1a',
                        color: '#94a3b8',
                        border: '1px solid rgba(255,255,255,0.03)',
                        direction: 'ltr',
                        textAlign: 'left',
                      }}>
                        {result.prompt}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== Animations ===== */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease forwards;
        }
      `}</style>
    </main>
  );
}

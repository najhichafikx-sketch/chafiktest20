'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Sparkles,
  ChevronDown,
  Image,
  FileText,
  UserPlus,
  Palette,
  Bell,
  Info,
  LayoutGrid,
  Plus,
} from 'lucide-react';

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

  const STYLES = [
    { value: 'cinematic', label: 'سينمائي', emoji: '🎬' },
    { value: 'vlog', label: 'فلوق', emoji: '🎥' },
    { value: 'gaming', label: 'ألعاب', emoji: '🎮' },
  ];

  return (
    <div dir="rtl" className="min-h-screen flex bg-[#0B0E14] text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* ===== RIGHT SIDEBAR ===== */}
      <aside className="w-[350px] shrink-0 bg-[#10131A] border-l border-white/5 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <h2 className="text-lg font-bold">لوحة التحكم</h2>

          {/* Section 1: Text Input */}
          <div className="bg-[#1A1D24] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-1.5 text-sm text-gray-300 bg-[#0B0E14] rounded-lg px-3 py-1.5">
                عنوان
                <ChevronDown size={14} />
              </button>
              <span className="text-xs text-gray-500">0/1000</span>
            </div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="اكتب عنوان الفيديو... (استخدم @ للإشارة للصور)"
              rows={3}
              className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none"
            />
          </div>

          {/* Section 2: References */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText size={16} className="text-gray-400" />
                المراجع
              </div>
              <span className="text-xs text-gray-500">0/10</span>
            </div>
            <button className="w-full border-2 border-dashed border-[#EAB308]/40 rounded-xl py-3 text-sm text-[#EAB308] flex items-center justify-center gap-2 bg-transparent hover:bg-[#EAB308]/5 transition-colors">
              <Plus size={16} />
              إضافة مرجع (ستايل / ملحقات)
            </button>
          </div>

          {/* Section 3: Character & Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-xs text-gray-400 block">الشخصية</span>
              <button className="w-full bg-[#1A1D24] rounded-xl py-8 flex flex-col items-center gap-2 text-sm text-gray-400 hover:bg-[#1A1D24]/80 transition-colors">
                <UserPlus size={24} className="text-gray-500" />
                إضافة شخصية
              </button>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-gray-400 block">الألوان</span>
              <button className="w-full bg-[#1A1D24] rounded-xl py-8 flex flex-col items-center gap-2 text-sm text-gray-400 hover:bg-[#1A1D24]/80 transition-colors">
                <Palette size={24} className="text-gray-500" />
                إضافة ألوان
              </button>
            </div>
          </div>

          {/* Section 4: Settings */}
          <div className="space-y-4">
            <div>
              <span className="text-xs text-gray-400 block mb-2">الموديل</span>
              <button className="flex items-center gap-1.5 text-sm text-gray-300 bg-[#1A1D24] rounded-lg px-3 py-1.5">
                ThumPure SDXL
                <ChevronDown size={14} />
              </button>
            </div>
            <div>
              <span className="text-xs text-gray-400 block mb-2">الأبعاد</span>
              <div className="flex gap-2">
                <button className="bg-[#1A1D24] rounded-lg px-3 py-1.5 text-xs text-gray-500">1:1</button>
                <button className="bg-[#EAB308] rounded-lg px-3 py-1.5 text-xs text-black font-semibold">16:9</button>
                <button className="bg-[#1A1D24] rounded-lg px-3 py-1.5 text-xs text-gray-500">9:16</button>
                <button className="bg-[#1A1D24] rounded-lg px-3 py-1.5 text-xs text-gray-500">4:5</button>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom action */}
        <div className="p-6 border-t border-white/5 space-y-3">
          <p className="text-sm text-gray-400 text-center">
            التكلفة المقدرة: <span className="text-[#EAB308] font-semibold">20 نقطة</span>
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-[#EAB308] hover:bg-[#EAB308]/90 text-black font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles size={18} />
            إنشاء
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex flex-col bg-[#0B0E14] min-h-screen overflow-y-auto">

        {/* Top Navbar */}
        <nav className="flex items-center justify-between p-6 border-b border-white/5">
          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#EAB308] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">T</span>
            </div>
            <span className="text-lg font-bold">ThumPure</span>
          </div>
          {/* Left side */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EAB308] to-[#EAB308]/50 p-0.5">
              <div className="w-full h-full rounded-full bg-[#1A1D24] flex items-center justify-center text-sm font-bold text-white">
                N
              </div>
            </div>
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="bg-white text-black text-sm font-semibold rounded-xl px-4 py-2 hover:bg-white/90 transition-colors">
              ترقية
            </button>
            <button className="bg-[#1A1D24] text-gray-300 text-sm rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-[#1A1D24]/80 transition-colors">
              <Info size={16} />
              دليل الاستخدام
            </button>
          </div>
        </nav>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-4xl bg-[#10131A] border border-white/5 rounded-2xl flex flex-col items-center justify-center py-24 px-8">
            <div className="w-16 h-16 bg-[#1A1D24] rounded-2xl flex items-center justify-center mb-6 relative">
              <Sparkles size={28} className="text-[#EAB308]" />
              <div className="absolute inset-0 rounded-2xl bg-[#EAB308]/5 blur-xl"></div>
            </div>
            <h1 className="text-2xl font-bold mb-2">جاهز للإبداع</h1>
            <p className="text-gray-500 text-sm text-center max-w-md">
              قم بضبط الإعدادات على اليمين لإنشاء الصورة المصغرة التالية.
            </p>
          </div>
        </div>

        {/* Bottom: Latest Designs */}
        <div className="px-8 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid size={18} className="text-gray-400" />
            <h3 className="text-sm font-semibold">أحدث التصاميم</h3>
          </div>
          <div className="w-full border-2 border-dashed border-white/10 rounded-2xl py-12 flex items-center justify-center">
            <p className="text-gray-600 text-sm">لا يوجد سجل بعد، ابدأ الإبداع الآن!</p>
          </div>
        </div>
      </main>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(12px)',
        }}>
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden" style={{
            background: '#10131A',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}>
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

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>موضوع الفيديو</label>
                <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={2}
                  placeholder="مثال: مراجعة آيفون 16 برو"
                  className="w-full rounded-2xl px-4 py-3 text-sm resize-none transition-all focus:outline-none"
                  style={{
                    background: '#0B0E14',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#f8fafc',
                    fontFamily: "'Cairo', sans-serif",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>النمط البصري</label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLES.map(s => (
                    <button key={s.value} onClick={() => setStyle(s.value)}
                      className="py-3 rounded-2xl text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1"
                      style={style === s.value ? {
                        background: 'rgba(234,179,8,0.1)',
                        border: '1px solid rgba(234,179,8,0.3)',
                        color: '#EAB308',
                      } : {
                        background: '#0B0E14',
                        border: '1px solid rgba(255,255,255,0.04)',
                        color: '#64748b',
                      }}>
                      <span className="text-lg">{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>صورة مرجعية للشخصية (اختياري)</label>
                <button onClick={() => fileRef.current?.click()}
                  className="w-full rounded-2xl p-4 text-center border-2 border-dashed transition-all duration-200"
                  style={{
                    borderColor: facePreview ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.06)',
                    background: facePreview ? 'rgba(234,179,8,0.03)' : 'transparent',
                  }}>
                  {facePreview ? (
                    <div className="flex items-center gap-3 justify-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(234,179,8,0.2)' }}>
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

              <button onClick={handleGenerate} disabled={loading || !topic.trim()}
                className="w-full py-3.5 rounded-2xl text-base font-bold transition-all duration-300 flex items-center justify-center gap-2"
                style={loading || !topic.trim() ? {
                  background: 'rgba(234,179,8,0.08)',
                  color: '#64748b',
                  cursor: 'not-allowed',
                } : {
                  background: '#EAB308',
                  color: '#000000',
                  boxShadow: '0 4px 20px rgba(234,179,8,0.2)',
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

              {result && (
                <div className="rounded-2xl p-5" style={{
                  background: '#0B0E14',
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
                        background: '#10131A',
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
    </div>
  );
}

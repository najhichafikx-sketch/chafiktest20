'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Download, RotateCcw, Wand2, Image as ImageIcon } from 'lucide-react';

const STATUS_STEPS = [
  { emoji: '🎨', text: 'جاري توليد الخلفية...' },
  { emoji: '✂️', text: 'جاري إزالة الخلفية...' },
  { emoji: '✨', text: 'جاري تطبيق التأثيرات...' },
  { emoji: '🖼️', text: 'جاري تركيب الطبقات...' },
  { emoji: '🎯', text: 'اللمسات الأخيرة...' },
];

export default function CanvasPreview({ loading, loadingMessage, result, onDownload, onRedo, progress }) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!loading) { setStepIdx(0); return; }
    const t = setInterval(() => setStepIdx(i => (i + 1) % STATUS_STEPS.length), 2500);
    return () => clearInterval(t);
  }, [loading]);

  return (
    <main className="flex-1 flex flex-col bg-[#0B0E14] min-h-screen overflow-y-auto">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="text-xl font-bold text-white tracking-tight">ThumPure</span>
          <div className="w-6 h-6 rounded-md flex items-center justify-center border-2 border-[#EAB308]">
            <div className="w-2.5 h-2.5 bg-[#EAB308] rounded-[2px]"></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-[#1A1D24] text-gray-300 text-sm font-medium rounded-full px-5 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors border border-white/5">
            <Wand2 size={15} className="text-[#EAB308]" />
            دليل الاستخدام
          </button>
          <button className="bg-white text-black text-sm font-bold rounded-full px-6 py-2 hover:bg-gray-200 transition-colors">
            ترقية
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 border-2 border-[#EAB308] overflow-hidden p-[2px] cursor-pointer">
            <div className="w-full h-full rounded-full bg-[#1A1D24]" />
          </div>
        </div>
      </nav>

      {/* Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 pt-0">
        <div className="w-full max-w-5xl aspect-video bg-[#10131A] border border-white/5 rounded-[1.75rem] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-500">
          {loading ? (
            <div className="flex flex-col items-center px-8 w-full max-w-sm">
              <div className="w-16 h-16 border-4 border-[#1A1D24] border-t-[#EAB308] rounded-full animate-spin mb-6" />
              <div className="w-full mb-5">
                <div className="h-1.5 rounded-full bg-[#1A1D24] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500 bg-[#EAB308]" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-lg">{STATUS_STEPS[stepIdx].emoji}</span>
                <p className="text-sm text-gray-300 font-medium">{STATUS_STEPS[stepIdx].text}</p>
              </div>
              <p className="text-[11px] text-gray-600">قد تستغرق العملية بضع ثوانٍ</p>
            </div>
          ) : result ? (
            <div className="w-full h-full p-5 animate-in fade-in zoom-in duration-500">
              <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 relative group bg-[#0B0E14]">
                <img src={result} alt="Generated Thumbnail" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-300">
                  <button onClick={onDownload} className="bg-[#EAB308] hover:bg-[#FACC15] text-black font-bold px-8 py-3 rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 shadow-xl">
                    <Download size={18} /> تحميل الصورة
                  </button>
                  <button onClick={onRedo} className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-white/10">
                    <RotateCcw size={18} /> إعادة
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center animate-in fade-in duration-1000">
              <div className="w-20 h-20 bg-[#1A1D24] rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner border border-white/5 relative group cursor-pointer hover:border-[#EAB308]/30 transition-colors">
                <Sparkles size={32} className="text-[#EAB308] group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-[#EAB308]/5 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-white tracking-tight">جاهز للإبداع</h1>
              <p className="text-gray-500 text-sm max-w-[280px] leading-relaxed">
                قم بضبط الإعدادات على اليمين لإنشاء الصورة المصغرة التالية.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Designs */}
      <div className="px-8 pb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-4 justify-end">
          <h3 className="text-sm font-bold text-white">أحدث التصاميم</h3>
          <ImageIcon size={15} className="text-[#EAB308]" />
        </div>
        <div className="w-full border border-dashed border-white/10 bg-[#10131A]/30 rounded-2xl py-14 flex items-center justify-center transition-colors hover:bg-[#10131A]/50 cursor-pointer">
          <p className="text-gray-600 text-sm font-medium">لا يوجد سجل بعد، ابدأ الإبداع الآن!</p>
        </div>
      </div>
    </main>
  );
}

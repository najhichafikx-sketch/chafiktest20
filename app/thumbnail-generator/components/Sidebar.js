'use client';

import { useState, useRef } from 'react';
import { Plus, UserPlus, Palette, ChevronDown, Image as ImageIcon, X, Sparkles } from 'lucide-react';

export default function Sidebar({
  title, onTitleChange, references, onReferencesChange,
  personImage, onPersonImageChange, colors, onColorsChange,
  model, onModelChange, dimension, onDimensionChange,
  onGenerate, loading, estimatedCost,
}) {
  const fileInputRef = useRef(null);
  const personInputRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleReferenceUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - (references?.length || 0);
    onReferencesChange?.([...(references || []), ...files.slice(0, remaining)]);
    e.target.value = '';
  };

  const handlePersonUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) onPersonImageChange?.(URL.createObjectURL(file));
    e.target.value = '';
  };

  const presetColors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#FFFFFF', '#6B7280'];

  return (
    <aside className="w-[340px] shrink-0 bg-[#10131A] border-r border-white/5 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">لوحة التحكم</h2>
          <div className="flex items-center gap-1 text-[10px] text-[#EAB308] bg-[#EAB308]/10 px-2 py-0.5 rounded-full border border-[#EAB308]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse" />
            جاهز
          </div>
        </div>

        {/* Title */}
        <div className="bg-[#1A1D24] border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">عنوان الفيديو</span>
            <span className="text-[10px] text-gray-600 font-mono">{title?.length || 0}/100</span>
          </div>
          <textarea
            value={title}
            onChange={(e) => e.target.value.length <= 100 && onTitleChange?.(e.target.value)}
            placeholder="اكتب عنوان الفيديو..."
            rows={3}
            className="w-full bg-[#0B0E14] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-[#EAB308]/30 transition-colors"
          />
        </div>

        {/* References */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon size={15} className="text-[#EAB308]" />
              <span className="text-sm font-bold text-white">المراجع</span>
            </div>
            <span className="text-[10px] bg-[#1A1D24] px-2 py-0.5 rounded text-gray-400 font-mono">{references?.length || 0}/10</span>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleReferenceUpload} hidden />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-[#EAB308]/30 rounded-xl py-3 text-sm text-[#EAB308] flex items-center justify-center gap-2 bg-transparent hover:bg-[#EAB308]/5 transition-colors font-medium"
          >
            <Plus size={16} /> إضافة مرجع
          </button>
          {references?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {references.map((ref, i) => (
                <div key={i} className="group relative w-16 h-10 rounded-lg overflow-hidden bg-[#0B0E14] border border-white/5">
                  <img src={URL.createObjectURL(ref)} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => onReferencesChange?.(references.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={8} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Person & Colors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-end gap-1.5 text-xs text-white font-bold">
              الشخصية <UserPlus size={13} className="text-[#EAB308]" />
            </div>
            <input ref={personInputRef} type="file" accept="image/*" onChange={handlePersonUpload} hidden />
            <button
              onClick={() => personInputRef.current?.click()}
              className="w-full bg-[#1A1D24] border border-white/5 rounded-xl py-3 flex items-center justify-center gap-2 text-sm text-gray-400 hover:bg-[#1A1D24]/80 transition-colors"
            >
              {personImage ? (
                <div className="w-6 h-6 rounded-full ring-2 ring-[#EAB308]/30 overflow-hidden">
                  <img src={personImage} alt="" className="w-full h-full object-cover" />
                </div>
              ) : <UserPlus size={16} />}
              {personImage ? 'تغيير' : 'إضافة شخصية'}
            </button>
          </div>
          <div className="space-y-2 relative">
            <div className="flex items-center justify-end gap-1.5 text-xs text-white font-bold">
              الألوان <Palette size={13} className="text-[#EAB308]" />
            </div>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full bg-[#1A1D24] border border-white/5 rounded-xl py-3 flex items-center justify-center gap-2 text-sm text-gray-400 hover:bg-[#1A1D24]/80 transition-colors"
            >
              {colors?.length > 0 ? (
                <div className="flex -space-x-1">
                  {colors.slice(0, 4).map((c, i) => <div key={i} className="w-4 h-4 rounded-full border border-[#1A1D24]" style={{ backgroundColor: c }} />)}
                </div>
              ) : <Palette size={16} />}
              {colors?.length > 0 ? `${colors.length} لون` : 'إضافة ألوان'}
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3 bg-[#1A1D24] border border-white/10 rounded-xl shadow-2xl shadow-black/50">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {presetColors.map((c) => (
                    <button key={c} onClick={() => { onColorsChange?.([...(colors || []), c]); }} className="w-6 h-6 rounded-full transition-transform hover:scale-110" style={{ backgroundColor: c, border: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent' }} />
                  ))}
                </div>
                <input type="color" onChange={(e) => onColorsChange?.([...(colors || []), e.target.value])} className="w-full h-6 rounded cursor-pointer" style={{ border: 'none', padding: 0, background: 'transparent' }} />
                {colors?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/5">
                    {colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B0E14]">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                        <span className="text-[9px] text-gray-500 font-mono">{c.slice(1)}</span>
                        <button onClick={() => onColorsChange?.(colors.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400"><X size={8} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
          <div>
            <span className="text-xs text-white font-bold block mb-2 flex items-center justify-between">
              الموديل <ChevronDown size={13} className="text-gray-500" />
            </span>
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full bg-[#1A1D24] border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-bold appearance-none cursor-pointer focus:outline-none focus:border-[#EAB308]/30"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
            >
              <option value="basic">Basic (20pts)</option>
              <option value="pro">Pro (50pts)</option>
              <option value="ultra">Ultra (100pts)</option>
            </select>
          </div>
          <div>
            <span className="text-xs text-white font-bold block mb-2 flex items-center justify-between">
              الأبعاد <ChevronDown size={13} className="text-[#EAB308]" />
            </span>
            <div className="flex gap-1">
              {['16:9', '9:16'].map((d) => (
                <button
                  key={d}
                  onClick={() => onDimensionChange?.(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold relative transition-all ${dimension === d ? 'bg-[#EAB308] text-black' : 'bg-[#1A1D24] text-gray-400 border border-white/5'}`}
                >
                  {d}
                  {d === '9:16' && <span className="absolute -top-2 -right-2 text-[7px] bg-red-600 text-white px-1 rounded-sm font-bold">NEW</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-5 border-t border-white/5 space-y-3 bg-[#10131A]">
        <div className="flex items-center justify-between text-sm px-1">
          <span className="text-[#EAB308] font-bold text-lg">{estimatedCost} <span className="text-gray-500 font-normal text-xs">نقطة</span></span>
          <span className="text-gray-400 text-xs font-medium">التكلفة المقدرة</span>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading || !title?.trim()}
          className="w-full bg-[#EAB308] disabled:bg-[#1A1D24] disabled:text-gray-600 hover:bg-[#FACC15] text-black font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#EAB308]/20 disabled:shadow-none"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
          ) : (
            <><Sparkles size={18} /> إنشاء</>
          )}
        </button>
      </div>
    </aside>
  );
}

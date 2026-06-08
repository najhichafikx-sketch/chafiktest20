'use client';

import { useState, useRef } from 'react';
import { FileText, Plus, UserPlus, Palette, ChevronDown, Image as ImageIcon, X } from 'lucide-react';

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

  const presetColors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#FFFFFF', '#9CA3AF'];

  return (
    <aside className="flex flex-col h-full" style={{ width: 300, backgroundColor: '#111114', borderRight: '1px solid #1e1e22' }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e1e22 transparent' }}>
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <FileText size={13} className="text-[#d4a827]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.5px]" style={{ color: '#9a9890' }}>Title</span>
            </div>
            <span className="text-[11px] font-mono" style={{ color: '#5a5a62' }}>{(title || '').length}/100</span>
          </div>
          <textarea
            value={title}
            onChange={(e) => e.target.value.length <= 100 && onTitleChange?.(e.target.value)}
            placeholder="Write your video title... (use @ to tag images)"
            rows={3}
            className="w-full text-[12px] rounded-lg resize-none outline-none transition-colors"
            style={{
              backgroundColor: '#0d0d0f',
              border: '1px solid #2a2a2e',
              padding: '10px 12px',
              color: '#e8e6e0',
            }}
          />
        </div>

        {/* References */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ImageIcon size={13} className="text-[#d4a827]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.5px]" style={{ color: '#9a9890' }}>References</span>
            </div>
            <span className="text-[11px] font-mono" style={{ color: '#5a5a62' }}>{(references?.length || 0)}/10</span>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleReferenceUpload} hidden />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] transition-colors"
            style={{ border: '1px dashed #2a2a2e', color: '#9a9890', backgroundColor: 'transparent' }}
            onMouseEnter={e => { e.target.style.borderColor = '#d4a827'; e.target.style.color = '#d4a827'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#2a2a2e'; e.target.style.color = '#9a9890'; }}
          >
            <Plus size={14} /> Add reference (style / assets)
          </button>
          {references?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {references.map((ref, i) => (
                <div key={i} className="group relative w-9 h-9 rounded overflow-hidden" style={{ border: '1px solid #2a2a2e', backgroundColor: '#0d0d0f' }}>
                  <img src={URL.createObjectURL(ref)} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => onReferencesChange?.(references.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={7} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Person & Colors */}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-end gap-1 mb-1.5">
              <span className="text-[10px] font-semibold" style={{ color: '#9a9890' }}>Person</span>
              <UserPlus size={12} className="text-[#d4a827]" />
            </div>
            <input ref={personInputRef} type="file" accept="image/*" onChange={handlePersonUpload} hidden />
            <button
              onClick={() => personInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] transition-colors"
              style={{ backgroundColor: '#0d0d0f', border: '1px solid #2a2a2e', color: '#5a5a62' }}
              onMouseEnter={e => { if (!personImage) { e.target.style.borderColor = '#d4a827'; e.target.style.color = '#d4a827'; }}}
              onMouseLeave={e => { if (!personImage) { e.target.style.borderColor = '#2a2a2e'; e.target.style.color = '#5a5a62'; }}}
            >
              {personImage ? (
                <div className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-[#d4a827]/30">
                  <img src={personImage} alt="" className="w-full h-full object-cover" />
                </div>
              ) : <UserPlus size={14} />}
              {personImage ? 'Change' : 'Add person'}
            </button>
          </div>
          <div className="flex-1 relative">
            <div className="flex items-center justify-end gap-1 mb-1.5">
              <span className="text-[10px] font-semibold" style={{ color: '#9a9890' }}>Colors</span>
              <Palette size={12} className="text-[#d4a827]" />
            </div>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] transition-colors"
              style={{ backgroundColor: '#0d0d0f', border: '1px solid #2a2a2e', color: '#5a5a62' }}
              onMouseEnter={e => { if (!colors?.length) { e.target.style.borderColor = '#d4a827'; e.target.style.color = '#d4a827'; }}}
              onMouseLeave={e => { if (!colors?.length) { e.target.style.borderColor = '#2a2a2e'; e.target.style.color = '#5a5a62'; }}}
            >
              {colors?.length > 0 ? (
                <div className="flex -space-x-1">
                  {colors.slice(0, 4).map((c, i) => <div key={i} className="w-3.5 h-3.5 rounded-full border border-[#0d0d0f]" style={{ backgroundColor: c }} />)}
                </div>
              ) : <Palette size={14} />}
              {colors?.length > 0 ? `${colors.length} colors` : 'Add colors'}
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3 rounded-xl shadow-2xl" style={{ backgroundColor: '#111114', border: '1px solid #2a2a2e' }}>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {presetColors.map((c) => (
                    <button key={c} onClick={() => onColorsChange?.([...(colors || []), c])}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                      style={{ backgroundColor: c, border: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent' }} />
                  ))}
                </div>
                <input type="color" onChange={(e) => onColorsChange?.([...(colors || []), e.target.value])}
                  className="w-full h-6 rounded cursor-pointer" style={{ border: 'none', padding: 0, background: 'transparent' }} />
                {colors?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 pt-2" style={{ borderTop: '1px solid #1e1e22' }}>
                    {colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ backgroundColor: '#0d0d0f' }}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                        <span className="text-[9px] font-mono" style={{ color: '#5a5a62' }}>{c.slice(1)}</span>
                        <button onClick={() => onColorsChange?.(colors.filter((_, j) => j !== i))} className="text-[#5a5a62] hover:text-red-400"><X size={8} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Model & Dimensions */}
        <div className="pt-3" style={{ borderTop: '1px solid #1e1e22' }}>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase" style={{ color: '#9a9890' }}>Model</span>
                <ChevronDown size={12} className="text-[#5a5a62]" />
              </div>
              <select
                value={model}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full text-[12px] font-semibold rounded-lg outline-none cursor-pointer appearance-none"
                style={{
                  backgroundColor: '#0d0d0f', border: '1px solid #2a2a2e', padding: '6px 8px',
                  color: '#e8e6e0',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px',
                }}
              >
                <option value="basic">Basic (20pts)</option>
                <option value="pro">Pro (50pts)</option>
                <option value="ultra">Ultra (100pts)</option>
              </select>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase" style={{ color: '#9a9890' }}>Dimensions</span>
                <ChevronDown size={12} className="text-[#d4a827]" />
              </div>
              <div className="flex gap-1">
                {['16:9', '9:16'].map((d) => (
                  <button key={d} onClick={() => onDimensionChange?.(d)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold relative transition-all`}
                    style={{
                      backgroundColor: dimension === d ? '#d4a827' : '#0d0d0f',
                      color: dimension === d ? '#0d0d0f' : '#5a5a62',
                      border: dimension === d ? 'none' : '1px solid #2a2a2e',
                    }}>
                    {d}
                    {d === '9:16' && <span className="absolute -top-2 -right-2 text-[7px] font-bold bg-[#e85c26] text-white px-1 rounded-sm">NEW</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-4" style={{ borderTop: '1px solid #1e1e22', backgroundColor: '#111114' }}>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <span className="text-base font-bold text-[#d4a827]">{estimatedCost} <span className="text-[11px] font-normal" style={{ color: '#5a5a62' }}>pts</span></span>
          <span className="text-[11px]" style={{ color: '#9a9890' }}>Estimated cost</span>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading || !title?.trim()}
          className="w-full py-3 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-all"
          style={{
            backgroundColor: loading || !title?.trim() ? '#1e1e22' : '#d4a827',
            color: loading || !title?.trim() ? '#5a5a62' : '#0d0d0f',
            cursor: loading ? 'wait' : !title?.trim() ? 'not-allowed' : 'pointer',
            boxShadow: !loading && title?.trim() ? '0 4px 24px rgba(212,168,39,0.25)' : 'none',
          }}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 rounded-full border-2 border-[#5a5a62] border-t-transparent animate-spin" />
          ) : <>
            <span>&#10025;</span> Create
          </>}
        </button>
      </div>
    </aside>
  );
}

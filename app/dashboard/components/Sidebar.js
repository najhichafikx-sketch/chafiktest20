'use client';

import { useState, useRef } from 'react';
import { FileText, Plus, UserPlus, Palette, ChevronDown, Image as ImageIcon } from 'lucide-react';

export default function Sidebar({
  title,
  onTitleChange,
  references,
  onReferencesChange,
  personImage,
  onPersonImageChange,
  colors,
  onColorsChange,
  model,
  onModelChange,
  dimension,
  onDimensionChange,
  onGenerate,
  loading,
  estimatedCost,
}) {
  const fileInputRef = useRef(null);
  const personInputRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleReferenceUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - (references?.length || 0);
    const toAdd = files.slice(0, remaining);
    onReferencesChange?.([...(references || []), ...toAdd]);
    e.target.value = '';
  };

  const handlePersonUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onPersonImageChange?.(url);
    }
    e.target.value = '';
  };

  const handleColorAdd = (color) => {
    onColorsChange?.([...(colors || []), color]);
    setShowColorPicker(false);
  };

  const presetColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff6600', '#ff00ff', '#00ffff', '#ffffff'];

  return (
    <aside style={{ width: 300, backgroundColor: '#111114', borderRight: '1px solid #1e1e22', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Section A - Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <FileText size={13} className="text-[#d4a827]" />
              <span style={{ color: '#9a9890', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</span>
            </div>
            <span style={{ color: '#5a5a62', fontSize: 11, fontFamily: 'monospace' }}>{(title || '').length}/100</span>
          </div>
          <textarea
            value={title}
            onChange={(e) => e.target.value.length <= 100 && onTitleChange?.(e.target.value)}
            placeholder="Write your video title... (use @ to tag images)"
            rows={3}
            style={{
              width: '100%',
              backgroundColor: '#0d0d0f',
              border: '1px solid #2a2a2e',
              borderRadius: 7,
              padding: '10px 12px',
              color: '#e8e6e0',
              fontSize: 12,
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>

        {/* Section B - References */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ImageIcon size={13} className="text-[#d4a827]" />
              <span style={{ color: '#9a9890', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>References</span>
            </div>
            <span style={{ color: '#5a5a62', fontSize: 11, fontFamily: 'monospace' }}>{(references?.length || 0)}/10</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleReferenceUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px]"
            style={{ border: '1px dashed #2a2a2e', color: '#9a9890', backgroundColor: 'transparent' }}
          >
            <Plus size={14} /> Add reference (style / assets)
          </button>
          {references?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {references.map((ref, i) => (
                <div key={i} className="w-9 h-9 rounded border border-[#2a2a2e] overflow-hidden" style={{ backgroundColor: '#0d0d0f' }}>
                  <img src={URL.createObjectURL(ref)} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section C - Person & Colors */}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-end gap-1 mb-1.5">
              <span style={{ color: '#9a9890', fontSize: 10, fontWeight: 600 }}>Person</span>
              <UserPlus size={12} className="text-[#d4a827]" />
            </div>
            <input
              ref={personInputRef}
              type="file"
              accept="image/*"
              onChange={handlePersonUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => personInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px]"
              style={{ backgroundColor: '#0d0d0f', border: '1px solid #2a2a2e', color: '#5a5a62' }}
            >
              {personImage ? (
                <img src={personImage} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <UserPlus size={14} />
              )}
              {personImage ? 'Change' : 'Add person'}
            </button>
          </div>
          <div className="flex-1" style={{ position: 'relative' }}>
            <div className="flex items-center justify-end gap-1 mb-1.5">
              <span style={{ color: '#9a9890', fontSize: 10, fontWeight: 600 }}>Colors</span>
              <Palette size={12} className="text-[#d4a827]" />
            </div>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px]"
              style={{ backgroundColor: '#0d0d0f', border: '1px solid #2a2a2e', color: '#5a5a62' }}
            >
              {colors?.length > 0 ? (
                <div className="flex gap-0.5">
                  {colors.slice(0, 3).map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
              ) : (
                <Palette size={14} />
              )}
              {colors?.length > 0 ? `${colors.length} colors` : 'Add colors'}
            </button>
            {showColorPicker && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, marginTop: 4, padding: 8, backgroundColor: '#0d0d0f', border: '1px solid #2a2a2e', borderRadius: 7 }}>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleColorAdd(c)}
                      className="w-6 h-6 rounded-full border border-[#2a2a2e]"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  onChange={(e) => handleColorAdd(e.target.value)}
                  className="w-full h-7 rounded cursor-pointer"
                  style={{ border: 'none', padding: 0, backgroundColor: 'transparent' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section D - Model & Dimensions */}
        <div className="pt-3" style={{ borderTop: '1px solid #1e1e22' }}>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: '#9a9890', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Model</span>
                <ChevronDown size={12} className="text-[#5a5a62]" />
              </div>
              <select
                value={model}
                onChange={(e) => onModelChange(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0d0d0f',
                  border: '1px solid #2a2a2e',
                  borderRadius: 7,
                  padding: '6px 8px',
                  color: '#e8e6e0',
                  fontSize: 12,
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="basic">Basic (20pts)</option>
                <option value="pro">Pro (50pts)</option>
                <option value="ultra">Ultra (100pts)</option>
              </select>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: '#9a9890', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Dimensions</span>
                <ChevronDown size={12} className="text-[#d4a827]" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onDimensionChange?.('16:9')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold ${dimension === '16:9' ? '' : ''}`}
                  style={{
                    backgroundColor: dimension === '16:9' ? '#d4a827' : '#0d0d0f',
                    color: dimension === '16:9' ? '#0d0d0f' : '#5a5a62',
                    border: dimension === '16:9' ? 'none' : '1px solid #2a2a2e',
                  }}
                >
                  16:9
                </button>
                <button
                  onClick={() => onDimensionChange?.('9:16')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold relative ${dimension === '9:16' ? '' : ''}`}
                  style={{
                    backgroundColor: dimension === '9:16' ? '#d4a827' : '#0d0d0f',
                    color: dimension === '9:16' ? '#0d0d0f' : '#5a5a62',
                    border: dimension === '9:16' ? 'none' : '1px solid #2a2a2e',
                  }}
                >
                  9:16
                  <span style={{ position: 'absolute', top: -6, right: -6, fontSize: 7, backgroundColor: '#e85c26', color: '#fff', padding: '1px 3px', borderRadius: 3 }}>NEW</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="p-4" style={{ borderTop: '1px solid #1e1e22', backgroundColor: '#111114' }}>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <span className="text-[#d4a827] font-bold text-base">{estimatedCost} <span className="text-[11px] font-normal text-[#5a5a62]">pts</span></span>
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
          }}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 rounded-full border-2 border-[#5a5a62] border-t-transparent animate-spin" />
          ) : (
            <>
              <span>&#10025;</span> Create
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

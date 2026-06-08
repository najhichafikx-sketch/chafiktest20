'use client';

import { Bell, Info } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="flex items-center justify-between px-6" style={{ height: 48, backgroundColor: '#0d0d0f', borderBottom: '1px solid #1e1e22' }}>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500" />
        <Bell size={15} className="text-[#5a5a62] cursor-pointer hover:text-[#e8e6e0] transition-colors" />
        <button className="px-3 py-1 rounded-lg text-[11px] font-bold" style={{ backgroundColor: '#d4a827', color: '#0d0d0f' }}>Upgrade</button>
        <button className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] border" style={{ color: '#9a9890', borderColor: '#2a2a2e' }}>
          <Info size={12} /> User guide
        </button>
      </div>
      <div className="flex items-center gap-1.5 cursor-pointer">
        <span className="text-sm font-bold" style={{ color: '#e8e6e0' }}>Thum</span>
        <span className="text-sm font-bold text-[#d4a827]">Pure</span>
        <div className="w-4 h-4 rounded border border-[#d4a827] flex items-center justify-center ml-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#d4a827' }} />
        </div>
      </div>
    </div>
  );
}

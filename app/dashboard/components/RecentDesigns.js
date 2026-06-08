'use client';

import { LayoutGrid } from 'lucide-react';

export default function RecentDesigns({ designs = [] }) {
  return (
    <div className="px-8 pb-8" style={{ backgroundColor: '#0d0d0f' }}>
      <div className="flex items-center gap-1.5 mb-3">
        <LayoutGrid size={14} className="text-[#d4a827]" />
        <h3 className="text-[11px] font-bold text-[#e8e6e0] uppercase tracking-wider">Recent Designs</h3>
      </div>
      {designs.length === 0 ? (
        <div
          className="w-full rounded-xl py-10 flex items-center justify-center"
          style={{ border: '1px dashed #2a2a2e', backgroundColor: 'rgba(17,17,20,0.5)' }}
        >
          <p className="text-[12px] font-medium" style={{ color: '#5a5a62' }}>No history yet. Start creating now!</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {designs.map((d) => (
            <div
              key={d.id}
              className="flex-shrink-0 w-36 rounded-xl overflow-hidden cursor-pointer group"
              style={{ border: '1px solid #1e1e22', backgroundColor: '#111114' }}
            >
              <div className="aspect-video overflow-hidden">
                <img src={d.image_url} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-2">
                <p className="text-[10px] text-[#9a9890] truncate">{d.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

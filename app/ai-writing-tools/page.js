'use client';
import { useState } from 'react';

const ACCENT_BLUE = '#3b82f6';
const ACCENT_GREEN = '#10b981';

const TOOLS = [
  {
    id: 'generator',
    href: '/ai-writing-tools/generator',
    icon: '✍️',
    name: 'AI Article Generator',
    accent: ACCENT_BLUE,
    desc: 'Generate long-form, professional, SEO-optimized articles in any language. Choose your topic, tone, word count and let AI write a complete structured article with images.',
    features: ['900 / 1200 / 1500 word options', 'Supports all languages', 'AI images included', 'Copy & Download'],
    btnLabel: 'Start Writing →'
  },
  {
    id: 'analyzer',
    href: '/ai-writing-tools/analyzer',
    icon: '📊',
    name: 'SEO Article Analyzer',
    accent: ACCENT_GREEN,
    desc: 'Paste or upload any article and get a full SEO audit with a score out of 100. See what\'s missing, what to fix, and let AI improve your article automatically.',
    features: ['SEO score out of 100', 'Detailed checklist with fixes', 'AI-powered improvement', 'Copy & Download improved version'],
    btnLabel: 'Analyze Article →'
  }
];

export default function AIWritingTools() {
  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container">
        <div className="section-header">
          <span className="section-badge">✍️ Writing Suite</span>
          <h1 className="section-title">AI Writing Tools</h1>
          <p className="section-subtitle">Professional tools powered by AI to create and optimize your content</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 28,
          maxWidth: 900,
          margin: '0 auto'
        }}>
          {TOOLS.map(tool => (
            <a
              key={tool.id}
              href={tool.href}
              className="tool-card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px -8px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: `${tool.accent}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', marginBottom: 16
                }}>
                  {tool.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  {tool.name}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                  {tool.desc}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                  {tool.features.map((f, i) => (
                    <li key={i} style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', padding: '3px 0' }}>
                      ✓ {f}
                    </li>
                  ))}
                </ul>
              </div>
              <span style={{
                display: 'block', width: '100%', textAlign: 'center',
                padding: '10px 16px', fontSize: '0.9rem', fontWeight: 600,
                borderRadius: 8, color: '#fff', background: tool.accent,
                boxSizing: 'border-box'
              }}>
                {tool.btnLabel}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);

    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">⚡</div>
            Chafiktech Ai
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/#tools" className="nav-link">Tools</Link>
            <Link href="/blog" className="nav-link">Blog</Link>
            <Link href="/platforms-views" className="nav-link">Platforms Views</Link>
            <Link href="/tools/ai-content-generator" className="nav-link">Content AI</Link>
            <Link href="/tools/youtube-creator" className="nav-link">YouTube AI</Link>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/about" className="nav-link">About</Link>
          </div>
          <div className="nav-actions">
            <button className="theme-toggle theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link href="/login" className="btn btn-secondary btn-sm">Log In</Link>
          </div>
          <div className={`hamburger${mobileOpen ? ' active' : ''}`} onClick={() => setMobileOpen(!mobileOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </nav>
      <div className={`mobile-nav${mobileOpen ? ' active' : ''}`}>
        <Link href="/" className="nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link href="/#tools" className="nav-link" onClick={() => setMobileOpen(false)}>Tools</Link>
        <Link href="/pricing" className="nav-link" onClick={() => setMobileOpen(false)}>Pricing</Link>
        <Link href="/blog" className="nav-link" onClick={() => setMobileOpen(false)}>Blog</Link>
        <Link href="/platforms-views" className="nav-link" onClick={() => setMobileOpen(false)}>Platforms Views</Link>
        <Link href="/tools/ai-content-generator" className="nav-link" onClick={() => setMobileOpen(false)}>Content AI</Link>
        <Link href="/tools/youtube-creator" className="nav-link" onClick={() => setMobileOpen(false)}>YouTube AI</Link>
        <Link href="/login" className="nav-link" onClick={() => setMobileOpen(false)}>Log In</Link>
        <Link href="/register" className="nav-link" onClick={() => setMobileOpen(false)}>Sign Up</Link>
      </div>
    </>
  );
}

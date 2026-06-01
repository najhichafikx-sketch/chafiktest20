'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) { router.push('/login'); return; }

    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.user);
        else router.push('/login');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('user_token');
    router.push('/login');
  }

  if (!user) return <div className="section" style={{ paddingTop: '120px', textAlign: 'center' }}>Loading...</div>;

  return (
    <section className="section" style={{ paddingTop: '100px' }}>
      <div className="container" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.email}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/" className="btn btn-secondary btn-sm">Home</Link>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="dashboard-stats">
          <StatCard icon="⚡" label="Generations Today" value={user.daily_generations || 0} iconClass="purple" />
          <StatCard icon="🎯" label="Credits Remaining" value={user.credits || 'Unlimited'} iconClass="blue" />
          <StatCard icon="📊" label="Current Plan" value={user.plan || 'free'} iconClass="cyan" capitalize />
          <StatCard icon="💾" label="Saved Results" value={0} iconClass="green" />
        </div>

        <div className="dashboard-card" style={{ marginTop: 24 }}>
          <div className="dashboard-card-header">
            <h3>Quick Access Tools</h3>
          </div>
          <div className="tools-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            <ToolMiniLink href="/tools/seo-article-generator" icon="📝" name="SEO Article" />
            <ToolMiniLink href="/tools/image-to-prompt" icon="📸" name="Image to Prompt" />
            <ToolMiniLink href="/tools/video-to-prompt" icon="🎥" name="Video to Prompt" />
            <ToolMiniLink href="/tools/tiktok-tools" icon="🎵" name="TikTok Suite" />
            <ToolMiniLink href="/tools/youtube-suite" icon="📺" name="YouTube Suite" />
            <ToolMiniLink href="/tools/ai-humanizer" icon="🤖" name="AI Humanizer" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, iconClass, capitalize }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-card-icon ${iconClass}`}>{icon}</div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label" style={{ textTransform: capitalize ? 'capitalize' : 'none' }}>{label}</div>
    </div>
  );
}

function ToolMiniLink({ href, icon, name }) {
  return (
    <Link href={href} className="tool-card" style={{ aspectRatio: 'auto', padding: '20px 16px' }}>
      <div className="tool-icon" style={{ width: 48, height: 48, fontSize: 24, marginBottom: 12 }}>{icon}</div>
      <h3 className="tool-name" style={{ fontSize: '1rem' }}>{name}</h3>
    </Link>
  );
}

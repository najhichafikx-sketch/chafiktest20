'use client';

import { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import { VideoEmbed } from '@/lib/video-embed';
import { FEEDBACK_CATEGORIES } from '@/lib/platforms-views-content';
import { usePlatformCredits } from '@/hooks/usePlatformCredits';
import { getUserId } from '@/lib/platforms-credits';

const STORAGE_KEY = 'pv_feedback_exchange';

function loadLocal() {
  if (typeof window === 'undefined') return { campaigns: [], reviews: [] };
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return { campaigns: [], reviews: [] };
}

function saveLocal(d) { if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

export default function FeedbackExchangePage() {
  const { credits, userInitialized } = usePlatformCredits();
  const [tab, setTab] = useState('submit');
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => { startTransition(() => setData(loadLocal())); }, []);
  useEffect(() => { if (data) saveLocal(data); }, [data]);

  if (!data) return null;

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/platforms-views" style={{ color: 'var(--neon-purple)', fontSize: '0.9rem' }}>&larr; Back to Platforms Views</Link>
        </div>
        <div className="section-header">
          <span className="section-badge">💬 Feedback Exchange</span>
          <h1 className="section-title">Get Structured Peer Reviews</h1>
          <p className="section-subtitle">Submit your video and get scored on hook, editing, audio, thumbnail, retention, and CTA from fellow creators.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Credits</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{credits}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Campaigns</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.campaigns.length}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Reviews</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.reviews.length}</div>
          </div>
        </div>

        <div className="blog-categories" style={{ marginBottom: 24 }}>
          {['submit', 'review', 'analytics'].map(t => (
            <span key={t} className={`blog-category ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'submit' ? '📤 Submit Video' : t === 'review' ? '✏️ Review Videos' : '📊 Analytics'}
            </span>
          ))}
        </div>

        {message && <div style={{ padding: '8px 16px', borderRadius: 8, marginBottom: 16, background: message.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: message.startsWith('✅') ? 'var(--neon-green)' : '#ef4444', fontSize: '0.85rem' }}>{message}</div>}

        {tab === 'submit' && <SubmitVideo data={data} setData={setData} credits={credits} userInitialized={userInitialized} setMessage={setMessage} />}
        {tab === 'review' && <ReviewVideos data={data} setData={setData} setMessage={setMessage} />}
        {tab === 'analytics' && <FeedbackAnalytics data={data} />}
      </div>
    </section>
  );
}

function SubmitVideo({ data, setData, credits, userInitialized, setMessage }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(1);
  const [submitted, setSubmitted] = useState(null);
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [error, setError] = useState('');

  const cost = Math.max(2, durationMinutes * 2);

  const handleSubmit = () => {
    setError('');
    if (!url || !title || !goal) { setError('All fields required'); return; }
    if (!url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('tiktok.com')) { setError('Enter a valid YouTube or TikTok URL'); return; }
    if (cost > credits) { setError(`Not enough credits. Need ${cost}, have ${credits}`); return; }

    const id = 'FB-' + Date.now().toString(36).toUpperCase();
    const campaign = { id, url, title, goal, durationMinutes, cost, status: 'pending', createdAt: Date.now(), reviews: 0, avgScore: 0, totalScore: 0 };
    const newData = { ...data, campaigns: [...data.campaigns, campaign] };
    setData(newData);
    setSubmitted(id);
    setSubmittedUrl(url);
    setUrl(''); setTitle(''); setGoal('');
    setMessage(`✅ Video submitted! Cost: ${cost} credits (will be deducted from server balance)`);
  };

  if (submitted) return (
    <div className="glass-card" style={{ padding: 32 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
        <h3 style={{ marginBottom: 12 }}>Submitted!</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Your video is now available for review.</p>
        <div style={{ fontFamily: 'monospace', color: 'var(--neon-cyan)', fontSize: '1.1rem', marginBottom: 16 }}>{submitted}</div>
      </div>
      <div style={{ maxWidth: 480, margin: '0 auto 20px' }}>
        <VideoEmbed url={submittedUrl} autoplay={false} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-secondary" onClick={() => setSubmitted(null)}>Submit Another</button>
      </div>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ marginBottom: 16 }}>Submit Video for Feedback</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>Cost: <strong>{cost} credits</strong> ({durationMinutes}min × 2 credits/min). Balance: <strong>{credits} credits</strong></p>
      <div className="form-group" style={{ marginBottom: 16 }}>
        <label className="form-label">Video URL</label>
        <input className="form-input" type="url" placeholder="https://youtube.com/watch?v=..." value={url} onChange={e => setUrl(e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">Video Title</label>
          <input className="form-input" type="text" placeholder="My video title" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Duration (min)</label>
          <input className="form-input" type="number" min={1} max={30} value={durationMinutes} onChange={e => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))} />
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 16 }}>
        <label className="form-label">Goal (what do you want feedback on?)</label>
        <textarea className="form-input" rows={3} placeholder="E.g., Is my hook strong enough? Does the pacing work?" value={goal} onChange={e => setGoal(e.target.value)} />
      </div>
      {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>Submit for Review ({cost} credits)</button>
    </div>
  );
}

function ReviewVideos({ data, setData, setMessage }) {
  const [activeReview, setActiveReview] = useState(null);
  const [scores, setScores] = useState({});
  const [whatWorked, setWhatWorked] = useState('');
  const [whatImprove, setWhatImprove] = useState('');
  const [wouldContinue, setWouldContinue] = useState('');
  const [error, setError] = useState('');

  const pending = data.campaigns.filter(c => c.status === 'pending');

  const handleStartReview = (camp) => {
    setActiveReview(camp);
    setScores({}); setWhatWorked(''); setWhatImprove(''); setWouldContinue(''); setError('');
  };

  const handleSubmitReview = async () => {
    setError('');
    const missing = FEEDBACK_CATEGORIES.filter(c => !scores[c.id]);
    if (missing.length > 0) { setError('Score all criteria: ' + missing.map(m => m.label).join(', ')); return; }
    if (!whatWorked || !whatImprove) { setError('Fill in what worked and what to improve'); return; }

    const total = FEEDBACK_CATEGORIES.reduce((sum, c) => sum + (scores[c.id] || 0), 0);
    const avg = total / FEEDBACK_CATEGORIES.length;

    const review = {
      id: 'REV-' + Date.now().toString(36).toUpperCase(),
      campaignId: activeReview.id,
      scores: { ...scores },
      whatWorked, whatImprove, wouldContinue,
      createdAt: Date.now()
    };

    const campIdx = data.campaigns.findIndex(c => c.id === activeReview.id);
    const campaign = data.campaigns[campIdx];
    const newReviews = [...data.reviews, review];
    const newCampaigns = [...data.campaigns];
    newCampaigns[campIdx] = {
      ...campaign,
      reviews: campaign.reviews + 1,
      totalScore: campaign.totalScore + avg,
      avgScore: Math.round(((campaign.totalScore + avg) / (campaign.reviews + 1)) * 10) / 10,
      status: 'reviewed'
    };

    setData({ ...data, campaigns: newCampaigns, reviews: newReviews });
    setActiveReview(null);
    setMessage(`✅ Review submitted! avg score: ${avg.toFixed(1)}/10`);
  };

  if (activeReview) {
    return (
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Reviewing: {activeReview.title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 4 }}>{activeReview.url}</p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: 16 }}>Goal: {activeReview.goal}</p>

        <div style={{ maxWidth: 480, margin: '0 auto 20px' }}>
          <VideoEmbed url={activeReview.url} autoplay={false} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {FEEDBACK_CATEGORIES.map(c => (
            <div key={c.id}>
              <label className="form-label">{c.label} (1-10)</label>
              <input className="form-input" type="number" min={1} max={10} value={scores[c.id] || ''} onChange={e => setScores({ ...scores, [c.id]: parseInt(e.target.value) || '' })} />
            </div>
          ))}
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">What worked?</label>
          <textarea className="form-input" rows={2} placeholder="Describe strengths..." value={whatWorked} onChange={e => setWhatWorked(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">What should improve?</label>
          <textarea className="form-input" rows={2} placeholder="Suggest improvements..." value={whatImprove} onChange={e => setWhatImprove(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Would you continue watching?</label>
          <select className="form-input" value={wouldContinue} onChange={e => setWouldContinue(e.target.value)}>
            <option value="">Select...</option>
            <option value="yes">Yes, definitely</option>
            <option value="maybe">Maybe</option>
            <option value="no">No</option>
          </select>
        </div>
        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setActiveReview(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmitReview}>Submit Review</button>
        </div>
      </div>
    );
  }

  if (pending.length === 0) return <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>No videos waiting for review. Check back later!</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {pending.map((camp, i) => (
        <div key={i} className="glass-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{camp.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>{camp.url}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Goal: {camp.goal} · {camp.durationMinutes || 1}min</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => handleStartReview(camp)}>Review →</button>
        </div>
      ))}
    </div>
  );
}

function FeedbackAnalytics({ data }) {
  const reviewed = data.campaigns.filter(c => c.status === 'reviewed');
  if (reviewed.length === 0) return <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>No reviews yet. Submit a video to get started!</p></div>;

  const allScores = {};
  for (const rev of data.reviews) {
    for (const [criterion, score] of Object.entries(rev.scores)) {
      if (!allScores[criterion]) allScores[criterion] = [];
      allScores[criterion].push(score);
    }
  }

  const avgScores = {};
  let bestCat = '', worstCat = '';
  let bestScore = 0, worstScore = 10;
  for (const [c, arr] of Object.entries(allScores)) {
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
    avgScores[c] = Math.round(avg * 10) / 10;
    if (avg > bestScore) { bestScore = avg; bestCat = c; }
    if (avg < worstScore) { worstScore = avg; worstCat = c; }
  }

  const labelMap = { hook: 'Hook', editing: 'Editing', audio: 'Audio', thumbnail: 'Thumbnail', retention: 'Retention', cta: 'CTA' };
  const allRatings = Object.values(avgScores);
  const overallAvg = allRatings.length > 0 ? Math.round((allRatings.reduce((s, v) => s + v, 0) / allRatings.length) * 10) / 10 : 0;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Overall Score</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{overallAvg}/10</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Best</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--neon-green)' }}>{labelMap[bestCat] || bestCat}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{bestScore.toFixed(1)}/10</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Weakest</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f43f5e' }}>{labelMap[worstCat] || worstCat}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{worstScore.toFixed(1)}/10</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Reviews</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{data.reviews.length}</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Score Breakdown</h3>
        {FEEDBACK_CATEGORIES.map(c => {
          const score = avgScores[c.id] || 0;
          const pct = (score / 10) * 100;
          return (
            <div key={c.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                <span>{c.label}</span><span style={{ color: 'var(--neon-cyan)' }}>{score}/10</span>
              </div>
              <div style={{ width: '100%', height: 8, background: 'rgba(99,102,241,0.15)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 4, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: 24, marginTop: 16 }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Improvement Suggestions</h3>
        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 2 }}>
          {worstCat && <li>Focus on improving <strong>{labelMap[worstCat] || worstCat}</strong> — it has the lowest score ({worstScore.toFixed(1)}/10).</li>}
          {bestCat && <li>Your <strong>{labelMap[bestCat] || bestCat}</strong> is strong ({bestScore.toFixed(1)}/10). Maintain this quality.</li>}
          {overallAvg < 7 && <li>Your average score is below 7. Consider reworking your content strategy.</li>}
          {overallAvg >= 7 && <li>Your content scores well overall. Keep refining the weaker areas.</li>}
        </ul>
      </div>
    </div>
  );
}

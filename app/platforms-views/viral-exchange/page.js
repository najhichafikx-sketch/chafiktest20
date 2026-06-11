'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { VideoEmbed } from '@/lib/video-embed';
import { CATEGORIES, LANGUAGES, FEEDBACK_CATEGORIES, REQUEST_TYPES, VIDEO_TYPES } from '@/lib/platforms-views-content';
import { usePlatformCredits } from '@/hooks/usePlatformCredits';
import { getUserId, calcWatchReward } from '@/lib/platforms-credits';

const INTRO_VIDEO_URL = 'https://www.youtube.com/watch?v=yXFjU-z3bUU';
const INTRO_WATCHED_KEY = 'pv_intro_watched';

function getIntroWatched() {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(INTRO_WATCHED_KEY) === 'true';
}

function setIntroWatched() {
  if (typeof window !== 'undefined') localStorage.setItem(INTRO_WATCHED_KEY, 'true');
}

export default function ViralExchangePage() {
  const { credits, loading, userInitialized, transactions, spend, earn, refetch, refetchHistory } = usePlatformCredits();
  const [tab, setTab] = useState(() => {
    if (typeof window === 'undefined') return 'earn';
    return getIntroWatched() ? 'earn' : 'intro';
  });
  const [videos, setVideos] = useState([]);
  const [queuePos, setQueuePos] = useState(0);
  const [myVideos, setMyVideos] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [videoStats, setVideoStats] = useState({ submitted: 0, feedbackGiven: 0, tests: 0 });
  const [message, setMessage] = useState('');

  const loadVideos = useCallback(async () => {
    const uid = getUserId();
    try {
      const [queueRes, myRes, fbkRes] = await Promise.all([
        fetch(`/api/platforms/videos/queue?userId=${uid}&excludeOwn=true`),
        fetch(`/api/platforms/videos?userId=${uid}`),
        fetch(`/api/platforms/feedback?userId=${uid}`)
      ]);
      const queueData = await queueRes.json();
      const myData = await myRes.json();
      const fbkData = await fbkRes.json();
      setVideos(queueData.videos || []);
      setQueuePos(queueData.queuePosition || 0);
      setMyVideos(myData.videos || []);
      setFeedback(fbkData.feedback || []);
    } catch {}
  }, []);

  useEffect(() => {
    if (userInitialized) {
      startTransition(() => loadVideos());
      startTransition(() => refetchHistory());
    }
  }, [userInitialized, loadVideos, refetchHistory]);

  useEffect(() => {
    const sub = myVideos.filter(v => v.status === 'active').length;
    const fbk = feedback.length;
    startTransition(() => setVideoStats({ submitted: myVideos.length, feedbackGiven: fbk, tests: 0 }));
  }, [myVideos, feedback]);

  if (loading) return <section className="section" style={{ paddingTop: 120, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>Loading...</p></section>;

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container" style={{ maxWidth: 960 }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/platforms-views" style={{ color: 'var(--neon-purple)', fontSize: '0.9rem' }}>&larr; Back to Platforms Views</Link>
        </div>
        <div className="section-header">
          <span className="section-badge">🔄 Viral Exchange</span>
          <h1 className="section-title">Credit-Powered Growth Engine</h1>
          <p className="section-subtitle">Watch videos to earn credits. Spend credits to promote your content and get feedback. A self-sustaining creator economy.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Credits</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{credits}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Submitted</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{videoStats.submitted}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Reviews Given</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{videoStats.feedbackGiven}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Queue Pos</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: queuePos > 10 ? '#f59e0b' : 'var(--neon-green)' }}>#{queuePos}</div>
          </div>
        </div>

        {message && <div style={{ padding: '8px 16px', borderRadius: 8, marginBottom: 16, background: message.startsWith('✅') || message.startsWith('🎉') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: message.startsWith('✅') || message.startsWith('🎉') ? 'var(--neon-green)' : '#ef4444', fontSize: '0.85rem' }}>{message}</div>}

        <div className="blog-categories" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { id: 'intro', label: '🎬 How It Works', show: !getIntroWatched() || tab === 'intro' },
            { id: 'earn', label: '💰 Earn Credits' },
            { id: 'submit', label: '📢 Submit Video' },
            { id: 'review', label: '✏️ Review & Feedback' },
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'history', label: '📜 History' },
            { id: 'leaderboard', label: '🏆 Leaderboard' }
          ].filter(t => t.show !== false).map(t => (
            <span key={t.id} className={`blog-category ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); if (t.id === 'intro') setIntroWatched(); }}>{t.label}</span>
          ))}
        </div>

        {tab === 'intro' && <IntroVideo onStart={() => { setIntroWatched(); setTab('earn'); }} />}
        {tab === 'earn' && <EarnCredits credits={credits} videos={videos} userInitialized={userInitialized} onEarn={refetch} onRefresh={loadVideos} setMessage={setMessage} />}
        {tab === 'submit' && <SubmitVideo credits={credits} userInitialized={userInitialized} onSubmit={() => { refetch(); loadVideos(); }} setMessage={setMessage} />}
        {tab === 'review' && <ReviewVideos videos={videos} onReview={() => { refetch(); loadVideos(); }} setMessage={setMessage} />}
        {tab === 'dashboard' && <Dashboard videos={myVideos} feedback={feedback} credits={credits} />}
        {tab === 'history' && <CreditHistory transactions={transactions} />}
        {tab === 'leaderboard' && <Leaderboard videos={myVideos} />}
      </div>
    </section>
  );
}

function IntroVideo({ onStart }) {
  return (
    <div>
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16, textAlign: 'center' }}>🎬 How Viral Exchange Works</h3>
        <div style={{ maxWidth: 640, margin: '0 auto 20px' }}>
          <VideoEmbed url={INTRO_VIDEO_URL} autoplay={false} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { step: 1, title: 'Watch Videos', desc: 'Browse the queue and watch videos from other creators to earn credits.', icon: '👁️' },
            { step: 2, title: 'Give Feedback', desc: 'Score videos on hook, editing, audio, thumbnail, retention, and CTA. Earn bonus credits.', icon: '✍️' },
            { step: 3, title: 'Submit Your Content', desc: 'Spend credits to submit your videos. Higher investment = more visibility.', icon: '📢' },
            { step: 4, title: 'Get Exposure', desc: 'Your video enters the distribution queue. Watch, review, and earn to keep the cycle going.', icon: '🚀' }
          ].map(s => (
            <div key={s.step} className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: 4 }}>Step {s.step}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={onStart}>Got It — Start Earning Credits!</button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>💡 Tips for Maximizing Credits</h3>
        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 2 }}>
          <li>Watch videos fully to earn completion bonuses (+2 extra credits)</li>
          <li>Give detailed, honest feedback — quality reviews earn bonus credits</li>
          <li>Submit shorter videos (1-2 min) to maximize your credit spend efficiency</li>
          <li>Review videos in your niche for more relevant feedback in return</li>
          <li>Check your queue position to know when your video gets exposure</li>
          <li>You start with 10 free credits — use them wisely!</li>
        </ul>
      </div>
    </div>
  );
}

function EarnCredits({ credits, videos, userInitialized, onEarn, onRefresh, setMessage }) {
  const [watching, setWatching] = useState(null);
  const [watchTimer, setWatchTimer] = useState(0);
  const [watchDuration, setWatchDuration] = useState(30);
  const [watchProgress, setWatchProgress] = useState(0);
  const [watchEvents, setWatchEvents] = useState([]);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const videoRef = useRef(null);

  const startWatching = (video, duration) => {
    setWatching(video);
    setWatchDuration(duration);
    setWatchTimer(duration);
    setWatchProgress(0);
    startTransition(() => {
      const now = Date.now();
      setWatchEvents([{ currentTime: 0, timestamp: now }]);
    });
  };

  useEffect(() => {
    if (!watching || watchTimer <= 0) return;
    timerRef.current = setInterval(() => {
      setWatchTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
      setWatchProgress(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [watching, watchTimer]);

  useEffect(() => {
    if (!watching) return;
    progressRef.current = setInterval(() => {
      const elapsed = watchDuration - watchTimer;
      setWatchEvents(prev => [...prev, { currentTime: elapsed, timestamp: Date.now() }]);
    }, 3000);
    return () => clearInterval(progressRef.current);
  }, [watching, watchDuration, watchTimer]);

  const handleFinishWatch = async () => {
    if (!watching) return;
    const elapsed = watchDuration - watchTimer;
    const completionPct = Math.round((elapsed / watchDuration) * 100);
    const reward = calcWatchReward(elapsed, watchDuration, completionPct, 0.5);

    try {
      const res = await fetch('/api/platforms/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getUserId(),
          videoId: watching.id,
          durationSeconds: elapsed,
          videoDurationSeconds: watchDuration,
          completionPct,
          feedbackQuality: 0.5,
          watchEvents
        })
      });
      const data = await res.json();
      if (data.success && data.creditsEarned > 0) {
        setMessage(`✅ Earned ${data.creditsEarned} credits for watching!`);
      } else if (data.skipDetected) {
        setMessage('⚠️ Skipping detected — no credits earned. Watch videos properly.');
      } else if (data.error) {
        setMessage(`⚠️ ${data.error}`);
      } else {
        setMessage(`✅ Watched! (earned 0 credits — daily limit may be reached)`);
      }
    } catch {
      setMessage('⚠️ Could not connect to server');
    }

    setWatching(null);
    setWatchTimer(0);
    setWatchEvents([]);
    onEarn();
    onRefresh();
  };

  const handleSkipWatch = () => {
    setWatching(null);
    setWatchTimer(0);
    setWatchEvents([]);
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  if (watching) {
    const elapsed = watchDuration - watchTimer;
    const pct = watchDuration > 0 ? ((watchDuration - watchTimer) / watchDuration) * 100 : 0;
    return (
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem' }}>Watching Video</h3>
          <button className="btn btn-secondary btn-sm" onClick={handleSkipWatch}>Skip</button>
        </div>
        <div style={{ maxWidth: 560, margin: '0 auto 16px' }}>
          <VideoEmbed url={watching.url} autoplay muted={false} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{watchTimer}s</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>remaining · Watch fully for bonus credits</div>
        </div>
        <div style={{ width: '100%', height: 6, background: 'rgba(99,102,241,0.15)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 3, transition: 'width 1s linear' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
          <span>{elapsed}s watched</span>
          <span>{Math.round(pct)}% complete</span>
        </div>
        {watchTimer <= 0 && (
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleFinishWatch}>Claim Credits</button>
        )}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🎬</div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>No videos in the queue yet.</p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 16 }}>Be the first to submit a video and start the exchange!</p>
        <button className="btn btn-primary" onClick={() => document.querySelector('.blog-category')?.click() || onRefresh()}>Refresh Queue</button>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 16, textAlign: 'center' }}>
        Watch videos to earn credits. <strong>1 min = 1 credit</strong> · Complete a video for <strong>+2 bonus</strong> · Give quality reviews for <strong>extra credits</strong>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {videos.map(v => {
          const costPerMin = 2;
          const suggestedDuration = Math.min(90, (v.duration_minutes || 1) * 60);
          return (
            <div key={v.id} className="glass-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>{v.category || 'Other'} · {v.language || 'English'}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, wordBreak: 'break-all' }}>{v.title || v.url?.substring(0, 50)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{v.duration_minutes || 1}min · {v.views || 0} views · {v.reviews || 0} reviews</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => startWatching(v, 30)}>30s · 1cr</button>
                <button className="btn btn-outline btn-sm" onClick={() => startWatching(v, 60)}>60s · 2cr</button>
                <button className="btn btn-primary btn-sm" onClick={() => startWatching(v, suggestedDuration)}>{suggestedDuration}s · ~{Math.ceil(suggestedDuration / 60)}cr</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubmitVideo({ credits, userInitialized, onSubmit, setMessage }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [lang, setLang] = useState('English');
  const [videoType, setVideoType] = useState('youtube');
  const [durationMinutes, setDurationMinutes] = useState(1);
  const [requestType, setRequestType] = useState('general');
  const [submitted, setSubmitted] = useState(null);

  const cost = Math.max(2, durationMinutes * 2);

  const handleSubmit = async () => {
    if (!url) { setMessage('⚠️ Enter a video URL'); return; }
    if (!url.match(/(youtube\.com|youtu\.be|tiktok\.com)/)) { setMessage('⚠️ Enter a valid YouTube or TikTok URL'); return; }
    if (cost > credits) { setMessage('⚠️ Not enough credits. Need ' + cost + ', have ' + credits); return; }
    if (!userInitialized) { setMessage('⚠️ Initializing... please wait'); return; }

    try {
      const res = await fetch('/api/platforms/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getUserId(),
          url, title, description, category, language: lang,
          durationMinutes, creditsSpent: cost, feedbackType: requestType
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted({ id: data.videoId, url, cost: data.cost });
        setMessage(`🎉 Video submitted! Cost: ${data.cost} credits`);
        onSubmit();
      } else {
        setMessage(`⚠️ ${data.error || 'Submission failed'}`);
      }
    } catch {
      setMessage('⚠️ Network error — try again');
    }
  };

  if (submitted) {
    return (
      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
          <h3 style={{ marginBottom: 12 }}>Video Submitted!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Your video is now in the exchange queue.</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 8 }}>Cost: {submitted.cost} credits</p>
          <div style={{ fontFamily: 'monospace', color: 'var(--neon-cyan)', fontSize: '0.85rem', marginBottom: 16 }}>{submitted.id}</div>
        </div>
        <div style={{ maxWidth: 480, margin: '0 auto 20px' }}>
          <VideoEmbed url={submitted.url} autoplay={false} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-secondary" onClick={() => { setSubmitted(null); setUrl(''); setTitle(''); }}>Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ marginBottom: 16 }}>Submit Your Video</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>Cost: <strong>{cost} credits</strong> ({durationMinutes}min × 2 credits/min). Balance: <strong>{credits} credits</strong></p>

      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Video URL (YouTube or TikTok)</label>
        <input className="form-input" type="url" placeholder="https://youtube.com/watch?v=..." value={url} onChange={e => setUrl(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" type="text" placeholder="Video title" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Video Type</label>
          <select className="form-input" value={videoType} onChange={e => setVideoType(e.target.value)}>
            {VIDEO_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Description / Goal</label>
        <textarea className="form-input" rows={2} placeholder="What feedback are you looking for?" value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Language</label>
          <select className="form-input" value={lang} onChange={e => setLang(e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Duration (min)</label>
          <input className="form-input" type="number" min={1} max={30} value={durationMinutes} onChange={e => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))} />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 16 }}>
        <label className="form-label">Request Type</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {REQUEST_TYPES.map(rt => (
            <button key={rt.id} className={`btn ${requestType === rt.id ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setRequestType(rt.id)}>
              {rt.icon} {rt.label}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={!userInitialized}>
        Submit Video ({cost} credits)
      </button>
    </div>
  );
}

function ReviewVideos({ videos, onReview, setMessage }) {
  const [activeReview, setActiveReview] = useState(null);
  const [scores, setScores] = useState({});
  const [whatWorked, setWhatWorked] = useState('');
  const [whatImprove, setWhatImprove] = useState('');
  const [wouldContinue, setWouldContinue] = useState('');
  const [error, setError] = useState('');

  const handleStartReview = (video) => {
    setActiveReview(video);
    setScores({});
    setWhatWorked('');
    setWhatImprove('');
    setWouldContinue('');
    setError('');
  };

  const handleSubmitReview = async () => {
    const missing = FEEDBACK_CATEGORIES.filter(c => !scores[c.id]);
    if (missing.length > 0) { setError('Score all: ' + missing.map(m => m.label).join(', ')); return; }
    if (!whatWorked || !whatImprove) { setError('Fill in what worked and what to improve'); return; }

    try {
      const res = await fetch('/api/platforms/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getUserId(),
          videoId: activeReview.id,
          hookScore: scores.hook || 0,
          editingScore: scores.editing || 0,
          audioScore: scores.audio || 0,
          thumbnailScore: scores.thumbnail || 0,
          retentionScore: scores.retention || 0,
          ctaScore: scores.cta || 0,
          whatWorked, whatImprove, wouldContinue
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Review submitted!${data.bonusCredits > 0 ? ` +${data.bonusCredits} bonus credits` : ''}`);
        setActiveReview(null);
        onReview();
      } else {
        setError(data.error || 'Submit failed');
      }
    } catch {
      setError('Network error');
    }
  };

  if (activeReview) {
    return (
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Reviewing: {activeReview.title || 'Untitled'}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 4, wordBreak: 'break-all' }}>{activeReview.url}</p>
        <div style={{ maxWidth: 480, margin: '0 auto 20px' }}>
          <VideoEmbed url={activeReview.url} autoplay={false} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {FEEDBACK_CATEGORIES.map(c => (
            <div key={c.id}>
              <label className="form-label">{c.label} (1-10)</label>
              <input className="form-input" type="number" min={1} max={10} value={scores[c.id] || ''} onChange={e => setScores({ ...scores, [c.id]: parseInt(e.target.value) || '' })}
                style={{ borderColor: scores[c.id] ? 'var(--neon-cyan)' : undefined }}
              />
            </div>
          ))}
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">What worked?</label>
          <textarea className="form-input" rows={2} placeholder="Strengths..." value={whatWorked} onChange={e => setWhatWorked(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">What should improve?</label>
          <textarea className="form-input" rows={2} placeholder="Improvements..." value={whatImprove} onChange={e => setWhatImprove(e.target.value)} />
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

  const available = videos.filter(v => v.status === 'active');

  if (available.length === 0) {
    return <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>No videos available for review. Watch some videos first or submit your own!</p></div>;
  }

  return (
    <div>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 16, textAlign: 'center' }}>
        Review videos to earn bonus credits. Quality reviews (avg 7+) earn <strong>+2 extra credits</strong>.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {available.map(v => (
          <div key={v.id} className="glass-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{v.title || 'Untitled'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', wordBreak: 'break-all' }}>{v.url?.substring(0, 60)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{v.category || 'Other'} · {v.duration_minutes || 1}min · {v.reviews || 0} reviews</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => handleStartReview(v)}>Review →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ videos, feedback, credits }) {
  const reviewed = videos.filter(v => v.status === 'active' || v.reviews > 0);
  const activeVids = videos.filter(v => v.status === 'active');

  const allScores = {};
  for (const f of feedback) {
    for (const c of ['hook_score', 'editing_score', 'audio_score', 'thumbnail_score', 'retention_score', 'cta_score']) {
      if (!allScores[c]) allScores[c] = [];
      if (f[c]) allScores[c].push(f[c]);
    }
  }
  const avgScores = {};
  for (const [c, arr] of Object.entries(allScores)) {
    avgScores[c] = Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10;
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Credits', value: credits, color: 'var(--neon-cyan)' },
          { label: 'Submitted', value: videos.length },
          { label: 'Active', value: activeVids.length, color: 'var(--neon-green)' },
          { label: 'Reviews Received', value: feedback.length },
          { label: 'Total Views', value: videos.reduce((s, v) => s + (v.views || 0), 0) }
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color || 'var(--text-primary)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {videos.length === 0 ? (
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No videos submitted yet. Submit your first video to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Your Videos</h3>
          {videos.map(v => (
            <div key={v.id} className="glass-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, wordBreak: 'break-all' }}>{v.title || v.url?.substring(0, 50)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{v.category} · {v.language} · {v.duration_minutes}min</div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '2px 10px', borderRadius: 999, background: v.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(100,100,100,0.15)', color: v.status === 'active' ? 'var(--neon-green)' : 'var(--text-muted)' }}>{v.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, fontSize: '0.8rem' }}>
                <div style={{ textAlign: 'center' }}><span style={{ color: 'var(--text-tertiary)' }}>Views</span><br /><strong>{v.views || 0}</strong></div>
                <div style={{ textAlign: 'center' }}><span style={{ color: 'var(--text-tertiary)' }}>Reviews</span><br /><strong>{v.reviews || 0}</strong></div>
                <div style={{ textAlign: 'center' }}><span style={{ color: 'var(--text-tertiary)' }}>Avg Score</span><br /><strong style={{ color: 'var(--neon-cyan)' }}>{v.avg_score ? v.avg_score.toFixed(1) : '-'}/10</strong></div>
                <div style={{ textAlign: 'center' }}><span style={{ color: 'var(--text-tertiary)' }}>Priority</span><br /><strong style={{ color: 'var(--neon-purple)' }}>{(v.priority || 0).toFixed(2)}</strong></div>
              </div>
              {v.reviews > 0 && avgScores && Object.keys(avgScores).length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 8 }}>Score Breakdown</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                    {Object.entries(avgScores).map(([key, val]) => (
                      <div key={key} style={{ fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ color: 'var(--text-tertiary)' }}>{key.replace('_score', '').replace(/_/g, ' ')}</span>
                          <span style={{ color: 'var(--neon-cyan)' }}>{val}/10</span>
                        </div>
                        <div style={{ width: '100%', height: 4, background: 'rgba(99,102,241,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${(val / 10) * 100}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreditHistory({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>No transactions yet. Start watching and submitting videos!</p></div>;
  }

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Transaction History</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {transactions.map(t => (
          <div key={t.id} className="glass-card" style={{
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            borderLeft: `3px solid ${t.amount > 0 ? 'var(--neon-green)' : t.amount < 0 ? '#f43f5e' : 'var(--neon-purple)'}`
          }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.description || t.type}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {new Date(t.created_at).toLocaleString()} · {t.type}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: t.amount > 0 ? 'var(--neon-green)' : t.amount < 0 ? '#f43f5e' : 'var(--text-tertiary)' }}>
                {t.amount > 0 ? '+' : ''}{t.amount}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Balance: {t.balance_after}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Leaderboard({ videos }) {
  const sorted = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  const byScore = [...videos].filter(v => v.avg_score > 0).sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0)).slice(0, 10);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>🏆 Most Viewed</h3>
        {sorted.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No videos yet</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map((v, i) => (
              <div key={v.id} className="glass-card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><span style={{ fontWeight: 700, marginRight: 8, color: i < 3 ? 'var(--neon-cyan)' : undefined }}>#{i + 1}</span><span style={{ fontSize: '0.85rem' }}>{v.title || v.url?.substring(0, 30)}...</span></div>
                <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>{v.views || 0} views</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>⭐ Highest Rated</h3>
        {byScore.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No reviews yet</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {byScore.map((v, i) => (
              <div key={v.id} className="glass-card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><span style={{ fontWeight: 700, marginRight: 8, color: i < 3 ? 'var(--neon-green)' : undefined }}>#{i + 1}</span><span style={{ fontSize: '0.85rem' }}>{v.title || v.url?.substring(0, 30)}...</span></div>
                <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>{v.avg_score?.toFixed(1)}/10</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

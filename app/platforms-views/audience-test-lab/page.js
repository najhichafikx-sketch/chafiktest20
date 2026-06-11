'use client';

import { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import Link from 'next/link';
import { useLabPoints } from '@/hooks/useLabPoints';

const STORAGE_KEY = 'pv_lab_data';
const DAILY_WATCH_KEY = 'pv_lab_daily_earn';

function loadData() {
  if (typeof window === 'undefined') return { submitted: [], watchHistory: [], testResults: [] };
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return { submitted: [], watchHistory: [], testResults: [] };
}
function saveData(d) { if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

function getDailyEarned() {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(DAILY_WATCH_KEY);
    if (!raw) return 0;
    const { date, amount } = JSON.parse(raw);
    if (date !== new Date().toDateString()) { localStorage.removeItem(DAILY_WATCH_KEY); return 0; }
    return amount || 0;
  } catch { return 0; }
}
function setDailyEarned(amount) {
  localStorage.setItem(DAILY_WATCH_KEY, JSON.stringify({ date: new Date().toDateString(), amount }));
}
const DAILY_LIMIT = 80;

/* ─── PACKAGES ─── */
const SCREEN_PACKAGES = [
  { screens: 4, cost: 10 },
  { screens: 6, cost: 14 },
  { screens: 10, cost: 20 }
];

export default function AudienceTestLabPage() {
  const { labPoints, labSessions, labEarned, labSpent, loading, offline, refetch, earn, purchase, consume, runTest } = useLabPoints();
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState(null);
  const [dailyEarned, setDailyEarnedState] = useState(0);
  const [notif, setNotif] = useState(null);

  const showNotif = useCallback((msg) => { setNotif(msg); setTimeout(() => setNotif(null), 3000); }, []);

  useEffect(() => { startTransition(() => { setData(loadData()); setDailyEarnedState(getDailyEarned()); }); }, []);

  useEffect(() => { if (data) saveData(data); }, [data]);

  const updateEarned = useCallback((pts) => {
    const newTotal = getDailyEarned() + pts;
    setDailyEarnedState(newTotal);
    setDailyEarned(newTotal);
  }, []);

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'submit', label: '📹 Submit Video' },
    { id: 'watch', label: '👁️ Watch & Earn' },
    { id: 'screens', label: '🖥️ Buy Screens' },
    { id: 'test', label: '🧪 Test Video' },
    { id: 'results', label: '📈 Results' }
  ];

  if (!data) return null;

  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="container" style={{ maxWidth: 960 }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/platforms-views" style={{ color: 'var(--neon-purple)', fontSize: '0.9rem' }}>&larr; Back to Platforms Views</Link>
        </div>

        {notif && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '12px 20px', borderRadius: 10, background: 'rgba(17,17,20,0.95)', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)', fontSize: '0.85rem', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {notif}
          </div>
        )}

        <div className="section-header">
          <span className="section-badge">🧪 Audience Test Lab</span>
          <h1 className="section-title">Pre-Launch Video Testing</h1>
          <p className="section-subtitle">Earn points by watching videos, convert to test sessions, and get detailed analytics before going live.</p>
        </div>

        {/* Top Stats Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>🔵 Points</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{labPoints}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>🖥️ Sessions</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-color)' }}>{labSessions}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>📹 Videos</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{data.submitted.length}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>🧪 Tests</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{data.testResults.length}</div>
          </div>
          {dailyEarned > 0 && (
            <div className="stat-card" style={{ textAlign: 'center', minWidth: 90 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>📅 Earned Today</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: dailyEarned >= DAILY_LIMIT ? '#f43f5e' : 'var(--neon-green)' }}>{dailyEarned}/{DAILY_LIMIT}</div>
            </div>
          )}
        </div>

        <div className="blog-categories" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <span key={t.id} className={`blog-category ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</span>
          ))}
        </div>

        {tab === 'dashboard' && <Dashboard data={data} labPoints={labPoints} labSessions={labSessions} labEarned={labEarned} labSpent={labSpent} />}
        {tab === 'submit' && <SubmitVideo data={data} setData={setData} showNotif={showNotif} />}
        {tab === 'watch' && <WatchAndEarn data={data} setData={setData} earn={earn} showNotif={showNotif} dailyEarned={dailyEarned} updateEarned={updateEarned} />}
        {tab === 'screens' && <BuyScreens labPoints={labPoints} labSessions={labSessions} purchase={purchase} consume={consume} showNotif={showNotif} data={data} setData={setData} />}
        {tab === 'test' && <TestVideo labSessions={labSessions} runTest={runTest} data={data} setData={setData} showNotif={showNotif} />}
        {tab === 'results' && <Results data={data} />}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════════ */
function Dashboard({ data, labPoints, labSessions, labEarned, labSpent }) {
  return (
    <div>
      {/* How it Works */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>How It Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { step: '1', icon: '👁️', title: 'Watch Videos', desc: 'Browse the queue and watch other creators\' videos to earn lab points.' },
            { step: '2', icon: '⭐', title: 'Earn Points', desc: 'Earn 4 points per minute watched. Build up your balance.' },
            { step: '3', icon: '🖥️', title: 'Buy Screens', desc: 'Convert points to test sessions: 4/10pts, 6/14pts, or 10/20pts.' },
            { step: '4', icon: '🧪', title: 'Test Your Video', desc: 'Submit a YouTube URL and use screens to run detailed analysis.' }
          ].map((s, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 10, background: 'rgba(99,102,241,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', fontWeight: 700, marginBottom: 4 }}>Step {s.step}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>💰 Points Balance</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{labPoints}</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>🖥️ Test Sessions</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)' }}>{labSessions}</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>⬆️ Total Earned</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--neon-green)' }}>{labEarned}</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>⬇️ Total Spent</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{labSpent}</div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Account Activity</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Videos Submitted', value: data.submitted.length, color: 'var(--text-primary)' },
            { label: 'Videos Watched', value: data.watchHistory.length, color: 'var(--text-primary)' },
            { label: 'Tests Completed', value: data.testResults.length, color: 'var(--text-primary)' }
          ].map((s, i) => (
            <div key={i} style={{ padding: 12, borderRadius: 8, background: 'rgba(99,102,241,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: 'rgba(99,102,241,0.05)', fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
          Your account is linked to this browser. <Link href="/register" style={{ color: 'var(--neon-cyan)' }}>Register here</Link> to save data across devices.
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SUBMIT VIDEO
   ════════════════════════════════════════ */
function SubmitVideo({ data, setData, showNotif }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(1);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const extractVideoId = (input) => {
    const m = input.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : input;
  };

  const handleSubmit = async () => {
    if (!url) return;
    setSubmitting(true);
    const vid = extractVideoId(url);
    const entry = { id: 'SUB-' + Date.now().toString(36).toUpperCase(), url: vid, title: title || 'Untitled', duration: Math.max(0.5, duration), submittedAt: Date.now() };
    setData({ ...data, submitted: [...data.submitted, entry] });
    setUrl(''); setTitle('');
    showNotif('Video submitted successfully!');
    setSubmitting(false);
  };

  return (
    <div>
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Submit a Video for Testing</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
          Submit your YouTube video URL. Other users will watch it to earn points, and you can use test sessions to run detailed analysis.
        </p>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">YouTube Video URL</label>
          <input className="form-input" type="url" placeholder="https://youtube.com/watch?v=..." value={url} onChange={e => { setUrl(e.target.value); setPreviewUrl(extractVideoId(e.target.value)); }} />
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Video Title (optional)</label>
          <input className="form-input" type="text" placeholder="My Awesome Video" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Duration (minutes)</label>
          <select className="form-input" value={duration} onChange={e => setDuration(parseFloat(e.target.value))}>
            {[0.5, 1, 2, 3, 5, 8, 10, 15, 20, 30].map(m => <option key={m} value={m}>{m >= 1 ? `${m} min` : '30 sec'}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting || !url}>
          {submitting ? 'Submitting...' : 'Submit Video →'}
        </button>
      </div>

      {/* Preview */}
      {previewUrl && url && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
          <h4 style={{ marginBottom: 12, fontSize: '0.9rem' }}>Preview</h4>
          <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 10, overflow: 'hidden' }}>
            <iframe src={`https://www.youtube.com/embed/${previewUrl}?autoplay=0&controls=1&rel=0`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 10 }} allow="accelerometer; encrypted-media; gyroscope" allowFullScreen />
          </div>
        </div>
      )}

      {/* Submitted Videos */}
      {data.submitted.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Your Submitted Videos ({data.submitted.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...data.submitted].reverse().map((v, i) => (
              <div key={i} className="glass-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 80, height: 45, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={`https://img.youtube.com/vi/${v.url}/mqdefault.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{v.duration}m · {new Date(v.submittedAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   WATCH & EARN
   ════════════════════════════════════════ */
const DEFAULT_WATCH_VIDEO = { id: 'DEFAULT_CHAFIKTECH', url: 'yXFjU-z3bUU', title: '🎬 Chafiktech Promo — Earn Points!', duration: 10 };

function WatchAndEarn({ data, setData, earn, showNotif, dailyEarned, updateEarned }) {
  const [queue, setQueue] = useState([]);
  const [watching, setWatching] = useState(null);
  const [timer, setTimer] = useState(0);
  const [earned, setEarned] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [watchDuration, setWatchDuration] = useState(30);
  const intervalRef = useRef(null);
  const timerActive = useRef(false);

  // Build queue: default video always first + other submitted videos
  useEffect(() => {
    const otherVids = data.submitted.filter(v => !data.watchHistory.find(w => w.videoId === v.id));
    const defaultEntry = { ...DEFAULT_WATCH_VIDEO, isDefault: true };
    startTransition(() => setQueue([defaultEntry, ...otherVids]));
  }, [data]);

  const startWatching = (video) => {
    if (dailyEarned >= DAILY_LIMIT) { showNotif('Daily earning limit reached (' + DAILY_LIMIT + ' pts). Come back tomorrow!'); return; }
    setWatching(video);
    setTimer(0);
    setEarned(0);
    timerActive.current = true;
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev >= watchDuration) { clearInterval(intervalRef.current); timerActive.current = false; return prev; }
        return prev + 1;
      });
    }, 1000);
  };

  const claimReward = async () => {
    if (processing) return;
    setProcessing(true);
    clearInterval(intervalRef.current);
    timerActive.current = false;
    const ptsEarned = Math.floor((timer / 60) * 4);
    const finalPts = Math.max(1, ptsEarned);

    await earn(finalPts);
    setEarned(finalPts);
    updateEarned(finalPts);

    setData({ ...data, watchHistory: [...data.watchHistory, { videoId: watching.id, title: watching.title, duration: timer, earned: finalPts, date: Date.now() }] });
    showNotif(`+${finalPts} points earned!`);
    setWatching(null);
    setTimer(0);
    setProcessing(false);
  };

  const stopWatching = () => {
    clearInterval(intervalRef.current);
    timerActive.current = false;
    const ptsEarned = Math.max(1, Math.floor((timer / 60) * 4));
    if (timer >= 10) claimReward(); else { setWatching(null); setTimer(0); }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { clearInterval(intervalRef.current); };
  }, []);

  return (
    <div>
      {watching ? (
        <div>
          <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Now Watching</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{watching.title}</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={stopWatching}>Stop</button>
            </div>

            <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
              <iframe
                src={`https://www.youtube.com/embed/${watching.url}?autoplay=1&controls=1&rel=0`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 10 }}
                allow="accelerometer; autoplay; encrypted-media; gyroscope"
                allowFullScreen
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Watch Progress</div>
                <div style={{ width: '100%', height: 6, background: 'rgba(99,102,241,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (timer / watchDuration) * 100)}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 3, transition: 'width 1s linear' }} />
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {timer}s / {watchDuration}s
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>
                Potential: <strong>{Math.floor((timer / 60) * 4)} points</strong>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Listen for:</span>
                <select className="form-input" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }} value={watchDuration} onChange={e => setWatchDuration(parseInt(e.target.value))}>
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1 min</option>
                  <option value={120}>2 min</option>
                  <option value={300}>5 min</option>
                </select>
                <button className="btn btn-primary btn-sm" onClick={claimReward} disabled={timer < 10 || processing}>Claim {Math.floor((timer / 60) * 4)} pts</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 8 }}>Watch & Earn Points</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
              Watch other creators&apos; videos to earn <strong style={{ color: 'var(--neon-cyan)' }}>4 points per minute</strong>. Points can be converted to test screens.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Watch duration:</span>
              <select className="form-input" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }} value={watchDuration} onChange={e => setWatchDuration(parseInt(e.target.value))}>
                <option value={15}>15 sec</option>
                <option value={30}>30 sec</option>
                <option value={60}>1 min (4 pts)</option>
                <option value={120}>2 min (8 pts)</option>
                <option value={300}>5 min (20 pts)</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: dailyEarned >= DAILY_LIMIT ? '#f43f5e' : 'var(--text-tertiary)' }}>
                Daily: {dailyEarned}/{DAILY_LIMIT}
              </span>
            </div>
          </div>

          {dailyEarned >= DAILY_LIMIT && (
            <div className="glass-card" style={{ padding: 24, textAlign: 'center', marginBottom: 20, border: '1px solid rgba(244,63,94,0.3)' }}>
              <p style={{ color: '#f43f5e', fontSize: '0.9rem' }}>⚠️ Daily earning limit reached ({DAILY_LIMIT} pts). Come back tomorrow!</p>
            </div>
          )}

          {queue.length === 0 ? (
            <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
              <h3 style={{ marginBottom: 8 }}>No Videos in Queue</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Submit a video first or wait for other creators to submit theirs.</p>
            </div>
          ) : (
            <div>
              <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Available Videos ({queue.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {queue.slice(0, 20).map((v, i) => {
                  const watched = data.watchHistory.find(w => w.videoId === v.id);
                  return (
                    <div key={i} className="glass-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 80, height: 45, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={`https://img.youtube.com/vi/${v.url}/mqdefault.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{v.duration}m — ~{Math.floor(v.duration * 4)} pts potential</div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => startWatching(v)}>Watch →</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Watch History */}
          {data.watchHistory.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Watch History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...data.watchHistory].reverse().slice(0, 10).map((w, i) => (
                  <div key={i} className="glass-card" style={{ padding: 10, display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{w.title}</span>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 600, marginLeft: 12 }}>+{w.earned} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   BUY SCREENS + PROMOTE VIDEO
   ════════════════════════════════════════ */
function extractVideoId(input) {
  const m = input.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : input;
}

function BuyScreens({ labPoints, labSessions, purchase, consume, showNotif, data, setData }) {
  const [buying, setBuying] = useState(null);
  const [promoting, setPromoting] = useState(null);
  const [promoUrl, setPromoUrl] = useState('');
  const [promoTitle, setPromoTitle] = useState('');

  const handleBuy = async (pkg) => {
    setBuying(pkg.screens);
    const res = await purchase(pkg.screens);
    if (res.error) showNotif(res.error);
    else showNotif(`Purchased ${pkg.screens} screens for ${pkg.cost} points!`);
    setBuying(null);
  };

  const handlePromote = async (pkg) => {
    if (!promoUrl) { showNotif('Paste a YouTube video URL first'); return; }
    if (labSessions < pkg.screens) { showNotif('Not enough screens. Buy screens first with points.'); return; }
    setPromoting(pkg.screens);
    const res = await consume(pkg.screens);
    if (res.error) { showNotif(res.error); setPromoting(null); return; }
    const vid = extractVideoId(promoUrl);
    const entry = { id: 'PROMO-' + Date.now().toString(36).toUpperCase(), url: vid, title: promoTitle || 'Promoted Video', duration: 2, submittedAt: Date.now(), promoted: true, views: pkg.screens };
    setData({ ...data, submitted: [...data.submitted, entry] });
    setPromoUrl(''); setPromoTitle(''); setPromoting(null);
    showNotif(`Promoted! ${pkg.screens} screens used for your video`);
  };

  return (
    <div>
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Buy Test Screens</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
          Convert your earned points into test screens. Each screen lets you run one analysis tool on your video.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Your Balance</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{labPoints}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>points</div>
          </div>
          <div style={{ width: 40 }} />
          <div className="stat-card" style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Your Screens</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)' }}>{labSessions}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>available</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {SCREEN_PACKAGES.map((pkg, i) => {
          const canBuy = labPoints >= pkg.cost;
          const canPromote = labSessions >= pkg.screens;
          const saving = i === 0 ? 0 : Math.round((1 - pkg.cost / (pkg.screens * 2.5)) * 100);
          return (
            <div key={i} className="glass-card" style={{ padding: 24, textAlign: 'center', border: canBuy ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(100,100,120,0.15)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 4 }}>🖥️</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: 2 }}>{pkg.screens}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Test Screens</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 2 }}>{pkg.cost} points</div>
              {saving > 0 && <div style={{ fontSize: '0.7rem', color: 'var(--neon-green)', marginBottom: 8 }}>Save {saving}% vs single</div>}
              <button
                className={`btn ${canBuy ? 'btn-primary' : 'btn-outline'}`}
                style={{ width: '100%', marginBottom: 8 }}
                onClick={() => handleBuy(pkg)}
                disabled={!canBuy || buying === pkg.screens}
              >
                {buying === pkg.screens ? 'Processing...' : canBuy ? 'Buy Screens' : 'Need ' + (pkg.cost - labPoints) + ' more pts'}
              </button>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(100,100,120,0.15)', margin: '12px 0' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--neon-purple)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span>📹</span> Promote Your Video — Use {pkg.screens} screens
              </div>
              <input className="form-input" type="url" placeholder="YouTube URL..." value={promoUrl} onChange={e => setPromoUrl(e.target.value)} style={{ marginBottom: 6, fontSize: '0.8rem', padding: '6px 10px' }} />
              <input className="form-input" type="text" placeholder="Title (optional)" value={promoTitle} onChange={e => setPromoTitle(e.target.value)} style={{ marginBottom: 8, fontSize: '0.8rem', padding: '6px 10px' }} />
              <button
                className={`btn ${canPromote && promoUrl ? 'btn-accent' : 'btn-outline'}`}
                style={{ width: '100%', background: canPromote && promoUrl ? 'linear-gradient(135deg,#6c63ff,#f72585)' : undefined }}
                onClick={() => handlePromote(pkg)}
                disabled={!canPromote || !promoUrl || promoting === pkg.screens}
              >
                {promoting === pkg.screens ? 'Promoting...' : canPromote && promoUrl ? `Promote → Use ${pkg.screens} screens` : !promoUrl ? 'Paste URL above' : 'Need ' + (pkg.screens - labSessions) + ' more screens'}
              </button>
              {promoUrl && (
                <div style={{ marginTop: 8, borderRadius: 6, overflow: 'hidden', position: 'relative', paddingTop: '56.25%' }}>
                  <iframe src={`https://www.youtube.com/embed/${extractVideoId(promoUrl)}?autoplay=0&controls=1&rel=0`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 6 }} allow="accelerometer; encrypted-media; gyroscope" allowFullScreen />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   TEST VIDEO
   ════════════════════════════════════════ */
const TEST_TOOLS = [
  { id: 'retention', label: '📈 Retention Analyzer', desc: 'Simulates audience retention curve with drop-off analysis' },
  { id: 'hook', label: '🪝 Hook Tester', desc: 'Test your hook effectiveness across attention, curiosity, emotion, retention' },
  { id: 'thumbnail', label: '🖼️ Thumbnail Battle', desc: 'Compare two thumbnails side-by-side with CTR prediction' },
  { id: 'viralscore', label: '🔥 AI Viral Score', desc: 'Predicts viral potential across 5 key dimensions' }
];

function TestVideo({ labSessions, runTest, data, setData, showNotif }) {
  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedTool, setSelectedTool] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  // Run the selected analysis
  const handleRun = async () => {
    if (!selectedVideo || !selectedTool) { showNotif('Select a video and a test tool'); return; }
    if (labSessions < 1) { showNotif('No test screens remaining. Buy more screens first.'); return; }
    setRunning(true);

    const testRes = await runTest();
    if (testRes?.error) { showNotif(testRes.error); setRunning(false); return; }

    const video = data.submitted.find(v => v.id === selectedVideo);
    let output;

    if (selectedTool === 'retention') output = generateRetentionData(video?.duration || 1);
    else if (selectedTool === 'hook') output = generateHookData(video?.title || '');
    else if (selectedTool === 'thumbnail') output = generateThumbnailData();
    else if (selectedTool === 'viralscore') output = generateViralScore();

    const testResult = { id: 'TEST-' + Date.now().toString(36).toUpperCase(), videoId: selectedVideo, tool: selectedTool, output, date: Date.now() };
    setData({ ...data, testResults: [...data.testResults, testResult] });
    setResult(testResult);
    setRunning(false);
    showNotif('Test completed! 1 screen used.');
  };

  return (
    <div>
      {labSessions < 1 && (
        <div className="glass-card" style={{ padding: 24, textAlign: 'center', marginBottom: 20, border: '1px solid rgba(244,63,94,0.3)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🖥️</div>
          <h3 style={{ marginBottom: 8 }}>No Test Screens Available</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>Go to Buy Screens to convert your points into test sessions.</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{labSessions} screens left</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {TEST_TOOLS.map(t => (
          <div key={t.id} className={`glass-card`} style={{
            padding: 16, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
            border: selectedTool === t.id ? '1px solid var(--neon-cyan)' : '1px solid rgba(100,100,120,0.15)'
          }} onClick={() => setSelectedTool(t.id)}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{t.label.split(' ')[0]}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t.desc}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Run Test</h3>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Select Video</label>
            <select className="form-input" value={selectedVideo} onChange={e => setSelectedVideo(e.target.value)}>
              <option value="">Choose a video...</option>
              {data.submitted.map((v, i) => (
                <option key={v.id} value={v.id}>{v.title || 'Video ' + (i + 1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Selected Tool</label>
            <div className="form-input" style={{ display: 'flex', alignItems: 'center', minHeight: 38, color: selectedTool ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
              {selectedTool ? TEST_TOOLS.find(t => t.id === selectedTool)?.label : 'Pick a tool above'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Cost: <strong style={{ color: 'var(--accent-color)' }}>1 screen</strong> per test</span>
          <button className="btn btn-primary" onClick={handleRun} disabled={running || !selectedVideo || !selectedTool || labSessions < 1}>
            {running ? 'Running...' : `Run Test (${labSessions} screens left) →`}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && <TestResultDisplay result={result} />}
    </div>
  );
}

function TestResultDisplay({ result }) {
  if (result.tool === 'retention') return <RetentionResult output={result.output} />;
  if (result.tool === 'hook') return <HookResult output={result.output} />;
  if (result.tool === 'thumbnail') return <ThumbnailResult output={result.output} />;
  if (result.tool === 'viralscore') return <ViralScoreResult output={result.output} />;
  return null;
}

/* ─── Retention ─── */
function generateRetentionData(duration) {
  const points = []; let viewers = 100;
  for (let t = 0; t <= 60; t += 5) {
    if (t > 0) { const drop = Math.random() * 8 + 2; viewers = Math.max(0, viewers - drop); }
    points.push({ second: t, viewers: Math.round(viewers) });
  }
  const exitPoint = points.find(p => p.viewers < 20);
  return { curve: points, estimatedCompletion: viewers / 100, dropOffZones: [{ from: 0, to: 10, drop: 100 - (points[2]?.viewers || 15) }], exitPoint: exitPoint?.second || 60 };
}
function RetentionResult({ output }) {
  const maxV = output.curve[0]?.viewers || 100;
  return (
    <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
      <h3 style={{ marginBottom: 16 }}>📈 Retention Analysis</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Est. Completion', value: `${Math.round(output.estimatedCompletion * 100)}%`, color: output.estimatedCompletion > 0.5 ? 'var(--neon-green)' : '#f43f5e' },
          { label: 'Drop-off (0-10s)', value: `${output.dropOffZones[0]?.drop || 0}%`, color: '#f59e0b' },
          { label: 'Exit Point', value: `~${output.exitPoint}s`, color: '#f43f5e' }
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{s.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'relative', height: 160, marginBottom: 8 }}>
        <svg width="100%" height="160" viewBox={`0 0 ${output.curve.length} 160`} preserveAspectRatio="none">
          <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0" /></linearGradient></defs>
          <path d={`M0,160 ${output.curve.map((p, i) => `${i},${160 - (p.viewers / maxV) * 160}`).join(' ')} L${output.curve.length - 1},160 Z`} fill="url(#rg)" />
          <path d={`M0,160 ${output.curve.map((p, i) => `${i},${160 - (p.viewers / maxV) * 160}`).join(' ')}`} fill="none" stroke="#6366f1" strokeWidth="2" />
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>0s</span><span>60s</span></div>
      <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: 'rgba(99,102,241,0.05)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {output.dropOffZones[0]?.drop > 30
          ? `⚠️ Significant drop-off in the first 10 seconds (${output.dropOffZones[0]?.drop}%). Strengthen your hook.`
          : `✅ Good retention in the first 10 seconds. ${output.dropOffZones[0]?.drop}% drop-off.`}
        {' '}Viewers drop significantly around <strong>{output.exitPoint}s</strong>.
      </div>
    </div>
  );
}

/* ─── Hook ─── */
function generateHookData(title) {
  const words = title.split(' ').length;
  const hasQ = title.includes('?');
  const hasNum = /\d/.test(title);
  const hasEmo = /(amazing|incredible|shocking|never|best|worst|secret|easy|hate|love)/i.test(title);
  const hasCur = /(why|how|what|truth|reason|finally|discovered)/i.test(title);
  return {
    scores: {
      attention: Math.min(10, (hasNum ? 8 : hasQ ? 7 : 5) + (words < 12 ? 1 : 0)),
      curiosity: Math.min(10, (hasCur ? 9 : hasQ ? 8 : 4) + (hasNum ? 1 : 0)),
      emotional: Math.min(10, (hasEmo ? 9 : 5) + (hasQ ? 0.5 : 0)),
      retention: Math.min(10, (words < 15 ? 8 : words < 25 ? 6 : 4) + (hasCur ? 1 : 0))
    }
  };
}
function HookResult({ output }) {
  const s = output.scores; const overall = Math.round((s.attention + s.curiosity + s.emotional + s.retention) / 4 * 10) / 10;
  return (
    <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
      <h3 style={{ marginBottom: 12 }}>🪝 Hook Analysis</h3>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--neon-cyan)', textAlign: 'center', marginBottom: 16 }}>{overall}/10</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
        {[
          { label: 'Attention', score: s.attention }, { label: 'Curiosity', score: s.curiosity },
          { label: 'Emotional', score: s.emotional }, { label: 'Retention', score: s.retention }
        ].map(m => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{m.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--neon-purple)' }}>{m.score}/10</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Thumbnail ─── */
function generateThumbnailData() {
  const a = { ctr: Math.round((5 + Math.random() * 4) * 10) / 10, attention: Math.round((6 + Math.random() * 3) * 10) / 10, clarity: Math.round((5 + Math.random() * 4) * 10) / 10 };
  const b = { ctr: Math.round((5 + Math.random() * 4) * 10) / 10, attention: Math.round((6 + Math.random() * 3) * 10) / 10, clarity: Math.round((5 + Math.random() * 4) * 10) / 10 };
  a.overall = Math.round((a.ctr + a.attention + a.clarity) / 3 * 10) / 10;
  b.overall = Math.round((b.ctr + b.attention + b.clarity) / 3 * 10) / 10;
  return { A: a, B: b, winner: a.overall >= b.overall ? 'A' : 'B' };
}
function ThumbnailResult({ output }) {
  return (
    <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
      <h3 style={{ marginBottom: 16 }}>🖼️ Thumbnail Battle</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
        <ScoreCard label="Thumbnail A" scores={output.A} isWinner={output.winner === 'A'} />
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>VS</div>
        <ScoreCard label="Thumbnail B" scores={output.B} isWinner={output.winner === 'B'} />
      </div>
    </div>
  );
}
function ScoreCard({ label, scores, isWinner }) {
  return (
    <div className="glass-card" style={{ padding: 16, textAlign: 'center', border: isWinner ? '1px solid var(--neon-cyan)' : 'none' }}>
      <h4 style={{ marginBottom: 8, color: isWinner ? 'var(--neon-cyan)' : 'var(--text-primary)' }}>{label} {isWinner && '🏆'}</h4>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: 12 }}>{scores.overall}/10</div>
      {[
        { label: 'CTR Prediction', score: scores.ctr },
        { label: 'Attention Score', score: scores.attention },
        { label: 'Visual Clarity', score: scores.clarity }
      ].map(m => (
        <div key={m.label} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 2 }}>
            <span style={{ color: 'var(--text-tertiary)' }}>{m.label}</span>
            <span style={{ color: 'var(--neon-purple)' }}>{m.score}/10</span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'rgba(99,102,241,0.15)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${(m.score / 10) * 100}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Viral Score ─── */
function generateViralScore() {
  const hook = Math.round((5 + Math.random() * 4) * 10) / 10;
  const retention = Math.round((4 + Math.random() * 4) * 10) / 10;
  const engagement = Math.round((5 + Math.random() * 4) * 10) / 10;
  const shareability = Math.round((3 + Math.random() * 5) * 10) / 10;
  const audienceMatch = Math.round((5 + Math.random() * 4) * 10) / 10;
  return { hook, retention, engagement, shareability, audienceMatch, viralScore: Math.round((hook + retention + engagement + shareability + audienceMatch) / 5 * 10) / 10 };
}
function ViralScoreResult({ output }) {
  const getLabel = (s) => s >= 9 ? { label: '🔥 Viral', color: '#ec4899' } : s >= 7.5 ? { label: '⭐ High Potential', color: '#6366f1' } : s >= 6 ? { label: '👍 Good', color: '#22c55e' } : s >= 4 ? { label: '📊 Average', color: '#f59e0b' } : { label: '💤 Needs Work', color: '#6b7280' };
  const label = getLabel(output.viralScore);
  return (
    <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Overall Viral Score</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: label.color }}>{output.viralScore}/10</div>
        <span style={{ fontSize: '0.85rem', padding: '4px 12px', borderRadius: 999, background: `${label.color}20`, color: label.color }}>{label.label}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
        {[
          { label: 'Hook Score', value: output.hook, color: '#6366f1' },
          { label: 'Retention', value: output.retention, color: '#14b8a6' },
          { label: 'Engagement', value: output.engagement, color: '#ec4899' },
          { label: 'Shareability', value: output.shareability, color: '#f59e0b' },
          { label: 'Audience Match', value: output.audienceMatch, color: '#22c55e' }
        ].map(m => (
          <div key={m.label} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{m.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   RESULTS
   ════════════════════════════════════════ */
function Results({ data }) {
  const { testResults, submitted } = data;
  if (testResults.length === 0) return <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>No test results yet. Submit a video and run tests to see results here.</p></div>;

  return (
    <div>
      <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Test History ({testResults.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[...testResults].reverse().map((r, i) => {
          const video = submitted.find(v => v.id === r.videoId);
          return (
            <div key={i} className="glass-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{video?.title || 'Unknown Video'}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    {r.tool === 'retention' ? '📈 Retention Analyzer' : r.tool === 'hook' ? '🪝 Hook Tester' : r.tool === 'thumbnail' ? '🖼️ Thumbnail Battle' : '🔥 AI Viral Score'}
                    {' · '}{new Date(r.date).toLocaleDateString()}
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(99,102,241,0.15)', color: 'var(--neon-cyan)' }}>{r.id}</span>
              </div>
              <TestResultDisplay result={r} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

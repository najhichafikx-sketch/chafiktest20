'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './youtube-creator-suite-pro.module.css';

const SIDEBAR = [
  {
    group: 'Main',
    items: [
      { id: 'trends', label: 'Trending', icon: '🔥' },
      { id: 'revenue', label: 'Revenue Forecast', icon: '💰' }
    ]
  },
  {
    group: 'AI Tools',
    items: [
      { id: 'ai-idea', label: 'Video Idea Generator', icon: '💡' },
      { id: 'ai-hooks', label: 'Viral Hooks', icon: '🪝' },
      { id: 'ai-script', label: 'Script Writer', icon: '📜' },
      { id: 'ai-title', label: 'Title Generator', icon: '✏️' },
      { id: 'ai-description', label: 'Description Generator', icon: '📄' },
      { id: 'ai-tags', label: 'Tags Generator', icon: '🏷️' },
      { id: 'ai-thumbnail', label: 'Thumbnail Prompts', icon: '🖼️' },
      { id: 'ai-seo', label: 'SEO Optimizer', icon: '🔍' }
    ]
  },
  {
    group: 'YouTube Tools',
    items: [
      { id: 'ut-tags', label: 'Tag Extractor', icon: '🏷️' },
      { id: 'ut-hashtag', label: 'Hashtag Generator', icon: '#️⃣' },
      { id: 'ut-title-extract', label: 'Title Extractor', icon: '📝' },
      { id: 'ut-title-gen', label: 'Title Generator', icon: '✍️' },
      { id: 'ut-title-length', label: 'Title Length Checker', icon: '📏' },
      { id: 'ut-desc-extract', label: 'Description Extractor', icon: '📋' },
      { id: 'ut-desc-gen', label: 'Description Generator', icon: '📃' },
      { id: 'ut-embed', label: 'Embed Code Generator', icon: '📺' },
      { id: 'ut-channel-id', label: 'Channel ID Extractor', icon: '🆔' },
      { id: 'ut-video-stats', label: 'Video Statistics', icon: '📊' },
      { id: 'ut-channel-stats', label: 'Channel Statistics', icon: '📈' },
      { id: 'ut-region', label: 'Region Restriction Check', icon: '🌍' },
      { id: 'ut-channel-logo', label: 'Channel Logo Downloader', icon: '🖼️' },
      { id: 'ut-channel-banner', label: 'Channel Banner Downloader', icon: '🎨' },
      { id: 'ut-channel-finder', label: 'Channel Finder', icon: '🔍' },
      { id: 'ut-thumbnail', label: 'Thumbnail Downloader', icon: '🖼️' },
      { id: 'ut-timestamp', label: 'Timestamp Link Generator', icon: '⏱️' },
      { id: 'ut-subscribe', label: 'Subscribe Link Generator', icon: '🔔' },
      { id: 'ut-revenue-calc', label: 'Revenue Calculator', icon: '💵' },
      { id: 'ut-video-count', label: 'Video Counter', icon: '🔢' },
      { id: 'ut-title-cap', label: 'Title Case Tool', icon: '🔠' },
      { id: 'ut-comment-pick', label: 'Comment Picker', icon: '🎲' },
      { id: 'ut-views-ratio', label: 'Views-to-Likes Ratio', icon: '📐' },
      { id: 'ut-channel-age', label: 'Channel Age Checker', icon: '🎂' }
    ]
  }
];

const NICHES = [
  { id: 'tech', label: 'Technology', categoryId: '28' },
  { id: 'health', label: 'Health', categoryId: '26' },
  { id: 'money', label: 'Make Money Online', categoryId: '28' },
  { id: 'cooking', label: 'Cooking', categoryId: '26' },
  { id: 'education', label: 'Education', categoryId: '27' },
  { id: 'gaming', label: 'Gaming', categoryId: '20' },
  { id: 'travel', label: 'Travel', categoryId: '19' },
  { id: 'sports', label: 'Sports', categoryId: '17' }
];

const COUNTRIES = [
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'EG', label: 'Egypt' },
  { code: 'AE', label: 'UAE' },
  { code: 'US', label: 'USA' },
  { code: 'GB', label: 'UK' }
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'Arabic' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'tr', label: 'Turkish' },
  { code: 'de', label: 'German' }
];

const RPM_TABLE = {
  finance: { min: 8, max: 15, growth: 12 },
  tech: { min: 4, max: 9, growth: 8 },
  health: { min: 3, max: 7, growth: 6 },
  education: { min: 2, max: 5, growth: 4 },
  gaming: { min: 1, max: 3, growth: 3 },
  entertainment: { min: 1, max: 3, growth: 2 },
  cooking: { min: 2, max: 5, growth: 4 },
  travel: { min: 2, max: 6, growth: 5 },
  sports: { min: 2, max: 5, growth: 4 }
};

const NICHE_TO_RPM = {
  tech: 'tech',
  health: 'health',
  money: 'finance',
  cooking: 'cooking',
  education: 'education',
  gaming: 'gaming',
  travel: 'travel',
  sports: 'sports'
};

const AI_TOOL_PROMPTS = {
  'ai-idea': 'You are a YouTube content strategist. Generate 10 unique, viral video ideas for the given niche. Include: title idea, hook, why it will perform well. Output in the user\'s chosen language.',
  'ai-hooks': 'You are a YouTube hook specialist. Generate 10 powerful opening hooks for the given video topic. Each hook must grab attention in the first 3 seconds. Output in the user\'s chosen language.',
  'ai-script': 'You are a professional YouTube scriptwriter. Write a complete video script with: Hook (0-15s), Intro, Main Content (with timestamps), CTA, Outro. Output in the user\'s chosen language.',
  'ai-title': 'You are a YouTube SEO expert. Generate 10 optimized video titles for the given topic. Mix curiosity, numbers, and power words. Output in the user\'s chosen language.',
  'ai-description': 'You are a YouTube SEO specialist. Write a full video description with: main paragraph, timestamps section, keywords section, links section, hashtags. Output in the user\'s chosen language.',
  'ai-tags': 'You are a YouTube tags expert. Generate 30 optimized tags for the given video. Mix broad, medium, and long-tail keywords. Output as comma-separated list.',
  'ai-thumbnail': 'You are an AI image prompt specialist for YouTube thumbnails. Generate 5 detailed image generation prompts (for Midjourney/DALL-E/Flux) for the given video topic. Each prompt must describe: composition, colors, text overlay suggestion, emotion, style.',
  'ai-seo': 'You are a YouTube SEO auditor. Given a video title, description, and tags, provide a full SEO audit with: score out of 100, what is good, what to improve, optimized versions of title/description/tags. Output in the user\'s chosen language.'
};

const UTILITY_CONFIG = {
  'ut-tags': { kind: 'videoId', label: 'Video URL or ID', placeholder: 'https://youtu.be/... or videoId', tool: 'tag-extractor', submitLabel: 'Extract Tags' },
  'ut-hashtag': { kind: 'text-ai', label: 'Topic', placeholder: 'e.g. technology, cooking, gaming...', tool: 'ai-generate', systemPrompt: 'You are a YouTube hashtag expert. Generate 20 relevant hashtags for the given topic. Mix broad, niche, and trending hashtags. Format as a space-separated list with # prefix.', submitLabel: 'Generate Hashtags' },
  'ut-title-extract': { kind: 'videoId', label: 'Video URL or ID', placeholder: 'https://youtu.be/...', tool: 'title-extractor', submitLabel: 'Extract Title' },
  'ut-title-gen': { kind: 'text-ai', label: 'Topic', placeholder: 'e.g. iPhone 15 review', tool: 'ai-generate', systemPrompt: 'You are a YouTube title specialist. Generate 15 viral video titles for the given topic. Mix curiosity, numbers, and power words. Output as a numbered list. Output in the user\'s chosen language.', submitLabel: 'Generate Titles' },
  'ut-title-length': { kind: 'frontend', frontend: 'title-length', label: 'Title', placeholder: 'Type your title here...', submitLabel: 'Check Length' },
  'ut-desc-extract': { kind: 'videoId', label: 'Video URL or ID', placeholder: 'https://youtu.be/...', tool: 'description-extractor', submitLabel: 'Extract Description' },
  'ut-desc-gen': { kind: 'text-ai', label: 'Video Title', placeholder: 'e.g. Top 5 Programming Languages 2026', tool: 'ai-generate', systemPrompt: 'You are a YouTube description specialist. Write a full YouTube description for the given title with: hook paragraph, what viewers will learn, timestamps placeholder, keywords section, hashtags, and CTA. Output in the user\'s chosen language.', submitLabel: 'Generate Description' },
  'ut-embed': { kind: 'frontend', frontend: 'embed', label: 'Video URL', placeholder: 'https://www.youtube.com/watch?v=...', submitLabel: 'Generate Embed Code' },
  'ut-channel-id': { kind: 'frontend', frontend: 'channel-id', label: 'Channel URL or Name', placeholder: 'https://www.youtube.com/@channelname', tool: 'channel-id-extractor', submitLabel: 'Extract Channel ID' },
  'ut-video-stats': { kind: 'videoId', label: 'Video URL or ID', placeholder: 'https://youtu.be/...', tool: 'video-statistics', submitLabel: 'View Statistics' },
  'ut-channel-stats': { kind: 'channelRef', label: 'Channel URL or ID', placeholder: 'https://youtube.com/@channel', tool: 'channel-statistics', submitLabel: 'View Channel Statistics' },
  'ut-region': { kind: 'videoId', label: 'Video URL or ID', placeholder: 'https://youtu.be/...', tool: 'region-restriction', submitLabel: 'Check Restrictions' },
  'ut-channel-logo': { kind: 'channelRef', label: 'Channel URL or ID', placeholder: 'https://youtube.com/@channel', tool: 'channel-logo', submitLabel: 'Fetch Logo' },
  'ut-channel-banner': { kind: 'channelRef', label: 'Channel URL or ID', placeholder: 'https://youtube.com/@channel', tool: 'channel-banner', submitLabel: 'Fetch Banner' },
  'ut-channel-finder': { kind: 'text', label: 'Channel Name to Search', placeholder: 'e.g. Marques Brownlee', tool: 'channel-finder', submitLabel: 'Search' },
  'ut-thumbnail': { kind: 'videoId', label: 'Video URL or ID', placeholder: 'https://youtu.be/...', tool: 'thumbnail-downloader', submitLabel: 'Fetch Thumbnails' },
  'ut-timestamp': { kind: 'frontend', frontend: 'timestamp', label: 'Video URL and Time', placeholder: 'Paste URL and seconds (e.g. https://youtu.be/abc 90)', submitLabel: 'Generate Link' },
  'ut-subscribe': { kind: 'frontend', frontend: 'subscribe', label: 'Channel URL', placeholder: 'https://youtube.com/@channel', submitLabel: 'Generate Subscribe Link' },
  'ut-revenue-calc': { kind: 'frontend', frontend: 'revenue-calc', label: '', placeholder: '', submitLabel: 'Calculate' },
  'ut-video-count': { kind: 'channelRef', label: 'Channel URL or ID', placeholder: 'https://youtube.com/@channel', tool: 'video-count', submitLabel: 'Count Videos' },
  'ut-title-cap': { kind: 'frontend', frontend: 'title-cap', label: 'Title', placeholder: 'Type your title here...', submitLabel: 'Convert' },
  'ut-comment-pick': { kind: 'frontend', frontend: 'comment-pick', label: 'Comments (one per line)', placeholder: 'comment 1\ncomment 2\n...', submitLabel: 'Pick Random Comment' },
  'ut-views-ratio': { kind: 'frontend', frontend: 'views-ratio', label: '', placeholder: '', submitLabel: 'Calculate Ratio' },
  'ut-channel-age': { kind: 'channelRef', label: 'Channel URL or ID', placeholder: 'https://youtube.com/@channel', tool: 'channel-age', submitLabel: 'Check Age' }
};

export default function YouTubeCreatorSuiteProClient() {
  const [active, setActive] = useState('trends');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rateLimit, setRateLimit] = useState({ allowed: true, retry_after_seconds: 0 });
  const [globalError, setGlobalError] = useState('');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    async function loadRateLimit() {
      try {
        const res = await fetch('/api/creator-suite/rate-limit-status');
        const data = await res.json();
        if (data && typeof data.allowed === 'boolean') {
          setRateLimit({ allowed: data.allowed, retry_after_seconds: data.retry_after_seconds || 0 });
        }
      } catch {}
    }
    loadRateLimit();
  }, []);

  function formatCountdown(seconds) {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className={styles.shell}>
      <button type="button" className={styles.mobileToggle} onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>📺</span>
            <div>
              <div className={styles.brandTitle}>YouTube Creator</div>
              <div className={styles.brandSubtitle}>Suite Pro</div>
            </div>
          </div>
        </div>

        <div className={styles.langRow}>
          <label className={styles.langLabel}>Language</label>
          <select className={styles.langSelect} value={language} onChange={e => setLanguage(e.target.value)}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        <div className={`${styles.rateBox} ${rateLimit.allowed ? styles.rateBoxOk : styles.rateBoxWarn}`}>
          {rateLimit.allowed ? (
            <>✅ Ready to use</>
          ) : (
            <>⏳ Please wait: <strong>{formatCountdown(rateLimit.retry_after_seconds)}</strong></>
          )}
        </div>

        <nav className={styles.nav}>
          {SIDEBAR.map((group, gi) => (
            <div key={gi} className={styles.navGroup}>
              <div className={styles.navGroupTitle}>{group.group}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.navItem} ${active === item.id ? styles.navItemActive : ''}`}
                  onClick={() => { setActive(item.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                >
                  <span className={styles.navItemIcon}>{item.icon}</span>
                  <span className={styles.navItemLabel}>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        {globalError && <div className={styles.globalError}>⚠️ {globalError}</div>}
        {active === 'trends' && <TrendsView language={language} onError={setGlobalError} onRateLimit={setRateLimit} />}
        {active === 'revenue' && <RevenueView />}
        {active.startsWith('ai-') && <AIToolView toolId={active} language={language} onError={setGlobalError} onRateLimit={setRateLimit} />}
        {active.startsWith('ut-') && <UtilityToolView toolId={active} language={language} onError={setGlobalError} onRateLimit={setRateLimit} />}
      </main>
    </div>
  );
}

function extractVideoId(input) {
  if (!input) return '';
  const s = String(input).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m1 = s.match(/[?&]v=([\w-]{11})/);
  if (m1) return m1[1];
  const m2 = s.match(/youtu\.be\/([\w-]{11})/);
  if (m2) return m2[1];
  const m3 = s.match(/\/shorts\/([\w-]{11})/);
  if (m3) return m3[1];
  const m4 = s.match(/\/embed\/([\w-]{11})/);
  if (m4) return m4[1];
  return s;
}

function extractChannelRef(input) {
  if (!input) return '';
  const s = String(input).trim();
  const m1 = s.match(/youtube\.com\/channel\/([\w-]+)/);
  if (m1) return { type: 'id', value: m1[1] };
  const m2 = s.match(/youtube\.com\/@([\w.-]+)/);
  if (m2) return { type: 'handle', value: '@' + m2[1] };
  if (s.startsWith('@')) return { type: 'handle', value: s };
  if (/^UC[\w-]{20,}$/.test(s)) return { type: 'id', value: s };
  return { type: 'handle', value: s };
}

function formatNumber(n) {
  if (n == null) return '0';
  const num = Number(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return String(num);
}

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const days = Math.floor((now - d) / 86400000);
  if (days < 1) return 'Today';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function TrendsView({ language, onError, onRateLimit }) {
  const [niche, setNiche] = useState('tech');
  const [country, setCountry] = useState('SA');
  const [keyword, setKeyword] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extractStates, setExtractStates] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      onError('');
      const cat = NICHES.find(n => n.id === niche)?.categoryId || '28';
      try {
        const res = await fetch('/api/creator-suite/trends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ niche, country, categoryId: cat, keyword })
        });
        if (cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          onError(data.message || 'Failed to load trends');
          setVideos([]);
        } else {
          setVideos(data.videos || []);
        }
      } catch (e) {
        if (!cancelled) onError('Server connection failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [niche, country, keyword, refreshKey, onError]);

  function refresh() {
    setRefreshKey(k => k + 1);
  }

  async function handleExtract(video, type) {
    const key = `${video.id}-${type}`;
    setExtractStates(s => ({ ...s, [key]: { loading: true, output: '' } }));
    let systemPrompt = '';
    let userPrompt = '';
    const title = video.title;
    const transcriptHint = video.id ? `\n\nVideo ID: ${video.id}` : '';

    if (type === 'script') {
      systemPrompt = 'You are a professional YouTube scriptwriter. Write a complete video script based on the given video title with: Hook (0-15s), Intro, Main Content (with timestamps), CTA, Outro. Make it engaging and well-structured.';
      userPrompt = `Write a complete YouTube script for a video titled: "${title}".${transcriptHint}\n\nInclude timestamps, narration, and visual cues.`;
    } else if (type === 'title') {
      systemPrompt = 'You are a YouTube SEO expert. Generate 10 optimized alternative titles for the given video. Mix curiosity, numbers, and power words.';
      userPrompt = `Generate 10 optimized alternative titles for a YouTube video titled: "${title}". Make them more clickable and SEO-friendly.`;
    } else if (type === 'tags') {
      systemPrompt = 'You are a YouTube tags expert. Generate 30 optimized tags for the given video. Mix broad, medium, and long-tail keywords. Output as a comma-separated list.';
      userPrompt = `Generate 30 optimized YouTube tags for a video titled: "${title}". Output as a comma-separated list.`;
    } else if (type === 'thumbnail') {
      systemPrompt = 'You are an AI image prompt specialist for YouTube thumbnails. Generate 5 detailed image generation prompts (for Midjourney/DALL-E/Flux) for the given video topic. Each prompt must describe: composition, colors, text overlay suggestion, emotion, style.';
      userPrompt = `Generate 5 detailed image generation prompts for YouTube thumbnails based on this video title: "${title}".`;
    }

    try {
      const res = await fetch('/api/creator-suite/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: type, prompt: userPrompt, systemPrompt, language })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'rate_limited') {
          onRateLimit({ allowed: false, retry_after_seconds: data.retry_after_seconds || 0 });
        }
        setExtractStates(s => ({ ...s, [key]: { loading: false, output: '', error: data.message || 'Generation failed' } }));
      } else {
        setExtractStates(s => ({ ...s, [key]: { loading: false, output: data.result || '', error: '' } }));
        if (data.retry_after_seconds != null) onRateLimit({ allowed: true, retry_after_seconds: 0 });
      }
    } catch (e) {
      setExtractStates(s => ({ ...s, [key]: { loading: false, output: '', error: 'Connection failed' } }));
    }
  }

  return (
    <div className={styles.view}>
      <div className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>🔥 Trending — Most Popular Videos</h2>
        <p className={styles.viewSubtitle}>Discover trending videos in your niche and extract scripts and titles with AI</p>
      </div>

      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          placeholder="🔍 Search by keyword (optional)..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') refresh(); }}
        />
        <select className={styles.select} value={country} onChange={e => setCountry(e.target.value)}>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
        <button type="button" className={styles.btnPrimary} onClick={refresh} disabled={loading}>
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      <div className={styles.pills}>
        {NICHES.map(n => (
          <button
            key={n.id}
            type="button"
            className={`${styles.pill} ${niche === n.id ? styles.pillActive : ''}`}
            onClick={() => setNiche(n.id)}
          >
            {n.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <div className={styles.spinner}></div>
          <p>Loading trending videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className={styles.emptyBox}>No videos found. Make sure to add a YouTube Data API key in the admin dashboard.</div>
      ) : (
        <div className={styles.videoGrid}>
          {videos.map((v, i) => (
            <div key={v.id} className={styles.videoCard}>
              <div className={styles.videoThumb}>
                <img src={v.thumbnail} alt={v.title} loading="lazy" />
                <span className={styles.videoRank}>#{i + 1}</span>
              </div>
              <div className={styles.videoInfo}>
                <h3 className={styles.videoTitle}>{v.title}</h3>
                <div className={styles.videoMeta}>
                  <span>👁️ {formatNumber(v.views)}</span>
                  <span>👍 {formatNumber(v.likes)}</span>
                  <span>🕒 {timeAgo(v.publishedAt)}</span>
                </div>
                <div className={styles.extractRow}>
                  <button type="button" className={styles.extractBtn} onClick={() => handleExtract(v, 'script')} disabled={extractStates[`${v.id}-script`]?.loading}>
                    Script
                  </button>
                  <button type="button" className={styles.extractBtn} onClick={() => handleExtract(v, 'title')} disabled={extractStates[`${v.id}-title`]?.loading}>
                    Title
                  </button>
                  <button type="button" className={styles.extractBtn} onClick={() => handleExtract(v, 'tags')} disabled={extractStates[`${v.id}-tags`]?.loading}>
                    Keywords
                  </button>
                  <button type="button" className={styles.extractBtn} onClick={() => handleExtract(v, 'thumbnail')} disabled={extractStates[`${v.id}-thumbnail`]?.loading}>
                    Thumbnail
                  </button>
                </div>
                {(extractStates[`${v.id}-script`]?.output || extractStates[`${v.id}-title`]?.output || extractStates[`${v.id}-tags`]?.output || extractStates[`${v.id}-thumbnail`]?.output) && (
                  <div className={styles.extractOutput}>
                    <pre>{extractStates[`${v.id}-script`]?.output || extractStates[`${v.id}-title`]?.output || extractStates[`${v.id}-tags`]?.output || extractStates[`${v.id}-thumbnail`]?.output}</pre>
                    <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(extractStates[`${v.id}-script`]?.output || extractStates[`${v.id}-title`]?.output || extractStates[`${v.id}-tags`]?.output || extractStates[`${v.id}-thumbnail`]?.output)}>
                      📋 Copy
                    </button>
                  </div>
                )}
                {Object.entries(extractStates).filter(([k]) => k.startsWith(v.id + '-') && extractStates[k]?.error).map(([k, s]) => (
                  <div key={k} className={styles.extractError}>⚠️ {s.error}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RevenueView() {
  const [views, setViews] = useState(10000);
  const [videosPerMonth, setVideosPerMonth] = useState(8);
  const [niche, setNiche] = useState('tech');
  const [country, setCountry] = useState('SA');

  const result = useMemo(() => {
    const rpm = RPM_TABLE[NICHE_TO_RPM[niche] || 'tech'];
    const totalViews = views * videosPerMonth;
    const minRevenue = (totalViews / 1000) * rpm.min;
    const maxRevenue = (totalViews / 1000) * rpm.max;
    const avgRpm = ((rpm.min + rpm.max) / 2);
    return {
      minRevenue, maxRevenue, avgRpm, totalViews, growth: rpm.growth,
      perVideo: Array.from({ length: Math.min(videosPerMonth, 30) }, (_, i) => ({
        n: i + 1,
        views,
        minR: (views / 1000) * rpm.min,
        maxR: (views / 1000) * rpm.max
      }))
    };
  }, [views, videosPerMonth, niche]);

  return (
    <div className={styles.view}>
      <div className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>💰 Monthly Revenue Forecast</h2>
        <p className={styles.viewSubtitle}>Calculate your expected YouTube earnings based on views and niche</p>
      </div>

      <div className={styles.card}>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Average views per video</label>
            <input type="number" className={styles.input} value={views} onChange={e => setViews(Number(e.target.value) || 0)} min="0" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Videos per month</label>
            <input type="number" className={styles.input} value={videosPerMonth} onChange={e => setVideosPerMonth(Number(e.target.value) || 0)} min="0" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Niche</label>
            <select className={styles.select} value={niche} onChange={e => setNiche(e.target.value)}>
              {NICHES.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Region</label>
            <select className={styles.select} value={country} onChange={e => setCountry(e.target.value)}>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {result && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💵</div>
              <div className={styles.statLabel}>Total expected revenue</div>
              <div className={styles.statValue}>${result.minRevenue.toFixed(0)} - ${result.maxRevenue.toFixed(0)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statLabel}>Average RPM</div>
              <div className={styles.statValue}>${result.avgRpm.toFixed(2)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👁️</div>
              <div className={styles.statLabel}>Total views</div>
              <div className={styles.statValue}>{formatNumber(result.totalViews)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📈</div>
              <div className={styles.statLabel}>Expected growth rate</div>
              <div className={styles.statValue}>+{result.growth}%</div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Per-video details</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Views</th>
                    <th>Min revenue</th>
                    <th>Max revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {result.perVideo.map(v => (
                    <tr key={v.n}>
                      <td>#{v.n}</td>
                      <td>{formatNumber(v.views)}</td>
                      <td>${v.minR.toFixed(2)}</td>
                      <td>${v.maxR.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AIToolView({ toolId, language, onError, onRateLimit }) {
  const [input, setInput] = useState('');
  const [extra, setExtra] = useState('');
  const [extra2, setExtra2] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const config = {
    'ai-idea': { title: '💡 Video Idea Generator', placeholder: 'Describe your niche or channel topic...', multiline: true, hint: 'e.g. A tech channel focused on reviews' },
    'ai-hooks': { title: '🪝 Viral Hooks Generator', placeholder: 'Video topic...', multiline: true, hint: 'e.g. How to start your own business' },
    'ai-script': { title: '📜 Script Writer', placeholder: 'Video title or topic...', multiline: true, hint: 'e.g. Top 5 programming languages in 2026' },
    'ai-title': { title: '✏️ Title Generator', placeholder: 'Video topic...', multiline: false, hint: 'e.g. iPhone 15 Pro Max review' },
    'ai-description': { title: '📄 Description Generator', placeholder: 'Video title...', multiline: false, hint: 'e.g. Top 5 programming languages for beginners' },
    'ai-tags': { title: '🏷️ Tags Generator', placeholder: 'Video title or topic...', multiline: false, hint: 'e.g. iPhone 15 review' },
    'ai-thumbnail': { title: '🖼️ Thumbnail Prompt Generator', placeholder: 'Video topic...', multiline: true, hint: 'e.g. How to make money on YouTube' },
    'ai-seo': { title: '🔍 SEO Optimizer', placeholder: 'Current title', multiline: false, extra: true, extraPlaceholder: 'Current description...', extra2: true, extra2Placeholder: 'Current tags (comma-separated)...', hint: 'Paste the title, description, and tags to analyze them' }
  }[toolId] || {};

  async function generate() {
    if (!input.trim()) {
      onError('Please enter your input');
      return;
    }
    setLoading(true);
    setOutput('');
    onError('');
    const languageName = LANGUAGES.find(l => l.code === language)?.label || 'English';
    const baseSystem = AI_TOOL_PROMPTS[toolId] || '';
    const systemPrompt = `${baseSystem} Output language: ${languageName}.`;

    let userPrompt = input;
    if (toolId === 'ai-seo') {
      userPrompt = `Title: ${input}\n\nDescription: ${extra || '(none provided)'}\n\nTags: ${extra2 || '(none provided)'}\n\nPlease provide a complete SEO audit.`;
    }

    try {
      const res = await fetch('/api/creator-suite/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolId, prompt: userPrompt, systemPrompt, language })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'rate_limited') {
          onRateLimit({ allowed: false, retry_after_seconds: data.retry_after_seconds || 0 });
        }
        onError(data.message || 'Generation failed');
      } else {
        setOutput(data.result || '');
        if (data.retry_after_seconds != null) onRateLimit({ allowed: true, retry_after_seconds: 0 });
      }
    } catch (e) {
      onError('Server connection failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.view}>
      <div className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>{config.title}</h2>
        {config.hint && <p className={styles.viewSubtitle}>{config.hint}</p>}
      </div>

      <div className={styles.card}>
        <div className={styles.field}>
          <label className={styles.label}>Input</label>
          <textarea className={styles.textarea} value={input} onChange={e => setInput(e.target.value)} placeholder={config.placeholder} rows={config.multiline ? 4 : 2} />
        </div>
        {config.extra && (
          <div className={styles.field}>
            <label className={styles.label}>Additional Input</label>
            <textarea className={styles.textarea} value={extra} onChange={e => setExtra(e.target.value)} placeholder={config.extraPlaceholder} rows={3} />
          </div>
        )}
        {config.extra2 && (
          <div className={styles.field}>
            <label className={styles.label}>Additional Input 2</label>
            <textarea className={styles.textarea} value={extra2} onChange={e => setExtra2(e.target.value)} placeholder={config.extra2Placeholder} rows={2} />
          </div>
        )}
        <button type="button" className={styles.btnPrimary} onClick={generate} disabled={loading}>
          {loading ? '⏳ Generating...' : '✨ Generate'}
        </button>
      </div>

      {output && (
        <div className={styles.card}>
          <div className={styles.outputHeader}>
            <h3 className={styles.cardTitle}>Result</h3>
            <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output)}>📋 Copy</button>
          </div>
          <pre className={styles.output}>{output}</pre>
        </div>
      )}
    </div>
  );
}

function UtilityToolView({ toolId, language, onError, onRateLimit }) {
  const cfg = UTILITY_CONFIG[toolId] || {};
  const [input, setInput] = useState('');
  const [extra, setExtra2] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [frontendState, setFrontendState] = useState({});

  async function run() {
    if (cfg.kind === 'frontend') {
      return runFrontend();
    }
    if (!input.trim()) {
      onError('Please enter a value');
      return;
    }
    setLoading(true);
    setOutput(null);
    onError('');

    try {
      let body = { tool: cfg.tool, input, language };

      if (cfg.kind === 'videoId') {
        body.videoId = extractVideoId(input);
      } else if (cfg.kind === 'channelRef') {
        body.channelRef = extractChannelRef(input);
      }

      if (cfg.kind === 'text-ai') {
        body.tool = 'ai-generate';
        body.systemPrompt = cfg.systemPrompt;
      }

      const res = await fetch('/api/creator-suite/youtube-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'rate_limited') {
          onRateLimit({ allowed: false, retry_after_seconds: data.retry_after_seconds || 0 });
        }
        onError(data.message || 'Operation failed');
        setOutput({ error: data.message || 'Failed' });
      } else {
        setOutput(data);
      }
    } catch (e) {
      onError('Server connection failed');
    } finally {
      setLoading(false);
    }
  }

  function runFrontend() {
    setOutput(null);
    onError('');
    const v = input.trim();
    if (cfg.frontend === 'title-length') {
      if (!v) { onError('Please enter a title'); return; }
      const len = v.length;
      let status = 'green';
      if (len > 70) status = 'red';
      else if (len > 60) status = 'yellow';
      setOutput({ type: 'title-length', length: len, status, recommendation: len > 70 ? 'Title is too long - YouTube truncates after 70 characters' : len > 60 ? 'Acceptable but try to shorten it' : 'Perfect length' });
    } else if (cfg.frontend === 'embed') {
      const vid = extractVideoId(v);
      if (!vid || vid.length !== 11) { onError('Invalid URL'); return; }
      const embed = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${vid}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      setOutput({ type: 'embed', embed, videoId: vid });
    } else if (cfg.frontend === 'channel-id') {
      const ref = extractChannelRef(v);
      const id = ref.type === 'id' ? ref.value : '';
      setOutput({ type: 'channel-id', ref, id });
    } else if (cfg.frontend === 'timestamp') {
      const parts = v.split(/\s+/);
      if (parts.length < 2) { onError('Paste the URL and the time in seconds'); return; }
      const seconds = parseInt(parts[parts.length - 1]);
      const url = parts.slice(0, -1).join(' ');
      const vid = extractVideoId(url);
      if (!vid || vid.length !== 11) { onError('Invalid URL'); return; }
      if (isNaN(seconds) || seconds < 0) { onError('Invalid time'); return; }
      setOutput({ type: 'timestamp', url: `https://youtu.be/${vid}?t=${seconds}`, seconds });
    } else if (cfg.frontend === 'subscribe') {
      const ref = extractChannelRef(v);
      const target = ref.type === 'id' ? `channel/${ref.value}` : ref.value;
      setOutput({ type: 'subscribe', url: `https://www.youtube.com/${target}?sub_confirmation=1` });
    } else if (cfg.frontend === 'title-cap') {
      if (!v) { onError('Please enter a title'); return; }
      const titled = v.toLowerCase().split(/\s+/).map((w, i) => {
        if (i === 0) return w.charAt(0).toUpperCase() + w.slice(1);
        const small = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
        return small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1);
      }).join(' ');
      setOutput({ type: 'title-cap', original: v, titled });
    } else if (cfg.frontend === 'comment-pick') {
      const lines = v.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) { onError('Paste at least one comment'); return; }
      const pick = lines[Math.floor(Math.random() * lines.length)];
      setOutput({ type: 'comment-pick', winner: pick, total: lines.length });
    } else if (cfg.frontend === 'revenue-calc') {
      onError('Use the "Revenue Forecast" tool from the main menu');
    } else if (cfg.frontend === 'views-ratio') {
      onError('Please use the fields below');
    }
  }

  function runViewsRatio() {
    const views = Number(frontendState.views) || 0;
    const likes = Number(frontendState.likes) || 0;
    if (views <= 0) { onError('Please enter the number of views'); return; }
    const ratio = (likes / views) * 100;
    let benchmark = '';
    if (ratio >= 4) benchmark = 'Excellent - above average';
    else if (ratio >= 2.5) benchmark = 'Very good';
    else if (ratio >= 1) benchmark = 'Average';
    else benchmark = 'Low - try to improve your content';
    setOutput({ type: 'views-ratio', ratio, likes, views, benchmark });
  }

  if (cfg.frontend === 'revenue-calc') {
    return (
      <div className={styles.view}>
        <div className={styles.viewHeader}>
          <h2 className={styles.viewTitle}>💵 Revenue Calculator</h2>
          <p className={styles.viewSubtitle}>Go to &quot;Revenue Forecast&quot; in the main menu to use the full calculator</p>
        </div>
        <div className={styles.card}>
          <button type="button" className={styles.btnPrimary} onClick={() => window.scrollTo(0, 0)}>Open Revenue Forecast</button>
        </div>
      </div>
    );
  }

  if (cfg.frontend === 'views-ratio') {
    return (
      <div className={styles.view}>
        <div className={styles.viewHeader}>
          <h2 className={styles.viewTitle}>📐 Views-to-Likes Ratio Calculator</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Number of views</label>
              <input type="number" className={styles.input} value={frontendState.views || ''} onChange={e => setFrontendState({ ...frontendState, views: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Number of likes</label>
              <input type="number" className={styles.input} value={frontendState.likes || ''} onChange={e => setFrontendState({ ...frontendState, likes: e.target.value })} />
            </div>
          </div>
          <button type="button" className={styles.btnPrimary} onClick={runViewsRatio}>Calculate Ratio</button>
        </div>
        {output?.type === 'views-ratio' && (
          <div className={styles.card}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Like ratio</div>
              <div className={styles.statValue}>{output.ratio.toFixed(2)}%</div>
              <div className={styles.statIcon}>✅</div>
            </div>
            <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>{output.benchmark}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.view}>
      <div className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>{cfg.label || 'Tool'}</h2>
        {cfg.placeholder && <p className={styles.viewSubtitle}>Enter the required value then click {cfg.submitLabel}</p>}
      </div>

      {cfg.kind !== 'frontend' || ['title-length', 'embed', 'channel-id', 'timestamp', 'subscribe', 'title-cap', 'comment-pick'].includes(cfg.frontend) ? (
        <div className={styles.card}>
          {cfg.label && (
            <div className={styles.field}>
              <label className={styles.label}>{cfg.label}</label>
              {cfg.kind === 'comment-pick' ? (
                <textarea className={styles.textarea} value={input} onChange={e => setInput(e.target.value)} placeholder={cfg.placeholder} rows={8} />
              ) : (
                <input className={styles.input} value={input} onChange={e => setInput(e.target.value)} placeholder={cfg.placeholder} />
              )}
            </div>
          )}
          <button type="button" className={styles.btnPrimary} onClick={run} disabled={loading}>
            {loading ? '⏳ Processing...' : `✨ ${cfg.submitLabel}`}
          </button>
        </div>
      ) : null}

      {output && <UtilityOutput output={output} frontend={cfg.frontend} />}
    </div>
  );
}

function UtilityOutput({ output, frontend }) {
  if (output.error) {
    return <div className={styles.card}><div className={styles.extractError}>⚠️ {output.error}</div></div>;
  }

  if (frontend === 'title-length' && output.type === 'title-length') {
    const color = output.status === 'green' ? '#10b981' : output.status === 'yellow' ? '#f59e0b' : '#ef4444';
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>Result</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color, margin: '12px 0' }}>{output.length} characters</div>
        <div className={styles.statLabel} style={{ color }}>{output.recommendation}</div>
      </div>
    );
  }

  if (frontend === 'embed' && output.type === 'embed') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>Embed Code</div>
        <pre className={styles.output}>{output.embed}</pre>
        <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.embed)}>📋 Copy</button>
      </div>
    );
  }

  if (frontend === 'timestamp' && output.type === 'timestamp') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>Timestamped Link</div>
        <pre className={styles.output}>{output.url}</pre>
        <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.url)}>📋 Copy</button>
      </div>
    );
  }

  if (frontend === 'subscribe' && output.type === 'subscribe') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>Direct Subscribe Link</div>
        <pre className={styles.output}>{output.url}</pre>
        <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.url)}>📋 Copy</button>
      </div>
    );
  }

  if (frontend === 'title-cap' && output.type === 'title-cap') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>Result</div>
        <pre className={styles.output}>{output.titled}</pre>
        <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.titled)}>📋 Copy</button>
      </div>
    );
  }

  if (frontend === 'comment-pick' && output.type === 'comment-pick') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>🎉 Winner from {output.total} comments</div>
        <pre className={styles.output}>{output.winner}</pre>
        <button type="button" className={styles.btnPrimary} onClick={() => location.reload()}>🎲 Pick Another</button>
      </div>
    );
  }

  if (output.type === 'channel-id') {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>Result</div>
        {output.id ? (
          <>
            <div className={styles.statLabel}>Channel ID</div>
            <pre className={styles.output}>{output.id}</pre>
            <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.id)}>📋 Copy</button>
          </>
        ) : (
          <div className={styles.extractError}>⚠️ For handles (like @name), a YouTube API key is required - add it in admin and come back</div>
        )}
      </div>
    );
  }

  if (output.data) {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>Result</div>
        <pre className={styles.output}>{JSON.stringify(output.data, null, 2)}</pre>
      </div>
    );
  }

  if (output.result && toolIdIsAI(frontend)) {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>Result</div>
        <pre className={styles.output}>{output.result}</pre>
        <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(output.result)}>📋 Copy</button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Result</div>
      <pre className={styles.output}>{JSON.stringify(output, null, 2)}</pre>
    </div>
  );
}

function toolIdIsAI(frontend) {
  return ['ut-hashtag', 'ut-title-gen', 'ut-desc-gen'].includes(frontend);
}

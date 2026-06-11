# Chafiktech Auto-Publisher

Automated daily SEO article publishing for chafiktech.com, powered by OpenRouter AI, Google Trends, and Supabase.

## What it does

Every day at 8 AM (configurable), this system:

1. Fetches top 5 trending topics from Google Trends (US/GB/IN/CA/AU)
2. Writes a 1500-2000 word SEO-optimized English article for each trend (via Claude 3.5 Sonnet)
3. Runs quality checks (word count, SEO score, AI detection, structure)
4. Injects Monetag ads at optimal positions (in-article, banner, interstitial)
5. Saves the article to your `blog_posts` Supabase table
6. The article goes live on chafiktech.com immediately (or as draft, configurable)

## Architecture

```
Vercel Cron (8 AM daily)
    ↓ GET /api/cron/daily-publisher
    ↓
[Auth check: Bearer CRON_SECRET]
    ↓
runDailyPipeline()
    ↓
1. getGoogleTrends() → top 5 trends
2. Filter safe topics (blocklist + dedup)
3. For each trend:
   a. writeArticle() → SEO article
   b. reviewArticle() → quality gate
   c. injectMonetagAds() → add ad slots
   d. createBlogPost() → save to Supabase
    ↓
blog_posts table (Supabase)
    ↓
chafiktech.com/blog/[slug] goes live
```

## Files added

```
lib/auto-publisher/
├── trends.js           # Google Trends RSS fetcher
├── writer.js           # OpenRouter article writer
├── quality.js          # Quality gates (word count, SEO, AI detection)
├── monetag.js          # Smart ad injection
├── pipeline.js         # Main orchestration
├── blog-service.js     # Supabase save layer
└── migrate.sql         # DB schema additions

app/api/cron/daily-publisher/
└── route.js            # Vercel Cron endpoint

app/api/admin/auto-publisher/
└── route.js            # Manual trigger (admin only)

vercel.json             # Cron schedule
.env.auto-publisher.example  # Environment variables
```

## Setup

### 1. Add environment variables in Vercel

Go to **Vercel Dashboard → chafiktech → Settings → Environment Variables** and add:

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxx
CRON_SECRET=<random-32-byte-hex>
AUTO_PUBLISH_ARTICLES_PER_DAY=5
# ... (see .env.auto-publisher.example for full list)
```

Generate `CRON_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Run the database migration

In your **Supabase SQL Editor**, run:

```sql
-- Copy contents of lib/auto-publisher/migrate.sql
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
-- ... (all other ALTER statements)
```

Or just run the whole file. It's idempotent (uses `IF NOT EXISTS`).

### 3. Deploy

```bash
git add .
git commit -m "feat: add daily auto-publisher"
git push origin main
```

Vercel will auto-deploy. The cron job will start running at 8 AM daily.

### 4. Test manually

**Test the cron endpoint:**
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://www.chafiktech.com/api/cron/daily-publisher
```

**Test via admin panel (dry run):**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"articlesPerDay": 2, "dryRun": true}' \
  https://www.chafiktech.com/api/admin/auto-publisher
```

## Configuration

Edit environment variables in Vercel:

| Variable | Default | Description |
|---|---|---|
| `AUTO_PUBLISH_ARTICLES_PER_DAY` | 5 | Articles per run |
| `AUTO_PUBLISH_DRY_RUN` | false | If true, don't save to DB |
| `MIN_WORD_COUNT` | 1500 | Min words per article |
| `MIN_SEO_SCORE` | 70 | Min SEO score (0-100) |
| `MAX_AI_DETECTION` | 0.6 | Max AI phrase score (0-1) |
| `OPENROUTER_MODEL` | claude-3.5-sonnet | AI model |

Edit schedule in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-publisher",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Common schedules:
- `0 8 * * *` — 8 AM daily
- `0 */6 * * *` — every 6 hours
- `0 8,20 * * *` — 8 AM and 8 PM
- `0 8 * * 1,3,5` — 8 AM Mon/Wed/Fri

## Traffic Safety

This system is designed to **not** trigger Google's helpful content penalty:

- ✅ **1500+ words** per article (Google prefers long-form)
- ✅ **Quality gates** reject low-quality or AI-flagged content
- ✅ **Deduplication** prevents republishing similar topics
- ✅ **5/day** is a safe, human-like publishing rate
- ✅ **Multiple regions** for diverse trend sources
- ✅ **Blocklist** filters out unsafe topics (politics, NSFW, etc.)

## Monetag Integration

Ads are injected at 3 research-backed positions:

1. **After 2nd paragraph** (in-article) — highest engagement
2. **Before FAQ section** (banner) — high attention
3. **Mid-content after 3rd H2** (interstitial) — captures scroll depth

All zones are configurable via env vars.

## Cost

- **OpenRouter (Claude 3.5 Sonnet):** ~$0.06 per article
- **5 articles/day:** ~$0.30/day = **$9/month**
- **Vercel Cron:** Free on Hobby plan (1/day), included on Pro
- **Supabase:** Free tier covers it (you already have this)

**Total: ~$9/month**

## Expected Revenue

- 5 articles × 5,000-20,000 views/month = 25,000-100,000 views
- Monetag RPM: $2-5 (English traffic)
- **Revenue: $50-500/month**

**ROI: +450% to +5500%**

## Monitoring

Check the **Vercel Logs** to see:
- When the cron runs
- How many trends were found
- Quality scores
- Publish success/failure

Check **Supabase** to see new blog posts:
```sql
SELECT slug, title, seo_score, word_count, created_at
FROM blog_posts
WHERE source = 'auto-publisher'
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### "Unauthorized" when testing

Make sure you're sending `Authorization: Bearer <CRON_SECRET>` and the secret matches Vercel env var.

### "CRON_SECRET not configured"

Add `CRON_SECRET` to Vercel environment variables.

### Articles not appearing on site

Check Vercel logs for DB errors. Verify `lib/db.js` is using Supabase and has the right connection string.

### Quality score too low

The AI model sometimes returns shorter articles or fewer H2s. Lower the threshold in env vars:
```
MIN_SEO_SCORE=60
MIN_WORD_COUNT=1200
```

### OpenRouter errors

Check you have credits at https://openrouter.ai/credits. The model `anthropic/claude-3.5-sonnet` requires a paid plan or sufficient credits.

## Roadmap

- [ ] Image auto-generation (Stable Diffusion / Unsplash)
- [ ] Twitter/X auto-share
- [ ] A/B testing for titles
- [ ] Email digest of daily published articles
- [ ] Multi-language support

---

**Built with ❤️ for chafiktech.com — by Chafiktech AI**

import { createRequire } from 'module';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const envPath = resolve(__dirname, '..', '.env.local');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith('#') && t.includes('=')) {
      const i = t.indexOf('=');
      if (!process.env[t.substring(0,i).trim()]) process.env[t.substring(0,i).trim()] = t.substring(i+1).trim();
    }
  }
}

(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  console.log('=== Auto-Publisher System Check ===\n');
  console.log('Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗');
  console.log('OpenRouter:', process.env.OPENROUTER_API_KEY ? '✓' : '✗');

  const { error: dbErr } = await sb.from('blog_posts').select('id').limit(1);
  console.log('DB Connect:', dbErr ? `✗ ${dbErr.message}` : '✓');

  const { data: recent } = await sb.from('blog_posts').select('slug,locale,title,word_count,seo_score,status,source').order('created_at', { ascending: false }).limit(10);
  const apArticles = (recent || []).filter(a => a.source === 'auto-publisher');
  console.log(`\nTotal articles: ${(recent || []).length} | Auto-published: ${apArticles.length}`);
  if (apArticles.length) {
    console.log('\nLast 6 auto-published:');
    apArticles.slice(0, 6).forEach(a => console.log(`  [${a.locale||'en'}] ${(a.word_count||'?')}w — ${a.slug.substring(0,50)}`));
  }

  console.log('\n=== Migration Status ===');
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/blog_views?select=id,slug,country&limit=1`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
    });
    const text = await res.text();
    console.log('blog_views.country:', text.includes('42703') ? '✗ MISSING — run migration' : '✓ EXISTS');
  } catch { console.log('blog_views.country: ?'); }

  console.log('\n=== Trigger Instructions ===');
  console.log('1. Run in Supabase SQL Editor:');
  console.log('   ALTER TABLE blog_views ADD COLUMN IF NOT EXISTS country TEXT DEFAULT \'Unknown\';');
  console.log('2. Start dev server:   npm run dev');
  console.log('3. Trigger dry-run:\n   curl -X POST http://localhost:3000/api/admin/auto-publisher -H "Content-Type: application/json" -d \'{"articlesPerDay":2,"dryRun":true,"languages":["en"]}\'');
  console.log('\n4. Or trigger production cron:\n   curl -H "Authorization: Bearer $CRON_SECRET" https://www.chafiktech.com/api/cron/daily-publisher');
})();

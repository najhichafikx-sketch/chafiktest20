// scripts/run-pipeline.mjs
// Daily Auto-Publisher runner for chafiktech
// Usage: node scripts/run-pipeline.mjs [--dry-run]

// Load .env.local BEFORE importing pipeline
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env.local');

if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#') && t.includes('=')) {
      const i = t.indexOf('=');
      const key = t.substring(0, i).trim();
      const val = t.substring(i + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
  console.log('✓ Loaded .env.local');
}

import('../lib/auto-publisher/pipeline.js').then(async (m) => {
  const dryRun = process.argv.includes('--dry-run');

  console.log('========================================');
  console.log('Chafiktech Auto-Publisher Runner');
  console.log('Mode:', dryRun ? 'DRY RUN (no publish)' : 'PUBLISH');
  console.log('Time:', new Date().toISOString());
  console.log('========================================\n');

  try {
    const result = await m.runDailyPipeline({
      dryRun,
      languages: ['en'],
    });

    console.log('\n========================================');
    console.log('Pipeline Result:');
    console.log(JSON.stringify(result.summary, null, 2));
    console.log('========================================');

    if (result.articles && result.articles.length) {
      console.log('\nArticles processed:');
      result.articles.forEach((a, i) => {
        const title = a.trend?.title || 'Unknown';
        const status = a.status || 'unknown';
        const slug = a.slug || a.bundle?.baseSlug || 'N/A';
        console.log(`  ${i + 1}. [${status}] ${title.slice(0, 60)} -> ${slug}`);
      });
    }

    process.exit(result.summary?.failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Pipeline crashed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}).catch((err) => {
  console.error('Failed to load pipeline:', err.message);
  process.exit(1);
});

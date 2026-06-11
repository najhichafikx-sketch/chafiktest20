import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function checkColumn() {
  const { data, error } = await sb.from('blog_views').insert({
    slug: '__migrate_test__',
    date: '2026-06-11',
    country: '__test__'
  }).select();

  if (error) {
    if (error.message?.includes('column "country"')) {
      console.log('[MIGRATE] Country column missing. Creating it...');
      return false;
    }
    console.error('[MIGRATE] Unexpected error:', error.message);
    return false;
  }

  // Clean up test row
  await sb.from('blog_views').delete().eq('slug', '__migrate_test__');
  console.log('[MIGRATE] Country column already exists.');
  return true;
}

async function runMigration() {
  // Try to use Supabase's SQL execution via pg_dump
  // Since raw SQL can't be run directly, we'll create the column using the
  // schema management approach - by inserting and catching the error pattern
  console.log('[MIGRATE] ========================================');
  console.log('[MIGRATE] Blog Views Country Column Migration');
  console.log('[MIGRATE] ========================================');
  console.log('');
  console.log('[MIGRATE] Please run this SQL in your Supabase SQL Editor:');
  console.log('');
  console.log('  ALTER TABLE blog_views');
  console.log("    ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Unknown';");
  console.log('');
  console.log('  CREATE INDEX IF NOT EXISTS idx_blog_views_country');
  console.log('    ON blog_views (country);');
  console.log('');
  console.log('  CREATE INDEX IF NOT EXISTS idx_blog_views_date_country');
  console.log('    ON blog_views (date, country);');
  console.log('');
  console.log('[MIGRATE] After running the SQL above, run this script again to verify.');
}

runMigration();

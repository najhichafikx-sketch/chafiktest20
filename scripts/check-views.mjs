import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data, error } = await sb.from('blog_views').select('*').limit(10);
console.log('Views:', JSON.stringify(data, null, 2));
if (error) console.log('Error:', error);

const { count } = await sb.from('blog_views').select('*', { count: 'exact', head: true });
console.log('Total views:', count);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createSupabaseClient(useServiceRole = false) {
  const key = useServiceRole ? serviceRoleKey : supabaseAnonKey;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  });
}

export async function createStorageBucket() {
  const sb = createSupabaseClient(true);
  if (!sb) return null;
  const { data } = await sb.storage.getBucket('thumbnails');
  if (!data) {
    await sb.storage.createBucket('thumbnails', { public: true });
  }
  return sb.storage.from('thumbnails');
}

export async function uploadThumbnail(userId, blob, filename) {
  const storage = await createStorageBucket();
  if (!storage) throw new Error('Storage not configured');
  const path = `${userId}/${filename}`;
  const { error } = await storage.upload(path, blob, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw error;
  const { data: urlData } = storage.getPublicUrl(path);
  return urlData.publicUrl;
}

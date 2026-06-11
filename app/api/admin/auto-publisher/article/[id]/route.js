import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!SB_URL || !SB_KEY) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
    const { id } = await params;

    const { error } = await sb.from('blog_posts')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unpublish failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

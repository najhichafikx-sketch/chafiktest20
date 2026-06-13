import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = 'force-dynamic';

const CC_MAP = {
  MA:'Morocco', DZ:'Algeria', TN:'Tunisia', LY:'Libya', EG:'Egypt',
  SA:'Saudi Arabia', AE:'UAE', QA:'Qatar', KW:'Kuwait', BH:'Bahrain', OM:'Oman',
  US:'United States', GB:'United Kingdom', FR:'France', ES:'Spain', DE:'Germany',
  IT:'Italy', PT:'Portugal', NL:'Netherlands', BE:'Belgium', CH:'Switzerland',
  CA:'Canada', MX:'Mexico', BR:'Brazil', AR:'Argentina', IN:'India',
  CN:'China', JP:'Japan', KR:'South Korea', AU:'Australia', RU:'Russia',
  TR:'Turkey', SE:'Sweden', NO:'Norway', DK:'Denmark', IE:'Ireland',
  NG:'Nigeria', ZA:'South Africa', SN:'Senegal', GH:'Ghana', CI:'Côte d\'Ivoire',
  IL:'Israel', JO:'Jordan', LB:'Lebanon', PS:'Palestine', IQ:'Iraq', SY:'Syria',
  YE:'Yemen', SD:'Sudan', MR:'Mauritania'
};

export async function POST(request) {
  try {
    const body = await request.json();
    const slug = body.slug || body.path || '/';
    const pagePath = body.path || slug;
    const referrer = body.referrer || '';

    if (!SB_URL || !SB_KEY) {
      console.warn('[track-view] Supabase not configured');
      return NextResponse.json({ error: 'not configured' }, { status: 503 });
    }

    const countryCode = request.headers.get('x-vercel-ip-country') || 'XX';
    const countryName = CC_MAP[countryCode] || countryCode;
    const userAgent = request.headers.get('user-agent') || '';

    const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

    const { error } = await sb.from('blog_views').insert({
      slug,
      path: pagePath,
      date: new Date().toISOString().split('T')[0],
      country: countryName,
      referrer: referrer.slice(0, 500),
      user_agent: userAgent.slice(0, 300)
    });

    if (error) {
      console.error('[track-view] Supabase insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[track-view] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
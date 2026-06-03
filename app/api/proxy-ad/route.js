import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      'http://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js',
      { cache: 'no-store' }
    );
    const text = await res.text();
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new NextResponse('', { status: 200 });
  }
}

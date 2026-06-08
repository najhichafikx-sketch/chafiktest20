import { NextResponse } from 'next/server';

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

export async function POST(request) {
  try {
    if (!REMOVEBG_API_KEY) {
      return NextResponse.json({ success: false, error: 'Remove.bg API key not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    const apiFormData = new FormData();
    apiFormData.append('image_file', image);
    apiFormData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': REMOVEBG_API_KEY },
      body: apiFormData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Remove.bg error: ${err}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({ success: true, imageBase64: base64 });
  } catch (err) {
    console.error('remove-bg error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

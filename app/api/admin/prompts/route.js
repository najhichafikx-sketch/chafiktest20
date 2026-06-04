import { verifyAdmin } from '@/lib/auth';
import { getPrompts, createPrompt } from '@/lib/db';

export async function GET(request) {
  if (!verifyAdmin(request)) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const prompts = await getPrompts('', 'all');
    return Response.json({ success: true, prompts });
  } catch (err) {
    return Response.json({ success: false, prompts: [] }, { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyAdmin(request)) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    if (!body.slug || !body.title) return Response.json({ success: false, message: 'slug and title required' }, { status: 400 });
    const result = await createPrompt(body);
    return Response.json({ success: true, id: result.id, message: 'Prompt created' });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}

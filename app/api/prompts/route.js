import { getPrompts } from '@/lib/db';

export async function GET() {
  try {
    const prompts = await getPrompts();
    const published = prompts.filter(p => p.status === 'published');
    return Response.json({ success: true, prompts: published });
  } catch (err) {
    return Response.json({ success: false, prompts: [] });
  }
}

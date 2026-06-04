import { getPrompts } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tool = searchParams.get('tool');
    let prompts = await getPrompts();
    let published = prompts.filter(p => p.status === 'published');
    if (tool) {
      published = published.filter(p => p.tool === tool);
    }
    return Response.json({ success: true, prompts: published });
  } catch (err) {
    return Response.json({ success: false, prompts: [] });
  }
}

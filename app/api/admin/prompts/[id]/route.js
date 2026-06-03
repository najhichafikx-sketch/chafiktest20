import { verifyAdmin } from '@/lib/auth';
import { getPromptById, updatePrompt, deletePrompt } from '@/lib/db';

export async function GET(request, { params }) {
  if (!verifyAdmin(request)) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const id = (await params).id;
    const prompt = await getPromptById(id);
    if (!prompt) return Response.json({ success: false, message: 'Not found' }, { status: 404 });
    return Response.json({ success: true, prompt });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!verifyAdmin(request)) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const id = (await params).id;
    const data = await request.json();
    await updatePrompt(id, data);
    return Response.json({ success: true, message: 'Updated' });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!verifyAdmin(request)) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const id = (await params).id;
    await deletePrompt(id);
    return Response.json({ success: true, message: 'Deleted' });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}

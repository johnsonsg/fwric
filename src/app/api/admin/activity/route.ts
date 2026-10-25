import { requireAdmin } from '@/lib/admin-auth';
import { connectToDatabase } from '@/lib/db';
import { ContentDocument } from '@/models/SiteContent';

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Sign in to view activity.' }, { status: 401 });
  try {
    await connectToDatabase();
    const record = await ContentDocument.findById('site').select('history');
    return Response.json({ activity: [...(record?.history ?? [])].reverse() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: 'Activity is unavailable while the database is disconnected.' }, { status: 503 }); }
}

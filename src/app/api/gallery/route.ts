import { getContentSnapshot } from '@/lib/content-store';
import { connectToDatabase } from '@/lib/db';
import { mediaPageNumber } from '@/lib/media';
import { MediaAsset } from '@/models/MediaAsset';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') ?? '';
  const page = mediaPageNumber(url.searchParams.get('page'));
  if (!page || !/^[a-z0-9-]{1,80}$/.test(category)) return Response.json({ error: 'Invalid gallery request.' }, { status: 400 });
  const { content } = await getContentSnapshot();
  if (!content.pages.livestock.sections.some(({ id }) => id === category)) return Response.json({ error: 'Gallery not found.' }, { status: 404 });
  try {
    await connectToDatabase();
    const filter = { category };
    const [assets, total] = await Promise.all([
      MediaAsset.find(filter).select('_id url name alt width height').sort({ createdAt: -1, _id: -1 }).skip((page - 1) * 24).limit(24).lean(),
      MediaAsset.countDocuments(filter),
    ]);
    return Response.json({ assets, total, nextPage: page * 24 < total ? page + 1 : null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: 'Photos are temporarily unavailable. Please try again.' }, { status: 503 }); }
}

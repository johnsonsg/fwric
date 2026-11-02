import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { requireAdmin } from '@/lib/admin-auth';
import { mediaConfigured } from '@/lib/content-store';
import { connectToDatabase } from '@/lib/db';
import { MediaAsset } from '@/models/MediaAsset';
import { getContentSnapshot } from '@/lib/content-store';
import { mediaPageNumber } from '@/lib/media';
import { z } from 'zod';
import mongoose from 'mongoose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Sign in to view media.' }, { status: 401 });
  const url = new URL(request.url);
  const page = mediaPageNumber(url.searchParams.get('page'));
  if (!page) return Response.json({ error: 'Invalid page number.' }, { status: 400 });
  const search = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter: Record<string, unknown> = search ? { $or: [{ name: { $regex: escaped, $options: 'i' } }, { alt: { $regex: escaped, $options: 'i' } }] } : {};
  try {
    await connectToDatabase();
    const snapshot = await getContentSnapshot();
    if (url.searchParams.get('gallery') === '1') {
      const category = url.searchParams.get('category') ?? '';
      const categories = snapshot.content.pages.livestock.sections.map(({ id }) => id);
      if (category && !categories.includes(category)) return Response.json({ error: 'Gallery category not found.' }, { status: 404 });
      filter.category = category || { $in: categories };
    }
    const [assets, total] = await Promise.all([
      MediaAsset.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * 36).limit(36).lean(),
      MediaAsset.countDocuments(filter),
    ]);
    return Response.json({ assets, total, nextPage: page * 36 < total ? page + 1 : null, categories: snapshot.content.pages.livestock.sections.map(({ id, title }) => ({ id, title })), configured: mediaConfigured() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: 'The media library needs a working database connection.' }, { status: 503 }); }
}

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return Response.json({ error: 'Sign in as an administrator to upload images.' }, { status: 401 });
  if (!mediaConfigured()) return Response.json({ error: 'Photo uploads need CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET configured on the server.' }, { status: 503 });
  if (Number(request.headers.get('content-length') ?? 0) > 4 * 1024 * 1024 + 65536) return Response.json({ error: 'Choose an image smaller than 4 MB.' }, { status: 413 });
  let uploaded: UploadApiResponse | undefined;
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
  try {
    const data = await request.formData();
    const file = data.get('file');
    const alt = String(data.get('alt') ?? '').trim();
    const category = String(data.get('category') ?? '').trim();
    if (!(file instanceof File) || !file.size || file.size > 4 * 1024 * 1024) return Response.json({ error: 'Choose an image smaller than 4 MB.' }, { status: 422 });
    if (!alt || alt.length > 1000) return Response.json({ error: 'Add a short description of the image before uploading.' }, { status: 422 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const actualType = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'image/png'
      : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'image/jpeg'
      : ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString()) ? 'image/gif'
      : bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP' ? 'image/webp' : '';
    if (!actualType || actualType !== file.type) return Response.json({ error: 'Upload a valid PNG, JPEG, WebP, or GIF image. Existing SVG logos can be selected by their /logo/ path.' }, { status: 422 });
    await connectToDatabase();
    if (category && !(await getContentSnapshot()).content.pages.livestock.sections.some(({ id }) => id === category)) {
      return Response.json({ error: 'Choose an existing livestock gallery category.' }, { status: 422 });
    }
    uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'fwric', resource_type: 'image', allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'gif'], use_filename: false, overwrite: false }, (error, result) => error || !result ? reject(error ?? new Error('Upload failed')) : resolve(result));
      stream.end(bytes);
    });
    const asset = await MediaAsset.create({ publicId: uploaded.public_id, url: uploaded.secure_url, name: file.name.slice(0, 200), alt, category, width: uploaded.width, height: uploaded.height, bytes: uploaded.bytes, uploadedBy: session.user.email });
    return Response.json({ asset }, { status: 201 });
  } catch {
    if (uploaded) await cloudinary.uploader.destroy(uploaded.public_id).catch(() => {});
    return Response.json({ error: 'The image could not be uploaded. Check the media and database connections, then try again.' }, { status: 503 });
  }
}

const editSchema = z.object({
  id: z.string().refine((value) => mongoose.isValidObjectId(value)),
  category: z.string().max(80),
  alt: z.string().trim().min(1).max(1000),
}).strict();

export async function PATCH(request: Request) {
  if (!await requireAdmin(request)) return Response.json({ error: 'Sign in to edit photos.' }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON.' }, { status: 400 }); }
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Choose a valid photo, category, and description.' }, { status: 422 });
  try {
    await connectToDatabase();
    const { id, category, alt } = parsed.data;
    if (category && !(await getContentSnapshot()).content.pages.livestock.sections.some((section) => section.id === category)) {
      return Response.json({ error: 'That livestock category no longer exists.' }, { status: 422 });
    }
    const asset = await MediaAsset.findByIdAndUpdate(id, { $set: { category, alt } }, { returnDocument: 'after', runValidators: true });
    if (!asset) return Response.json({ error: 'Photo not found.' }, { status: 404 });
    return Response.json({ asset }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: 'Unable to update this photo. Try again.' }, { status: 503 }); }
}

import 'server-only';
import { cache } from 'react';
import { connectToDatabase } from '@/lib/db';
import { ContentDocument } from '@/models/SiteContent';
import { contentSchema, DEFAULT_CONTENT, type ContentSnapshot } from '@/lib/content';

export const mediaConfigured = () => Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

export const getContentSnapshot = cache(async (): Promise<ContentSnapshot> => {
  try {
    await connectToDatabase();
    const record = await ContentDocument.findById('site').lean();
    const stored = record && 'content' in record ? record : null;
    return {
      content: stored ? contentSchema.parse(stored.content) : DEFAULT_CONTENT,
      revision: Number(stored?.revision ?? 0),
      updatedAt: stored?.updatedAt instanceof Date ? stored.updatedAt.toISOString() : null,
      storageAvailable: true, mediaAvailable: mediaConfigured(),
    };
  } catch {
    return { content: DEFAULT_CONTENT, revision: 0, updatedAt: null, storageAvailable: false, mediaAvailable: mediaConfigured() };
  }
});

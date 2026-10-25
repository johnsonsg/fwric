import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { brandingSchema, businessSchema, contentSchema, DEFAULT_CONTENT, pageSchema, PAGE_SLUGS, phoneHref } from '@/lib/content';
import { getContentSnapshot, mediaConfigured } from '@/lib/content-store';
import { connectToDatabase } from '@/lib/db';
import { ContentDocument } from '@/models/SiteContent';

export const dynamic = 'force-dynamic';
const updateSchema = z.discriminatedUnion('section', [
  z.object({ section: z.literal('branding'), revision: z.number().int().nonnegative(), data: brandingSchema }).strict(),
  z.object({ section: z.literal('business'), revision: z.number().int().nonnegative(), data: businessSchema }).strict(),
  z.object({ section: z.literal('page'), slug: z.enum(PAGE_SLUGS), revision: z.number().int().nonnegative(), data: pageSchema }).strict(),
]);

export async function GET() {
  return Response.json(await getContentSnapshot(), { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return Response.json({ error: 'Sign in as an administrator to save changes.' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON request.' }, { status: 400 }); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n') }, { status: 422 });
  try {
    await connectToDatabase();
    const stored = await ContentDocument.findById('site');
    const update = parsed.data;
    if (Number(stored?.revision ?? 0) !== update.revision) return Response.json({ error: 'Someone saved a newer version. Reload this editor before saving your changes.' }, { status: 409 });
    const content = contentSchema.parse(stored?.content ?? DEFAULT_CONTENT);
    let before: Record<string, unknown>;
    let label: string;
    if (update.section === 'page') {
      before = content.pages[update.slug];
      content.pages[update.slug] = update.data;
      label = `${update.slug} page`;
    } else {
      before = content[update.section];
      if (update.section === 'branding') content.branding = update.data;
      else {
        const previous = content.business;
        const destinations = new Map([
          [phoneHref(previous.phone), phoneHref(update.data.phone)],
          [previous.mapsUrl, update.data.mapsUrl],
          [`mailto:${previous.email}`, `mailto:${update.data.email}`],
        ]);
        for (const page of Object.values(content.pages)) {
          page.primaryHref = destinations.get(page.primaryHref) ?? page.primaryHref;
          page.secondaryHref = destinations.get(page.secondaryHref) ?? page.secondaryHref;
          page.sections.forEach((section) => { section.linkHref = destinations.get(section.linkHref) ?? section.linkHref; });
        }
        content.business = update.data;
      }
      label = update.section === 'branding' ? 'Branding & logos' : 'Business details';
    }
    const changed = Object.keys(update.data).filter((key) => JSON.stringify(before[key]) !== JSON.stringify((update.data as Record<string, unknown>)[key]));
    if (!changed.length) return Response.json(await getContentSnapshot());
    const updated = await ContentDocument.findOneAndUpdate(
      { _id: 'site', revision: update.revision },
      { $set: { content }, $inc: { revision: 1 }, $push: { history: { $each: [{ section: label, summary: changed.join(', '), by: session.user.email, at: new Date(), revision: update.revision + 1 }], $slice: -100 } } },
      { returnDocument: 'after', upsert: update.revision === 0, runValidators: true },
    );
    if (!updated) return Response.json({ error: 'A newer version was saved. Reload the editor and try again.' }, { status: 409 });
    return Response.json({ content: contentSchema.parse(updated.content), revision: updated.revision, updatedAt: updated.updatedAt.toISOString(), storageAvailable: true, mediaAvailable: mediaConfigured() });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) return Response.json({ error: 'A newer version was saved. Reload the editor and try again.' }, { status: 409 });
    return Response.json({ error: 'Content could not be saved. Check the database connection and try again. Your changes are still in the editor.' }, { status: 503 });
  }
}

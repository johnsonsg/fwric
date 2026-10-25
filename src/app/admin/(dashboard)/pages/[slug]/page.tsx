import { notFound } from 'next/navigation';
import { isPageSlug } from '@/lib/content';
import { ContentEditor } from '@/components/admin/content-editor';
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isPageSlug(slug)) notFound();
  return <ContentEditor target={slug} />;
}

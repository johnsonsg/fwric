import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";
import { PAGE_SLUGS, pagePath } from '@/lib/content';
import { getContentSnapshot } from '@/lib/content-store';
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const { updatedAt } = await getContentSnapshot();
  return PAGE_SLUGS.map((slug) => ({ url: `${baseUrl}${pagePath(slug)}`, ...(updatedAt ? { lastModified: updatedAt } : {}), changeFrequency: 'weekly', priority: slug === 'home' ? 1 : 0.8 }));
}

'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_CONTENT, type SiteContent } from '@/lib/content';

const ContentContext = createContext<SiteContent>(DEFAULT_CONTENT);
export function SiteContentProvider({ content, children }: { content: SiteContent; children: ReactNode }) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
export const useSiteContent = () => useContext(ContentContext);

import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { VisitSection } from '@/components/home/visit-section';
import { getContentSnapshot } from '@/lib/content-store';
import { isPageSlug, pagePath } from '@/lib/content';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ category?: string | string[] }> };
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isPageSlug(slug) || slug === 'home') return {};
  const { content } = await getContentSnapshot();
  const page = content.pages[slug];
  return { title: page.seoTitle || page.title, description: page.seoDescription || page.description, alternates: { canonical: pagePath(slug) } };
}

export default async function ContentPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!isPageSlug(slug) || slug === 'home') notFound();
  const { content: { pages } } = await getContentSnapshot();
  const page = pages[slug];
  const query = await searchParams;
  const selectedCategory = typeof query.category === 'string' && page.sections.some((section) => section.id === query.category) ? query.category : '';
  const sections = slug === 'livestock' && selectedCategory ? page.sections.filter((section) => section.id === selectedCategory) : page.sections;

  return <>
    <SiteHeader />
    <main>
      <Box component="section" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: { xs: 6, md: 10 } }}>
        <Container sx={{ display: 'grid', gridTemplateColumns: page.image ? { xs: '1fr', md: '1.1fr 1fr' } : '1fr', gap: 5, alignItems: 'center' }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'secondary.main' }}>{page.eyebrow}</Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: 40, md: 60 }, mt: 1, textWrap: 'balance' }}>{page.title}</Typography>
            <Typography sx={{ fontSize: 18, mt: 3, opacity: 0.9, maxWidth: 680, whiteSpace: 'pre-line' }}>{page.description}</Typography>
            <Stack direction="row"   sx={{mt: 4, flexWrap: "wrap", gap: 1.5}}>
              {page.primaryLabel && <Button href={page.primaryHref} variant="contained" color="secondary" size="large">{page.primaryLabel}</Button>}
              {page.secondaryLabel && <Button href={page.secondaryHref} variant="outlined" color="inherit" size="large">{page.secondaryLabel}</Button>}
            </Stack>
          </Box>
          {page.image && <Box sx={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 4, overflow: 'hidden' }}>
            <Image src={page.image} alt={page.imageAlt} fill unoptimized loading="eager" style={{ objectFit: 'cover' }} />
          </Box>}
        </Container>
      </Box>
      {slug !== 'contact' && <Container sx={{ py: { xs: 6, md: 10 } }}>
        {page.sectionTitle && <Typography variant="h2" sx={{ fontSize: { xs: 30, md: 42 }, mb: 2 }}>{page.sectionTitle}</Typography>}
        {page.sectionIntro && <Typography sx={{ maxWidth: 800, whiteSpace: 'pre-line', mb: 4 }}>{page.sectionIntro}</Typography>}
        {page.sectionImage && <Box sx={{ mb: 4 }}>
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 900, aspectRatio: '16 / 7', borderRadius: 3, overflow: 'hidden' }}><Image src={page.sectionImage} alt={page.sectionImageAlt} fill unoptimized style={{ objectFit: 'cover' }} /></Box>
          {page.sectionCaption && <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>{page.sectionCaption}</Typography>}
        </Box>}
        {slug === 'livestock' && <Stack component="nav" aria-label="Livestock categories" direction="row"   sx={{my: 4, flexWrap: "wrap", gap: 1}}>
          <Button href="/livestock" variant={!selectedCategory ? 'contained' : 'outlined'} aria-current={!selectedCategory ? 'page' : undefined}>All categories</Button>
          {page.sections.map((section) => <Button key={section.id} href={`/livestock?category=${section.id}`} variant={selectedCategory === section.id ? 'contained' : 'outlined'} aria-current={selectedCategory === section.id ? 'page' : undefined}>{section.title}</Button>)}
        </Stack>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {sections.map((section) => <Box component="article" key={section.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper' }}>
            {section.image && <Box sx={{ position: 'relative', aspectRatio: '4 / 3' }}><Image src={section.image} alt={section.imageAlt} fill unoptimized style={{ objectFit: 'cover' }} /></Box>}
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" component="h3">{section.title}</Typography>
              <Typography sx={{ mt: 2, color: 'text.secondary', whiteSpace: 'pre-line' }}>{section.body}</Typography>
              {section.linkLabel && <Button href={section.linkHref} sx={{ mt: 2 }}>{section.linkLabel}</Button>}
            </Box>
          </Box>)}
        </Box>
      </Container>}
      <VisitSection showEmail={slug === 'contact'} />
    </main>
    <SiteFooter />
  </>;
}

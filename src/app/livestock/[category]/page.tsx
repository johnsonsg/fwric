import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Box, Button, Container, Typography } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { LivestockGallery } from '@/components/site/livestock-gallery';
import { getContentSnapshot } from '@/lib/content-store';
import { galleryPath } from '@/lib/media';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const { content } = await getContentSnapshot();
  const section = content.pages.livestock.sections.find(({ id }) => id === category);
  if (!section) return {};
  return { title: `${section.title} gallery`, description: section.body, alternates: { canonical: galleryPath(category) } };
}

export default async function GalleryPage({ params }: Props) {
  const { category } = await params;
  const { content } = await getContentSnapshot();
  const section = content.pages.livestock.sections.find(({ id }) => id === category);
  if (!section) notFound();
  return <>
    <SiteHeader />
    <main>
      <Box className="ocean-reef-background" sx={{ py: { xs: 5, md: 8 }, color: 'primary.contrastText' }}>
        <Container>
          <Button href="/livestock" color="inherit" startIcon={<ArrowBack />} sx={{ mb: 3 }}>All livestock</Button>
          <Typography variant="overline" sx={{ display: 'block', color: '#A2EDE5' }}>Fish World / Photo gallery</Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: 36, md: 56 }, mt: 1 }}>{section.title}</Typography>
          <Typography sx={{ mt: 2, maxWidth: 760, opacity: 0.9 }}>{section.body}</Typography>
        </Container>
      </Box>
      <Container sx={{ py: { xs: 5, md: 8 } }}>
        <LivestockGallery category={category} title={section.title} />
      </Container>
    </main>
    <SiteFooter />
  </>;
}

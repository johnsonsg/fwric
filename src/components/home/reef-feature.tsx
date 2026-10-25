import Image from 'next/image';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { getContentSnapshot } from '@/lib/content-store';

export async function ReefFeature() {
  const { content: { pages: { home: page } } } = await getContentSnapshot();
  return (
    <Box component="section" aria-labelledby="reef-title" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: { xs: 8, md: 12 } }}>
      <Container sx={{ display: 'grid', gap: { xs: 5, md: 8 }, gridTemplateColumns: page.sectionImage ? { xs: '1fr', md: '1fr 1fr' } : '1fr', alignItems: 'center' }}>
        {page.sectionImage && <Box sx={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 4, overflow: 'hidden' }}>
          {page.sectionImage && <Image src={page.sectionImage} alt={page.sectionImageAlt} unoptimized fill sizes="(min-width: 900px) 50vw, 100vw" style={{ objectFit: 'cover' }} />}
          {page.sectionCaption && <Box sx={{ position: 'absolute', left: 16, bottom: 16, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 3, px: 2.5, py: 2 }}>
            <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, lineHeight: 1, color: 'primary.main' }}>
              {page.sectionCaption}
            </Typography>
          </Box>}
        </Box>}

        <Box>
          <Typography variant="overline" sx={{ color: 'secondary.main' }}>
            {page.sectionIntro}
          </Typography>
          <Typography id="reef-title" variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, mt: 1, textWrap: 'balance' }}>
            {page.sectionTitle}
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 5, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {page.sections.map((point) => (
              <Box component="li" key={point.id} sx={{ pl: 3, borderLeft: '2px solid', borderColor: 'secondary.main' }}>
                {point.image && <Box sx={{ position: 'relative', aspectRatio: '16 / 9', mb: 2, borderRadius: 2, overflow: 'hidden' }}><Image src={point.image} alt={point.imageAlt} fill unoptimized style={{ objectFit: 'cover' }} /></Box>}
                <Typography variant="h6" component="h3">
                  {point.title}
                </Typography>
                <Typography sx={{ mt: 0.5, opacity: 0.8, whiteSpace: 'pre-line' }}>{point.body}</Typography>
                {point.linkLabel && <Button href={point.linkHref} color="secondary" sx={{ mt: 1 }}>{point.linkLabel}</Button>}
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

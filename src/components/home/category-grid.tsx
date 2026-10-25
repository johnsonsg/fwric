'use client';

import NextLink from 'next/link';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useSiteContent } from '@/components/site/content-provider';
import { SectionHeading } from './section-heading';

export function CategoryGrid() {
  const { pages } = useSiteContent();
  const featured = pages.livestock.sections.filter((section) => section.id !== 'invertebrates').slice(0, 5);
  return (
    <Box component="section" aria-labelledby="categories-title" sx={{ py: { xs: 8, md: 12 } }}>
      <Container>
        <SectionHeading
          id="categories-title"
          eyebrow="Shop the store"
          title={pages.home.collectionTitle}
        />
        <Box
          sx={{
            mt: 5,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(6, 1fr)' },
            gridAutoRows: { xs: 180, md: 220 },
          }}
        >
          {featured.map((section, i) => (
            <Box
              key={section.id}
              component={NextLink}
              href={`/livestock?category=${section.id}`}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                color: 'ink.contrastText',
                textDecoration: 'none',
                gridColumn: { xs: i === 0 ? 'span 2' : 'span 1', md: i < 2 ? 'span 3' : 'span 2' },
                '& img': { transition: 'transform 600ms ease' },
                '&:hover img, &:focus-visible img': { transform: 'scale(1.05)' },
                '&:focus-visible': { outline: '3px solid', outlineColor: 'secondary.main', outlineOffset: 3 },
              }}
            >
              {section.image && <Image src={section.image} alt={section.imageAlt} unoptimized fill sizes="(min-width: 900px) 50vw, 100vw" style={{ objectFit: 'cover' }} />}
              <Box aria-hidden sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(11,28,36,0.85) 0%, rgba(11,28,36,0) 60%)' }} />
              <Box sx={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
                <Typography variant="h5" component="h3" sx={{ fontSize: { xs: 20, md: 24 } }}>
                  {section.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {section.body}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

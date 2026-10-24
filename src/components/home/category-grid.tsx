'use client';

import NextLink from 'next/link';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { CATEGORIES, type CategorySlug } from '@/lib/site';
import { SectionHeading } from './section-heading';

const FEATURED: { slug: CategorySlug; blurb: string }[] = [
  { slug: 'corals', blurb: 'SPS, LPS & softies' },
  { slug: 'fish', blurb: 'Reef-safe & FOWLR' },
  { slug: 'live-rock', blurb: 'Cured & aquascape-ready' },
  { slug: 'equipment', blurb: 'Lighting, flow, filtration' },
  { slug: 'food-health', blurb: 'Frozen, dry & treatments' },
];

export function CategoryGrid() {
  return (
    <Box component="section" aria-labelledby="categories-title" sx={{ py: { xs: 8, md: 12 } }}>
      <Container>
        <SectionHeading
          id="categories-title"
          eyebrow="Shop the store"
          title="Everything your reef needs, under one roof."
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
          {FEATURED.map(({ slug, blurb }, i) => (
            <Box
              key={slug}
              component={NextLink}
              href={`/livestock?category=${slug}`}
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
              <Image src={CATEGORIES[slug].image} alt="" fill sizes="(min-width: 900px) 50vw, 100vw" style={{ objectFit: 'cover' }} />
              <Box aria-hidden sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(11,28,36,0.85) 0%, rgba(11,28,36,0) 60%)' }} />
              <Box sx={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
                <Typography variant="h5" component="h3" sx={{ fontSize: { xs: 20, md: 24 } }}>
                  {CATEGORIES[slug].label}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {blurb}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

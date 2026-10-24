'use client';

import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Box
      component={NextLink}
      href="/"
      aria-label="Fish World home"
      sx={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: inverted ? 'primary.contrastText' : 'text.primary' }}
    >
      <Typography
        component="span"
        sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.04em', lineHeight: 1 }}
      >
        Fish World
        <Box component="span" sx={{ color: 'secondary.main' }}>
          .
        </Box>
      </Typography>
      <Typography
        component="span"
        sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7, mt: 0.5 }}
      >
        Richmond Saltwater
      </Typography>
    </Box>
  );
}

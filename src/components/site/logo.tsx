'use client';

import NextLink from 'next/link';
import Image from 'next/image';
import Box from '@mui/material/Box';

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Box
      component={NextLink}
      href="/"
      aria-label="Fish World home"
      sx={{
        display: 'inline-flex',
        flexShrink: 0,
        width: inverted ? 220 : { xs: 144, md: 164 },
        maxWidth: '100%',
        textDecoration: 'none',
      }}
    >
      <Image
        src={inverted ? '/logo/logo-dark.svg' : '/logo/logo-light.svg'}
        alt="Fish World - Saltwater Aquariums"
        width={696}
        height={296}
        loading={inverted ? 'lazy' : 'eager'}
        unoptimized
        style={{ display: 'block', width: '100%', height: 'auto' }}
      />
    </Box>
  );
}

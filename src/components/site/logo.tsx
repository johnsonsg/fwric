'use client';

import NextLink from 'next/link';
import Image from 'next/image';
import Box from '@mui/material/Box';
import { useSiteContent } from './content-provider';

export function Logo({ inverted = false, dark = inverted, darkOpacity }: { inverted?: boolean; dark?: boolean; darkOpacity?: number }) {
  const { branding } = useSiteContent();
  const opacity = darkOpacity ?? (dark ? 1 : 0);
  return (
    <Box
      component={NextLink}
      href="/"
      aria-label={`${branding.siteName} home`}
      sx={{
        display: 'inline-flex',
        flexShrink: 0,
        width: inverted ? 220 : { xs: 144, md: 164 },
        maxWidth: '100%',
        textDecoration: 'none',
        position: 'relative',
        '& img': { transition: darkOpacity === undefined ? 'opacity 450ms ease-in-out' : 'none' },
        '@media (prefers-reduced-motion: reduce)': {
          '& img': { transition: 'none' },
        },
      }}
    >
      <Image
        src={branding.logoLight}
        alt={branding.logoAlt}
        width={696}
        height={296}
        loading={inverted ? 'lazy' : 'eager'}
        unoptimized
        style={{ display: 'block', width: '100%', height: 'auto', opacity: 1 - opacity }}
      />
      <Image
        src={branding.logoDark}
        alt=""
        aria-hidden
        width={696}
        height={296}
        loading={inverted ? 'lazy' : 'eager'}
        unoptimized
        style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: 'auto', opacity }}
      />
    </Box>
  );
}

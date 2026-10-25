'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import CloseIcon from '@mui/icons-material/Close';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { NAV_LINKS, SITE } from '@/lib/site';
import { Logo } from './logo';

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let previousTime = 0;
    let current = 0;
    let target = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const animate = (time: number) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
      previousTime = time;
      current += (target - current) * (1 - Math.exp(-elapsed / 140));
      if (Math.abs(target - current) < 0.001) current = target;
      setScrollProgress(current);
      if (current !== target) {
        frame = window.requestAnimationFrame(animate);
      } else {
        frame = 0;
        previousTime = 0;
      }
    };

    const updateHeader = () => {
      target = Math.min(1, Math.max(0, (window.scrollY - 16) / 128));
      if (reducedMotion.matches) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
        current = target;
        setScrollProgress(current);
      } else if (!frame && current !== target) {
        frame = window.requestAnimationFrame(animate);
      }
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    reducedMotion.addEventListener('change', updateHeader);
    return () => {
      window.removeEventListener('scroll', updateHeader);
      reducedMotion.removeEventListener('change', updateHeader);
      window.cancelAnimationFrame(frame);
    };
  }, []);
  const isHome = pathname === '/';
  const headerProgress = isHome ? scrollProgress : 1;
  const headerHeight = { xs: 64, md: 76 };

  return (
    <>
      <Box sx={{ bgcolor: 'ink.main', color: 'ink.contrastText', fontSize: 14 }}>
        <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Link href={SITE.phoneHref} color="inherit" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
              <PhoneOutlinedIcon sx={{ fontSize: 16 }} aria-hidden />
              {SITE.phone}
            </Link>
            <Link href={`mailto:${SITE.email}`} color="inherit" underline="hover" sx={{ display: { xs: 'none', sm: 'inline-flex' }, alignItems: 'center', gap: 0.75 }}>
              <MailOutlineIcon sx={{ fontSize: 16 }} aria-hidden />
              {SITE.email}
            </Link>
          </Box>
          <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, opacity: 0.8 }}>
            {`${SITE.address.street}, ${SITE.address.city}, ${SITE.address.state}`}
          </Box>
        </Container>
      </Box>

      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        style={{ '--header-progress': headerProgress } as CSSProperties}
        sx={{
          backgroundImage: 'none',
          bgcolor: 'rgb(255 255 255 / var(--header-progress))',
          color: 'color-mix(in srgb, #F3F7F8 calc((1 - var(--header-progress)) * 100%), #0B1C24)',
          mb: isHome ? { xs: `-${headerHeight.xs}px`, md: `-${headerHeight.md}px` } : 0,
          overflowAnchor: 'none',
        }}
      >
        <Container>
          <Toolbar
            disableGutters
            variant="dense"
            sx={{
              minHeight: 0,
              height: headerHeight,
              gap: 2,
            }}
          >
            <Logo darkOpacity={1 - headerProgress} />
            <Box sx={{ flexGrow: 1 }} />
            <Box component="nav" aria-label="Main" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Button
                    key={link.href}
                    component={NextLink}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      color: active ? 'color-mix(in srgb, #FF7A59 calc((1 - var(--header-progress)) * 100%), #0E4A5C)' : 'inherit',
                      bgcolor: active ? 'rgba(14, 74, 92, 0.08)' : 'transparent',
                      px: 2,
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Box>
            <Button component="a" href={SITE.phoneHref} variant="contained" color="primary" sx={{ display: { xs: 'none', md: 'inline-flex' }, ml: 1 }}>
              Call the store
            </Button>
            <IconButton aria-label="Open menu" color="inherit" onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Logo />
            <IconButton aria-label="Close menu" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List component="nav" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <ListItemButton
                key={link.href}
                component={NextLink}
                href={link.href}
                selected={isActive(pathname, link.href)}
                onClick={() => setOpen(false)}
                sx={{ borderRadius: 2 }}
              >
                <ListItemText primary={link.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
              </ListItemButton>
            ))}
          </List>
          <Box sx={{ mt: 'auto' }}>
            <Button component="a" href={SITE.phoneHref} variant="contained" fullWidth size="large">
              {`Call ${SITE.phone}`}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

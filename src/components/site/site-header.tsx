'use client';

import { useState } from 'react';
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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { PAGE_SLUGS, pagePath, phoneHref } from '@/lib/content';
import { useSiteContent } from './content-provider';
import { Logo } from './logo';
import { FACEBOOK_URL } from './facebook-link';

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { business, pages } = useSiteContent();
  const links = PAGE_SLUGS.map((slug) => ({ href: pagePath(slug), label: pages[slug].navLabel }));
  const [open, setOpen] = useState(false);
  const headerHeight = { xs: 64, md: 76 };

  return (
    <>
      <Box component="header" sx={{
        position: 'sticky',
        top: 0,
        zIndex: 'appBar',
        overflowAnchor: 'none',
      }}>
      <Box sx={{ bgcolor: 'ink.main', color: 'ink.contrastText', fontSize: 14 }}>
        <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Link href={phoneHref(business.phone)} color="inherit" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
              <PhoneOutlinedIcon sx={{ fontSize: 16 }} aria-hidden />
              {business.phone}
            </Link>
            <Link href={`mailto:${business.email}`} color="inherit" underline="hover" sx={{ display: { xs: 'none', sm: 'inline-flex' }, alignItems: 'center', gap: 0.75 }}>
              <MailOutlineIcon sx={{ fontSize: 16 }} aria-hidden />
              {business.email}
            </Link>
          </Box>
          <Link component="a" href={business.mapsUrl} target="_blank" rel="noopener noreferrer" color="inherit" underline="hover" aria-label="Get directions to Fish World in Google Maps (opens in a new tab)" sx={{ display: { xs: 'none', md: 'block' }, opacity: 0.8 }}>
            {`${business.street}, ${business.city}, ${business.state} ${business.zip}`}
          </Link>
        </Container>
      </Box>

      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          backgroundImage: 'none',
          bgcolor: 'ink.main',
          color: 'ink.contrastText',
        }}
      >
        <Container>
          <Toolbar
            disableGutters
            variant="dense"
            sx={{
              minHeight: 0,
              height: headerHeight,
              gap: { xs: 1, md: 2 },
            }}
          >
            <Logo dark />
            <Box sx={{ flexGrow: 1 }} />
            <Box component="nav" aria-label="Main" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
              {links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Button
                    key={link.href}
                    component={NextLink}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      color: active ? 'secondary.light' : 'inherit',
                      bgcolor: active ? 'rgba(63, 182, 217, 0.12)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(63, 182, 217, 0.18)' },
                      px: 2,
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
              <Button
                component="a"
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook (opens in a new tab)"
                endIcon={<OpenInNewIcon sx={{ fontSize: '16px !important' }} />}
                sx={{ color: 'inherit', px: 2, '&:hover': { bgcolor: 'rgba(63, 182, 217, 0.18)' } }}
              >
                Facebook
              </Button>
            </Box>
            <Button component="a" href={phoneHref(business.phone)} variant="contained" color="primary" sx={{ display: { xs: 'none', md: 'inline-flex' }, ml: 1 }}>
              Call the store
            </Button>
            <IconButton aria-label="Open menu" color="inherit" onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      </Box>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%', p: 2, bgcolor: 'ink.main', color: 'ink.contrastText' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Logo dark />
            <IconButton color="inherit" aria-label="Close menu" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List component="nav" aria-label="Mobile">
            {links.map((link) => (
              <ListItemButton
                key={link.href}
                component={NextLink}
                href={link.href}
                selected={isActive(pathname, link.href)}
                onClick={() => setOpen(false)}
                sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: 'rgba(63, 182, 217, 0.12)', color: 'secondary.light' }, '&:hover, &.Mui-selected:hover': { bgcolor: 'rgba(63, 182, 217, 0.18)' } }}
              >
                <ListItemText primary={link.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
              </ListItemButton>
            ))}
            <ListItemButton
              component="a"
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook (opens in a new tab)"
              onClick={() => setOpen(false)}
              sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(63, 182, 217, 0.18)' } }}
            >
              <ListItemText primary="Facebook" slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
              <OpenInNewIcon sx={{ fontSize: 16 }} />
            </ListItemButton>
          </List>
          <Box sx={{ mt: 'auto' }}>
            <Button component="a" href={phoneHref(business.phone)} variant="contained" fullWidth size="large">
              {`Call ${business.phone}`}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

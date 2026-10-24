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

      <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Container>
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 }, gap: 2 }}>
            <Logo />
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
                      color: active ? 'primary.main' : 'text.primary',
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
            <IconButton aria-label="Open menu" onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
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

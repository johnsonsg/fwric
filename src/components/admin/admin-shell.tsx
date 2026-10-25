'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AppBar, Avatar, Box, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import PaletteOutlined from '@mui/icons-material/PaletteOutlined';
import PhotoLibraryOutlined from '@mui/icons-material/PhotoLibraryOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import OpenInNew from '@mui/icons-material/OpenInNew';

const ChangesContext = createContext<{ dirty: boolean; setDirty: (value: boolean) => void }>({ dirty: false, setDirty: () => {} });
export const useAdminChanges = () => useContext(ChangesContext);
const navigation = [
  { href: '/admin', label: 'Overview', Icon: DashboardOutlined },
  { href: '/admin/pages', label: 'Pages', Icon: ArticleOutlined },
  { href: '/admin/branding', label: 'Branding & logos', Icon: PaletteOutlined },
  { href: '/admin/media', label: 'Media library', Icon: PhotoLibraryOutlined },
  { href: '/admin/business', label: 'Business details', Icon: StorefrontOutlined },
  { href: '/admin/activity', label: 'Recent changes', Icon: HistoryOutlined },
];

export function AdminShell({ children, email }: { children: ReactNode; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const active = navigation.find((entry) => entry.href === '/admin' ? pathname === entry.href : pathname.startsWith(entry.href));
  const confirmLeave = () => !dirty || window.confirm('You have unsaved changes. Discard them and leave this editor?');
  const sidebar = <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0B2631', color: '#F3F7F8', p: 2 }}>
    <Box sx={{ px: 1.5, pt: 2, pb: 3 }}>
      <Typography variant="overline" sx={{ color: '#64C4D5', letterSpacing: '0.2em' }}>Fish World</Typography>
      <Typography variant="h5" sx={{ mt: 0.5 }}>Site studio</Typography>
      <Typography variant="body2" sx={{ opacity: 0.6, mt: 1 }}>Your content, in one place.</Typography>
    </Box>
    <Divider sx={{ borderColor: 'rgba(255,255,255,.12)', mb: 2 }} />
    <List sx={{ display: 'grid', gap: 0.75 }}>
      {navigation.map(({ href, label, Icon }) => <ListItemButton key={href} component={NextLink} href={href} selected={active?.href === href} onClick={(event) => {
        if (pathname !== href && !confirmLeave()) { event.preventDefault(); return; }
        if (pathname !== href) setDirty(false);
        setOpen(false);
      }} sx={{ borderRadius: 2, color: 'inherit', '&.Mui-selected': { bgcolor: '#194A59', color: '#fff' }, '&.Mui-selected:hover': { bgcolor: '#205A69' } }}>
        <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}><Icon fontSize="small" /></ListItemIcon><ListItemText primary={label} slotProps={{ primary: { sx: { fontSize: 14, fontWeight: active?.href === href ? 700 : 500 } } }} />
      </ListItemButton>)}
    </List>
    <Box sx={{ mt: 'auto', px: 1.5, pt: 4, pb: 1 }}>
      <Button href="/" target="_blank" endIcon={<OpenInNew fontSize="small" />} sx={{ color: '#91D4DF', px: 0 }}>View website</Button>
      <Divider sx={{ borderColor: 'rgba(255,255,255,.12)', my: 2 }} />
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}><Avatar sx={{ width: 32, height: 32, bgcolor: '#245261', fontSize: 14 }}>{email[0]?.toUpperCase()}</Avatar><Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>{email}</Typography></Box>
      <Button size="small" sx={{ color: '#B4C8CE', mt: 1, px: 0 }} onClick={() => { if (confirmLeave()) void signOut({ callbackUrl: '/admin/login' }); }}>Sign out</Button>
    </Box>
  </Box>;
  return <ChangesContext.Provider value={{ dirty, setDirty }}>
    <Box sx={{ minHeight: '100vh', bgcolor: '#F3F7F8', color: 'text.primary' }}>
      <Box component="aside" aria-label="Admin navigation" sx={{ display: { xs: 'none', md: 'block' }, position: 'fixed', inset: '0 auto 0 0', width: 248 }}>{sidebar}</Box>
      <Drawer open={open} onClose={() => setOpen(false)} sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: 280 } }}>{sidebar}</Drawer>
      <Box sx={{ ml: { md: '248px' } }}>
        <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'rgba(255,255,255,.96)', borderBottom: 1, borderColor: 'divider', zIndex: 1000 }}>
          <Toolbar sx={{ gap: 1.5 }}><IconButton aria-label="Open admin navigation" onClick={() => setOpen(true)} sx={{ display: { md: 'none' } }}><MenuIcon /></IconButton><Typography variant="body2" sx={{ fontWeight: 700 }}>{active?.label ?? 'Site studio'}</Typography><Box sx={{ flexGrow: 1 }} /><Typography variant="caption" sx={{ color: dirty ? 'warning.dark' : 'text.secondary' }}>{dirty ? 'Unsaved changes' : 'Fish World administration'}</Typography></Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: { xs: 2, sm: 4, lg: 5 }, maxWidth: 1400, mx: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  </ChangesContext.Provider>;
}

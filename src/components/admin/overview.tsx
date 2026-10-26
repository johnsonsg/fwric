'use client';

import NextLink from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Card, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { DEFAULT_CONTENT, PAGE_SLUGS, pagePath } from '@/lib/content';
import { fetchSnapshot, FIELD_LABELS } from './content-editor';
import { readJson } from './media-library';

export function AdminOverview() {
  const query = useQuery({ queryKey: ['admin-content'], queryFn: fetchSnapshot, retry: false });
  return <Stack spacing={4}>
    <Box><Typography variant="overline" color="primary.main">Fish World / Site studio</Typography><Typography variant="h3" sx={{ fontSize: { xs: 32, md: 42 }, mt: 1 }}>Your website, at a glance.</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Manage your pages, keep your branding consistent, and publish updates from one place.</Typography></Box>
    {query.error && <Alert severity="error">{query.error.message}</Alert>}
    {query.data && !query.data.storageAvailable && <Alert severity="warning">The database is disconnected. The public site is showing its original content. Publishing and uploaded-media browsing need the database connection restored.</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
      {[['Public pages', String(PAGE_SLUGS.length), 'Every menu destination has its own page.'], ['Content storage', query.isPending ? 'Checking…' : query.data?.storageAvailable ? 'Connected' : 'Unavailable', 'Page content and settings are stored in MongoDB.'], ['Photo uploads', query.isPending ? 'Checking…' : query.data?.mediaAvailable ? 'Configured' : 'Needs setup', 'Photos are stored in your Cloudinary library.']].map(([label, value, help]) => <Card variant="outlined" key={label} sx={{ p: 3, borderRadius: 3 }}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h4" sx={{ fontSize: 26, mt: 1 }}>{value}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{help}</Typography></Card>)}
    </Box>
    <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: '#EAF1F8', color: '#12365D', border: '1px solid #D4E1EE', borderRadius: 3 }}><Typography variant="h5">Start with a page.</Typography><Typography sx={{ mt: 1, color: '#435B73' }}>Change a heading, swap a photo, or update a button. Every field is labeled for where it appears on your site.</Typography><Button component={NextLink} href="/admin/pages" variant="contained" color="secondary" endIcon={<ArrowForward />} sx={{ mt: 3 }}>Manage pages</Button></Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>{[
      ['/admin/branding', 'Branding & logos', 'Preview the logo for light backgrounds and the logo for dark backgrounds before publishing.'],
      ['/admin/media', 'Your photo library', 'Upload and reuse photos, with image descriptions for accessibility.'],
      ['/admin/business', 'Business details', 'Keep your phone, address, directions, and opening hours up to date everywhere.'],
      ['/admin/activity', 'Recent changes', 'See what changed, who saved it, and when it was published.'],
    ].map(([href, title, text]) => <Card variant="outlined" key={href} sx={{ p: 3, borderRadius: 3 }}><Typography variant="h6">{title}</Typography><Typography color="text.secondary" sx={{ my: 2 }}>{text}</Typography><Button component={NextLink} href={href} endIcon={<ArrowForward />}>Open {title.toLowerCase()}</Button></Card>)}</Box>
  </Stack>;
}

export function AdminPages() {
  const query = useQuery({ queryKey: ['admin-content'], queryFn: fetchSnapshot, retry: false });
  const content = query.data?.content ?? DEFAULT_CONTENT;
  if (query.isPending) return <CircularProgress aria-label="Loading pages" />;
  return <Stack spacing={3}>
    <Box><Typography variant="overline" color="primary.main">Website content</Typography><Typography variant="h3" sx={{ fontSize: 38 }}>Pages</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Choose a page to edit its text, photos, buttons, content cards, and search appearance.</Typography></Box>
    {query.error && <Alert severity="error">{query.error.message}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(3, 1fr)' }, gap: 3 }}>
      {PAGE_SLUGS.map((slug) => { const page = content.pages[slug]; return <Card key={slug} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ position: 'relative', aspectRatio: '16 / 8', bgcolor: 'primary.main', display: 'grid', placeItems: 'center' }}>{page.image ? <Image src={page.image} alt={page.imageAlt} fill unoptimized style={{ objectFit: 'cover' }} /> : <Typography variant="h4" color="primary.contrastText">{page.navLabel}</Typography>}</Box>
        <Box sx={{ p: 3, flexGrow: 1 }}><Stack direction="row"    sx={{justifyContent: "space-between", alignItems: "center", gap: 1}}><Typography variant="h5">{page.navLabel}</Typography><Chip size="small" label={pagePath(slug)} /></Stack><Typography color="text.secondary" sx={{ mt: 2 }}>{page.title}</Typography></Box>
        <Stack direction="row"  sx={{px: 3, pb: 3, gap: 1}}><Button component={NextLink} href={`/admin/pages/${slug}`} variant="contained">Edit page</Button><Button href={pagePath(slug)} target="_blank">View page</Button></Stack>
      </Card>; })}
    </Box>
  </Stack>;
}

type Activity = { section: string; summary: string; by: string; at: string; revision: number };
export function AdminActivity() {
  const query = useQuery({ queryKey: ['admin-activity'], queryFn: async () => readJson<{ activity: Activity[] }>(await fetch('/api/admin/activity', { cache: 'no-store' })), retry: false });
  return <Stack spacing={3}><Box><Typography variant="overline" color="primary.main">Publishing history</Typography><Typography variant="h3" sx={{ fontSize: 38 }}>Recent changes</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>The latest 100 content updates, with the fields that were changed.</Typography></Box>
    {query.isPending && <CircularProgress aria-label="Loading activity" />}
    {query.error && <Alert severity="error">{query.error.message}</Alert>}
    {query.data?.activity.length === 0 && <Alert severity="info">No updates have been published yet. Saved changes will appear here.</Alert>}
    {query.data?.activity.map((entry) => <Card variant="outlined" key={entry.revision} sx={{ p: 3, borderRadius: 3 }}><Stack direction="row"   sx={{justifyContent: "space-between", gap: 2}}><Typography variant="h6" sx={{ textTransform: 'capitalize' }}>{entry.section}</Typography><Chip label={`Version ${entry.revision}`} size="small" /></Stack><Stack direction="row"   sx={{my: 2, flexWrap: "wrap", gap: 1}}>{entry.summary.split(', ').map((key) => <Chip key={key} size="small" variant="outlined" label={FIELD_LABELS[key] ?? key} />)}</Stack><Typography variant="body2" color="text.secondary">{entry.by} · {new Date(entry.at).toLocaleString()}</Typography></Card>)}
  </Stack>;
}

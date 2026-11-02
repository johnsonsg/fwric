'use client';

import { useDeferredValue, useState } from 'react';
import Image from 'next/image';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Card, CardActionArea, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DEFAULT_CONTENT } from '@/lib/content';
import { galleryPath, imageDeliveryUrl, readJson, type MediaItem, type MediaPage } from '@/lib/media';
import { MediaUpload, type GalleryCategory } from './media-upload';

export { readJson } from '@/lib/media';
export type { MediaItem } from '@/lib/media';
type LibraryPage = MediaPage & { configured: boolean; categories: GalleryCategory[] };

const existing = new Map<string, MediaItem>();
for (const [name, url] of Object.entries(DEFAULT_CONTENT.branding)) {
  if (url.startsWith('/')) existing.set(url, { _id: url, url, name: name.replace(/([A-Z])/g, ' $1'), alt: name.startsWith('logo') ? DEFAULT_CONTENT.branding.logoAlt : 'Fish World browser icon' });
}
for (const page of Object.values(DEFAULT_CONTENT.pages)) {
  for (const [url, alt] of [[page.image, page.imageAlt], [page.sectionImage, page.sectionImageAlt], ...page.sections.map((section) => [section.image, section.imageAlt])]) {
    if (url) existing.set(url, { _id: url, url, name: url.split('/').at(-1) ?? 'Site image', alt });
  }
}

function MediaDetails({ asset, categories }: { asset: MediaItem; categories: GalleryCategory[] }) {
  const client = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(asset.category ?? '');
  const [alt, setAlt] = useState(asset.alt);
  const save = useMutation({
    mutationFn: async () => readJson(await fetch('/api/admin/media', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: asset._id, category, alt }) })),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['admin-media'] });
      await client.invalidateQueries({ queryKey: ['gallery'] });
      setEditing(false);
    },
  });
  return <Box sx={{ px: 1.5, pb: 1.5 }}>
    <Typography variant="caption" color="text.secondary">{categories.find(({ id }) => id === asset.category)?.title ?? (asset.category ? 'Category removed' : 'Media library only')}</Typography>
    <Button size="small" onClick={() => { setCategory(asset.category ?? ''); setAlt(asset.alt); save.reset(); setEditing(!editing); }} sx={{ display: 'block', mt: 0.5 }}>{editing ? 'Cancel' : 'Edit gallery details'}</Button>
    {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
      <TextField select label={`Gallery for ${asset.name}`} value={category} disabled={save.isPending} onChange={(event) => setCategory(event.target.value)} size="small">
        <MenuItem value="">Media library only</MenuItem>
        {asset.category && !categories.some(({ id }) => id === asset.category) && <MenuItem value={asset.category}>Category removed</MenuItem>}
        {categories.map(({ id, title }) => <MenuItem key={id} value={id}>{title}</MenuItem>)}
      </TextField>
      <TextField label={`Description for ${asset.name}`} value={alt} disabled={save.isPending} onChange={(event) => setAlt(event.target.value)} slotProps={{ htmlInput: { maxLength: 1000 } }} size="small" />
      <Typography variant="caption" color="text.secondary">Saving changes the public gallery immediately. Choose Media library only to remove a photo from its gallery.</Typography>
      <Button variant="outlined" size="small" disabled={!alt.trim() || save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Saving…' : 'Save photo details'}</Button>
      {save.error && <Alert severity="error">{save.error.message}</Alert>}
    </Stack>}
  </Box>;
}

export function MediaLibrary({ onSelect, galleryMode = false }: { onSelect?: (asset: MediaItem) => void; galleryMode?: boolean }) {
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('');
  const search = useDeferredValue(filter);
  const query = useInfiniteQuery({
    queryKey: ['admin-media', search, galleryMode ? category : 'library'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => readJson<LibraryPage>(await fetch(`/api/admin/media?page=${pageParam}&q=${encodeURIComponent(search)}${galleryMode ? `&gallery=1&category=${encodeURIComponent(category)}` : ''}`, { cache: 'no-store' })),
    getNextPageParam: (page) => page.nextPage ?? undefined,
    placeholderData: (previous) => previous,
    retry: false,
  });
  const first = query.data?.pages[0];
  const categories = first?.categories ?? [];
  const uploaded = query.data?.pages.flatMap((page) => page.assets) ?? [];
  const local = galleryMode ? [] : [...existing.values()].filter((asset) => `${asset.name} ${asset.alt}`.toLowerCase().includes(filter.toLowerCase()));
  const assets = [...new Map([...uploaded, ...local].map((asset) => [asset._id, asset])).values()];
  return <Stack spacing={3}>
    <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 3, p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Upload photos</Typography>
      <MediaUpload categories={categories} configured={first?.configured ?? false} onSelect={onSelect} galleryCategory={galleryMode ? category : undefined} onCategoryChange={galleryMode ? setCategory : undefined} />
      {first && !first.configured && <Alert severity="info" sx={{ mt: 2 }}>Uploads need the Cloudinary cloud name, API key, and API secret configured on the server. Existing site assets can still be selected below.</Alert>}
      {query.error && <Alert severity="warning" sx={{ mt: 2 }} action={<Button onClick={() => void query.refetch()}>Retry</Button>}>{query.error.message} Existing site assets are still available below.</Alert>}
    </Box>
    {galleryMode && category && <Button href={galleryPath(category)} target="_blank" rel="noopener noreferrer" variant="outlined" sx={{ alignSelf: 'flex-start' }}>View this public gallery</Button>}
    <TextField label="Find an image" value={filter} onChange={(event) => setFilter(event.target.value)} />
    {query.isPending && <CircularProgress size={24} aria-label="Loading uploaded images" />}
    <Typography variant="body2" color="text.secondary">Showing {uploaded.length} of {first?.total ?? 0} {galleryMode ? 'gallery photos' : `uploaded photos · ${local.length} existing site assets`}</Typography>
    {message && <Alert severity="success">{message}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
      {assets.map((asset) => <Card key={asset._id} variant="outlined" sx={{ borderRadius: 2, minWidth: 0 }}>
        <CardActionArea onClick={() => onSelect ? onSelect(asset) : void navigator.clipboard.writeText(asset.url).then(() => setMessage('Image URL copied.')).catch(() => setMessage(`Image URL: ${asset.url}`))} aria-label={onSelect ? `Select ${asset.name}` : `Copy URL for ${asset.name}`}>
          <Box sx={{ position: 'relative', aspectRatio: '4 / 3', bgcolor: asset.url.includes('dark') ? '#0B2631' : '#EDF3F4' }}><Image src={imageDeliveryUrl(asset.url, 480)} alt={asset.alt} unoptimized fill sizes="(min-width: 900px) 33vw, 50vw" style={{ objectFit: 'contain', padding: 10 }} /></Box>
          <Box sx={{ p: 1.5 }}><Typography variant="body2" sx={{ overflowWrap: 'anywhere', fontWeight: 700 }}>{asset.name}</Typography><Typography variant="caption" color="text.secondary">{onSelect ? 'Use this image' : 'Click to copy image URL'}{asset.width ? ` · ${asset.width} × ${asset.height}` : ''}</Typography></Box>
        </CardActionArea>
        {!onSelect && !asset._id.startsWith('/') && <MediaDetails asset={asset} categories={categories} />}
      </Card>)}
    </Box>
    {query.hasNextPage && <Button variant="outlined" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>{query.isFetchingNextPage ? 'Loading…' : 'Load more photos'}</Button>}
    {query.isFetchNextPageError && <Alert severity="error">Unable to load more photos. Please try again.</Alert>}
    {!assets.length && !query.isPending && <Alert severity="info">No images match your search.</Alert>}
  </Stack>;
}

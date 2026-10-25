'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Card, CardActionArea, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import UploadOutlined from '@mui/icons-material/UploadOutlined';
import { DEFAULT_CONTENT } from '@/lib/content';

export type MediaItem = { _id: string; url: string; name: string; alt: string; width?: number; height?: number };
export async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? 'The request could not be completed.');
  return body as T;
}

const existing = new Map<string, MediaItem>();
for (const [name, url] of Object.entries(DEFAULT_CONTENT.branding)) {
  if (url.startsWith('/')) existing.set(url, { _id: url, url, name: name.replace(/([A-Z])/g, ' $1'), alt: name.startsWith('logo') ? DEFAULT_CONTENT.branding.logoAlt : 'Fish World browser icon' });
}
for (const page of Object.values(DEFAULT_CONTENT.pages)) {
  for (const [url, alt] of [[page.image, page.imageAlt], [page.sectionImage, page.sectionImageAlt], ...page.sections.map((section) => [section.image, section.imageAlt])]) {
    if (url) existing.set(url, { _id: url, url, name: url.split('/').at(-1) ?? 'Site image', alt });
  }
}

export function MediaLibrary({ onSelect }: { onSelect?: (asset: MediaItem) => void }) {
  const client = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const query = useQuery({ queryKey: ['admin-media'], queryFn: async () => readJson<{ assets: MediaItem[]; configured: boolean }>(await fetch('/api/admin/media', { cache: 'no-store' })), retry: false });
  const upload = useMutation({
    mutationFn: async () => {
      if (!file || !alt.trim()) throw new Error('Choose a photo and describe it before uploading.');
      if (file.size > 4 * 1024 * 1024) throw new Error('Choose a photo smaller than 4 MB.');
      const data = new FormData(); data.append('file', file); data.append('alt', alt.trim());
      return readJson<{ asset: MediaItem }>(await fetch('/api/admin/media', { method: 'POST', body: data }));
    },
    onSuccess: ({ asset }) => {
      void client.invalidateQueries({ queryKey: ['admin-media'] });
      setMessage(`${asset.name} was uploaded to your media library.`); setFile(null); setAlt(''); setInputKey((key) => key + 1);
      onSelect?.(asset);
    },
  });
  const assets = [...(query.data?.assets ?? []), ...existing.values()].filter((asset) => `${asset.name} ${asset.alt}`.toLowerCase().includes(filter.toLowerCase()));
  return <Stack spacing={3}>
    <Box sx={{ border: '1px dashed', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 3, p: 3 }}>
      <Typography variant="h6">Upload a photo</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>PNG, JPEG, WebP, or GIF, up to 4 MB. Uploading adds an image to the library; selecting it in an editor and saving updates the site.</Typography>
      <Stack spacing={2}>
        <input key={inputKey} aria-label="Choose image to upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={upload.isPending} onChange={(event) => { setFile(event.target.files?.[0] ?? null); setMessage(''); }} />
        <TextField label="Image description (alt text)" value={alt} onChange={(event) => setAlt(event.target.value)} helperText="Describe what is in the image, for visitors using screen readers." disabled={upload.isPending} />
        <Button variant="contained" startIcon={<UploadOutlined />} disabled={!file || !alt.trim() || !query.data?.configured || upload.isPending} onClick={() => upload.mutate()} sx={{ alignSelf: 'flex-start' }}>{upload.isPending ? 'Uploading…' : 'Upload image'}</Button>
      </Stack>
      {query.data && !query.data.configured && <Alert severity="info" sx={{ mt: 2 }}>Uploads are not configured yet. Add the Cloudinary cloud name, API key, and API secret to the server environment. You can still select the existing site assets below.</Alert>}
      {query.error && <Alert severity="warning" sx={{ mt: 2 }}>{query.error.message} Existing site assets are still available below.</Alert>}
      {upload.error && <Alert severity="error" sx={{ mt: 2 }}>{upload.error.message}</Alert>}
      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
    </Box>
    <TextField label="Find an image" value={filter} onChange={(event) => setFilter(event.target.value)} />
    {query.isLoading && <CircularProgress size={24} aria-label="Loading uploaded images" />}
    <Typography variant="body2" color="text.secondary">{assets.length} images · Existing site assets and your uploaded photos</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
      {assets.map((asset) => <Card key={asset._id} variant="outlined" sx={{ borderRadius: 2 }}>
        <CardActionArea onClick={() => onSelect ? onSelect(asset) : void navigator.clipboard.writeText(asset.url).then(() => setMessage('Image URL copied.')).catch(() => setMessage(`Image URL: ${asset.url}`))} aria-label={onSelect ? `Select ${asset.name}` : `Copy URL for ${asset.name}`}>
          <Box sx={{ position: 'relative', aspectRatio: '4 / 3', bgcolor: asset.url.includes('dark') ? '#0B2631' : '#EDF3F4' }}><Image src={asset.url} alt={asset.alt} unoptimized fill style={{ objectFit: 'contain', padding: 10 }} /></Box>
          <Box sx={{ p: 1.5 }}><Typography variant="body2"  sx={{overflowWrap: 'anywhere', fontWeight: 700}}>{asset.name}</Typography><Typography variant="caption" color="text.secondary">{onSelect ? 'Use this image' : 'Click to copy image URL'}{asset.width ? ` · ${asset.width} × ${asset.height}` : ''}</Typography></Box>
        </CardActionArea>
      </Card>)}
    </Box>
    {!assets.length && <Alert severity="info">No images match your search.</Alert>}
  </Stack>;
}

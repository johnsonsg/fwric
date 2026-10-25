'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Box, Button, Dialog, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { assetUrl } from '@/lib/content';
import { MediaLibrary, type MediaItem } from './media-library';

export function ImageField({ label, value, onChange, help, dark = false }: { label: string; value: string; onChange: (url: string, alt?: string) => void; help?: string; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [failedUrl, setFailedUrl] = useState('');
  const valid = value && assetUrl.safeParse(value).success;
  return <Stack spacing={1.5}>
    <TextField label={label} value={value} onChange={(event) => onChange(event.target.value)} helperText={help ?? 'Select an image, or enter an existing /path or HTTPS image URL.'} />
    <Box sx={{ minHeight: 120, position: 'relative', border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: dark ? '#0B2631' : '#F5F8F9', display: 'grid', placeItems: 'center' }}>
      {valid && failedUrl !== value ? <Image src={value} alt={`${label} preview`} width={300} height={120} unoptimized onError={() => setFailedUrl(value)} style={{ width: '100%', height: 120, objectFit: 'contain', padding: 12 }} /> : <Typography variant="body2" sx={{ p: 2, color: dark ? '#fff' : 'text.secondary' }}>{value ? 'Preview unavailable. Check the image path.' : 'No image selected'}</Typography>}
    </Box>
    <Button variant="outlined" onClick={() => setOpen(true)} sx={{ alignSelf: 'flex-start' }}>Choose or upload image</Button>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>Choose an image<Button onClick={() => setOpen(false)}>Close</Button></DialogTitle>
      <DialogContent><MediaLibrary onSelect={(asset: MediaItem) => { onChange(asset.url, asset.alt); setOpen(false); }} /></DialogContent>
    </Dialog>
  </Stack>;
}

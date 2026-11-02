'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, IconButton, LinearProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import Close from '@mui/icons-material/Close';
import { prepareImage } from '@/lib/prepare-image';
import { readJson, type MediaItem } from '@/lib/media';
import { useAdminChanges } from './admin-shell';

export type GalleryCategory = { id: string; title: string };
type QueuedPhoto = { id: string; file: File; alt: string; status: 'ready' | 'processing' | 'uploading' | 'done' | 'error'; error?: string };

export function MediaUpload({ categories, configured, onSelect, galleryCategory, onCategoryChange }: { categories: GalleryCategory[]; configured: boolean; onSelect?: (asset: MediaItem) => void; galleryCategory?: string; onCategoryChange?: (category: string) => void }) {
  const client = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<QueuedPhoto[]>([]);
  const [libraryCategory, setCategory] = useState('');
  const category = galleryCategory ?? libraryCategory;
  const needsCategory = galleryCategory !== undefined && !category;
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const { setDirty } = useAdminChanges();
  const unfinished = photos.some(({ status }) => status !== 'done');

  useEffect(() => {
    if (!unfinished && !running) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unfinished, running]);

  useEffect(() => {
    // Only the dedicated Gallery owns this navigation warning. Image pickers
    // must not clear an editor's existing unsaved-content warning.
    if (galleryCategory === undefined) return;
    setDirty(unfinished || running);
    return () => setDirty(false);
  }, [galleryCategory, unfinished, running, setDirty]);

  const addFiles = (files: File[]) => {
    if (runningRef.current) return;
    setSelectionError(''); setNotice('');
    if (files.length + photos.length > 250) { setSelectionError('Add up to 250 photos at a time. Upload this batch, then clear it to add more.'); return; }
    const accepted = files.filter((file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) && file.size > 0 && file.size <= 30 * 1024 * 1024);
    if (accepted.length !== files.length) setSelectionError('Some files were skipped. Choose JPG, PNG, WebP, or GIF files up to 30 MB; export HEIC photos as JPG first.');
    setPhotos((current) => [...current, ...accepted.map((file): QueuedPhoto => ({ id: crypto.randomUUID(), file, alt: '', status: 'ready' }))]);
  };
  const updatePhoto = (id: string, change: Partial<QueuedPhoto>) => setPhotos((current) => current.map((photo) => photo.id === id ? { ...photo, ...change } : photo));
  const pending = photos.filter(({ status }) => status === 'ready' || status === 'error');
  const done = photos.filter(({ status }) => status === 'done').length;

  const upload = async () => {
    if (runningRef.current || needsCategory || !pending.length || pending.some((photo) => !photo.alt.trim())) return;
    runningRef.current = true; setRunning(true); setNotice('');
    let succeeded = 0; let failed = 0; let selected: MediaItem | undefined;
    try {
      // One at a time keeps memory bounded, even for a folder of large phone photos.
      for (const photo of pending) {
        try {
          updatePhoto(photo.id, { status: 'processing', error: undefined });
          const file = await prepareImage(photo.file);
          updatePhoto(photo.id, { status: 'uploading' });
          const data = new FormData();
          data.append('file', file); data.append('alt', photo.alt.trim()); data.append('category', category);
          const result = await readJson<{ asset: MediaItem }>(await fetch('/api/admin/media', { method: 'POST', body: data }));
          updatePhoto(photo.id, { status: 'done' });
          succeeded++; selected = result.asset;
        } catch (error) {
          failed++;
          updatePhoto(photo.id, { status: 'error', error: error instanceof Error ? error.message : 'Upload failed. Try again.' });
        }
      }
      setNotice(`${succeeded} ${succeeded === 1 ? 'photo uploaded' : 'photos uploaded'}.${failed ? ` ${failed} failed; you can retry them below.` : ''}`);
      await client.invalidateQueries({ queryKey: ['admin-media'] });
      await client.invalidateQueries({ queryKey: ['gallery'] });
      if (photos.length === 1 && selected && !failed) onSelect?.(selected);
    } finally { runningRef.current = false; setRunning(false); }
  };

  return <Stack spacing={2}>
    <TextField select label={galleryCategory !== undefined ? 'Livestock gallery category' : 'Upload destination'} value={category} onChange={(event) => onCategoryChange ? onCategoryChange(event.target.value) : setCategory(event.target.value)} disabled={running} helperText={category ? 'Uploads appear in this public livestock gallery immediately.' : galleryCategory !== undefined ? 'Choose a category from your Livestock page. Photos already published across all categories are shown below.' : 'Library photos can be selected in page editors or added to a gallery later.'}>
      <MenuItem value="">{galleryCategory !== undefined ? 'Choose a gallery category' : 'Media library only'}</MenuItem>
      {categories.map(({ id, title }) => <MenuItem key={id} value={id}>{title} gallery</MenuItem>)}
    </TextField>
    <Box
      onDragOver={(event) => { event.preventDefault(); if (!running && configured) setDragging(true); }}
      onDragLeave={(event) => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); if (configured) addFiles(Array.from(event.dataTransfer.files)); }}
      sx={{ border: '2px dashed', borderColor: dragging ? 'secondary.main' : 'divider', borderRadius: 3, bgcolor: dragging ? '#EAF1F8' : 'background.paper', p: { xs: 3, md: 4 }, textAlign: 'center' }}
    >
      <CloudUploadOutlined sx={{ fontSize: 44, color: 'secondary.main', mb: 1 }} />
      <Typography variant="h6">Drop your photos here</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>Add one photo or a batch. Larger photos are automatically resized and compressed.</Typography>
      <Button variant="outlined" onClick={() => input.current?.click()} disabled={running || !configured}>Choose photos</Button>
      <input ref={input} type="file" multiple hidden aria-label="Choose photos to upload" accept="image/jpeg,image/png,image/webp,image/gif" disabled={running || !configured} onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ''; }} />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>JPG, PNG, WebP up to 30 MB each. Animated GIFs up to 4 MB.</Typography>
    </Box>
    {selectionError && <Alert severity="warning">{selectionError}</Alert>}
    {!!photos.length && <>
      <Typography variant="body2">{photos.length} selected · {done} uploaded. Add a short description for each photo before uploading.</Typography>
      {photos.length > 1 && <Stack spacing={1}>
        <TextField label="Shared description for this batch (optional)" value={batchDescription} disabled={running} onChange={(event) => setBatchDescription(event.target.value)} slotProps={{ htmlInput: { maxLength: 1000 } }} helperText="Use a shared description if it accurately describes all these photos. You can customize each one below." />
        <Button variant="outlined" disabled={running || !batchDescription.trim()} onClick={() => setPhotos((current) => current.map((photo) => photo.status !== 'done' && !photo.alt.trim() ? { ...photo, alt: batchDescription.trim() } : photo))} sx={{ alignSelf: 'flex-start' }}>Apply to photos without descriptions</Button>
      </Stack>}
      <Box sx={{ maxHeight: 420, overflow: 'auto' }}><Stack spacing={2}>
        {photos.map((photo) => <Box key={photo.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ flex: 1, overflowWrap: 'anywhere', fontWeight: 600 }}>{photo.file.name} · {(photo.file.size / 1024 / 1024).toFixed(1)} MB</Typography>
            <IconButton size="small" aria-label={`Remove ${photo.file.name} from queue`} disabled={running} onClick={() => setPhotos((current) => current.filter(({ id }) => id !== photo.id))}><Close fontSize="small" /></IconButton>
          </Stack>
          <TextField label={`Description for ${photo.file.name}`} value={photo.alt} required disabled={running || photo.status === 'done'} slotProps={{ htmlInput: { maxLength: 1000 } }} onChange={(event) => updatePhoto(photo.id, { alt: event.target.value })} size="small" helperText="Describe the fish, coral, or scene for visitors using screen readers." />
          <Typography variant="caption" color={photo.status === 'error' ? 'error' : 'text.secondary'} role="status" sx={{ display: 'block', mt: 1 }}>{photo.error ?? ({ ready: 'Ready to upload', processing: 'Optimizing photo…', uploading: 'Uploading…', done: 'Uploaded', error: 'Upload failed' }[photo.status])}</Typography>
        </Box>)}
      </Stack></Box>
      {running && <LinearProgress aria-label="Batch upload progress" variant="determinate" value={photos.filter(({ status }) => status === 'done' || status === 'error').length / photos.length * 100} />}
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Button variant="contained" disabled={running || needsCategory || !configured || !pending.length || pending.some((photo) => !photo.alt.trim())} onClick={() => void upload()}>{running ? 'Uploading…' : photos.some(({ status }) => status === 'error') ? 'Upload remaining / retry failed' : `Upload ${pending.length === 1 ? 'photo' : `${pending.length} photos`}`}</Button>
        <Button disabled={running} onClick={() => { setPhotos([]); setNotice(''); }}>Clear queue</Button>
      </Stack>
    </>}
    {notice && <Alert severity={photos.some(({ status }) => status === 'error') ? 'warning' : 'success'}>{notice}</Alert>}
  </Stack>;
}

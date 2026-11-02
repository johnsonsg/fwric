'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Alert, Box, Button, CardActionArea, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import Close from '@mui/icons-material/Close';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { imageDeliveryUrl, readJson, type MediaPage } from '@/lib/media';

export function LivestockGallery({ category, title }: { category: string; title: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [failedImage, setFailedImage] = useState('');
  const query = useInfiniteQuery({
    queryKey: ['gallery', category],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => readJson<MediaPage>(await fetch(`/api/gallery?category=${encodeURIComponent(category)}&page=${pageParam}`, { cache: 'no-store' })),
    getNextPageParam: (page) => page.nextPage ?? undefined,
    retry: false,
  });
  const photos = [...new Map((query.data?.pages.flatMap((page) => page.assets) ?? []).map((asset) => [asset._id, asset])).values()];
  const current = selected === null ? undefined : photos[selected];
  const move = (delta: number) => { setSelected((index) => index === null ? null : Math.max(0, Math.min(photos.length - 1, index + delta))); };

  return <Stack spacing={3}>
    {query.isPending && <CircularProgress aria-label={`Loading ${title} photos`} />}
    {query.error && <Alert severity="warning" action={<Button onClick={() => void query.refetch()}>Retry</Button>}>{query.error.message}</Alert>}
    {query.data && <Typography color="text.secondary">{query.data.pages[0].total} photos · Select a photo to view it larger.</Typography>}
    {query.data && !photos.length && <Alert severity="info">New photos are coming soon. Check back to see what is in this gallery.</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 } }}>
      {photos.map((photo, index) => <Box key={photo._id} sx={{ minWidth: 0 }}>
        <CardActionArea onClick={() => setSelected(index)} aria-label={`Enlarge ${photo.alt}`} sx={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 3, bgcolor: '#102D48' }}>
          <Image src={imageDeliveryUrl(photo.url, 640)} alt={photo.alt} fill unoptimized sizes="(min-width: 900px) 33vw, 50vw" style={{ objectFit: 'cover' }} />
        </CardActionArea>
        <Typography variant="body2" sx={{ mt: 1, overflowWrap: 'anywhere' }}>{photo.alt}</Typography>
      </Box>)}
    </Box>
    {query.hasNextPage && <Button variant="outlined" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()} sx={{ alignSelf: 'center' }}>{query.isFetchingNextPage ? 'Loading…' : 'Load more photos'}</Button>}
    <Dialog open={!!current} onClose={() => setSelected(null)} fullWidth maxWidth="lg" aria-labelledby="gallery-photo-title" onKeyDown={(event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    }}>
      <DialogTitle id="gallery-photo-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>{title}<IconButton aria-label="Close photo" onClick={() => setSelected(null)}><Close /></IconButton></DialogTitle>
      <DialogContent>
        {current && <>
          <Box sx={{ position: 'relative', height: { xs: '50svh', md: '65svh' }, bgcolor: '#081A35', borderRadius: 2, overflow: 'hidden' }}>
            {failedImage === current.url ? <Alert severity="warning">This photo could not load. Close it and try again later.</Alert> : <Image src={imageDeliveryUrl(current.url, 1920)} alt={current.alt} fill unoptimized sizes="100vw" style={{ objectFit: 'contain' }} onError={() => setFailedImage(current.url)} />}
          </Box>
          <Typography sx={{ mt: 2, overflowWrap: 'anywhere' }}>{current.alt}</Typography>
          <Stack direction="row" sx={{ mt: 2, justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <IconButton aria-label="Previous photo" disabled={selected === 0} onClick={() => move(-1)}><ChevronLeft /></IconButton>
            <Typography variant="body2">{(selected ?? 0) + 1} of {photos.length}</Typography>
            <IconButton aria-label="Next photo" disabled={selected === photos.length - 1} onClick={() => move(1)}><ChevronRight /></IconButton>
          </Stack>
        </>}
      </DialogContent>
    </Dialog>
  </Stack>;
}

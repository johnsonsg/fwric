import { Stack, Typography } from '@mui/material';
import { MediaLibrary } from '@/components/admin/media-library';

export default function GalleryAdminPage() {
  return <Stack spacing={3}>
    <div>
      <Typography variant="overline" color="primary.main">Livestock / Photos</Typography>
      <Typography variant="h3" sx={{ fontSize: 38 }}>Gallery</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>Choose a Livestock category, then drop in one photo or a batch. Uploaded photos appear when visitors open that category’s card.</Typography>
    </div>
    <MediaLibrary galleryMode />
  </Stack>;
}

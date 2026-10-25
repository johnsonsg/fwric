import { Stack, Typography } from '@mui/material';
import { MediaLibrary } from '@/components/admin/media-library';
export default function Page() { return <Stack spacing={3}><div><Typography variant="overline" color="primary.main">Photos & assets</Typography><Typography variant="h3" sx={{ fontSize: 38 }}>Media library</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Upload photos once, then use them in your pages and branding.</Typography></div><MediaLibrary /></Stack>; }

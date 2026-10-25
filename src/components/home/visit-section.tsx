import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { HoursList } from '@/components/site/hours-list';
import { getContentSnapshot } from '@/lib/content-store';
import { phoneHref } from '@/lib/content';

export async function VisitSection() {
  const { content: { business } } = await getContentSnapshot();
  return (
    <Box component="section" aria-labelledby="visit-title" sx={{ pb: { xs: 8, md: 12 } }}>
      <Container>
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            p: { xs: 3, md: 6 },
            display: 'grid',
            gap: { xs: 4, md: 8 },
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="overline" sx={{ color: 'secondary.dark' }}>
              Visit the store
            </Typography>
            <Typography id="visit-title" variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, textWrap: 'balance' }}>
              {business.visitTitle}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 17 }}>
              {business.visitDescription}
            </Typography>
            <Box component="address" sx={{ fontStyle: 'normal', display: 'flex', gap: 1.5, alignItems: 'flex-start', mt: 1 }}>
              <PlaceOutlinedIcon color="primary" aria-hidden />
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{business.street}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  {`${business.city}, ${business.state} ${business.zip}`}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
              <Button component="a" href={business.mapsUrl} target="_blank" rel="noopener noreferrer" variant="contained" size="large">
                Get directions
              </Button>
              <Button component="a" href={phoneHref(business.phone)} variant="outlined" size="large">
                {business.phone}
              </Button>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              Store hours
            </Typography>
            <HoursList />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

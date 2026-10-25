import Image from 'next/image';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { SITE } from '@/lib/site';

export function Hero() {
  return (
    <Box component="section" aria-labelledby="hero-title" sx={{ position: 'relative', overflow: 'hidden', bgcolor: 'ink.main', color: 'ink.contrastText' }}>
      <Image src="/images/hero-reef.png" alt="Vibrant reef aquarium filled with colorful corals and tropical fish" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(11,28,36,0.94) 0%, rgba(11,28,36,0.7) 45%, rgba(11,28,36,0.1) 100%)',
        }}
      />
      <Container sx={{ position: 'relative', py: { xs: 10, md: 16 }, minHeight: { md: 640 }, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ maxWidth: 640 }}>
          <Typography variant="overline" sx={{ color: 'secondary.main' }}>
            Richmond, Virginia · Since 1998
          </Typography>
          <Typography id="hero-title" variant="h1" sx={{ fontSize: { xs: 44, sm: 60, md: 76 }, mt: 1.5, textWrap: 'balance' }}>
            Richmond&apos;s largest saltwater store.
          </Typography>
          <Typography sx={{ mt: 3, fontSize: { xs: 17, md: 19 }, opacity: 0.86, maxWidth: 520, textWrap: 'pretty' }}>
            Hand-picked corals, healthy fish and expert advice from people who have kept reefs for decades. Come see our
            1,200-gallon living reef in person.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 4 }}>
            <Button href="/livestock" variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />}>
              See what&apos;s in stock
            </Button>
            <Button component="a" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" variant="outlined" size="large" sx={{ color: 'inherit', borderColor: 'rgba(243,247,248,0.4)', '&:hover': { borderColor: 'currentColor' } }}>
              Get directions
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

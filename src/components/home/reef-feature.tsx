import Image from 'next/image';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const POINTS = [
  {
    title: 'Quarantined before it hits the floor',
    body: 'Every fish is observed and fed in our system before we offer it for sale, so it goes home eating and healthy.',
  },
  {
    title: 'Corals grown in the shop',
    body: 'Many of our frags come straight off the 1,200-gallon display — already acclimated to real-world aquarium conditions.',
  },
  {
    title: 'Advice from long-time reefers',
    body: 'Bring a water sample or a photo of your tank. We test for free and help you pick livestock that actually fits.',
  },
];

export function ReefFeature() {
  return (
    <Box component="section" aria-labelledby="reef-title" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: { xs: 8, md: 12 } }}>
      <Container sx={{ display: 'grid', gap: { xs: 5, md: 8 }, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'center' }}>
        <Box sx={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 4, overflow: 'hidden' }}>
          <Image src="/images/custom-install.png" alt="Large custom reef aquarium installed in a home" fill sizes="(min-width: 900px) 50vw, 100vw" style={{ objectFit: 'cover' }} />
          <Box sx={{ position: 'absolute', left: 16, bottom: 16, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 3, px: 2.5, py: 2 }}>
            <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 36, lineHeight: 1, color: 'primary.main' }}>
              1,200
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              gallon in-store living reef
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="overline" sx={{ color: 'secondary.main' }}>
            Why Fish World
          </Typography>
          <Typography id="reef-title" variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, mt: 1, textWrap: 'balance' }}>
            A store run by people who keep reefs, not just sell them.
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 5, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {POINTS.map((point) => (
              <Box component="li" key={point.title} sx={{ pl: 3, borderLeft: '2px solid', borderColor: 'secondary.main' }}>
                <Typography variant="h6" component="h3">
                  {point.title}
                </Typography>
                <Typography sx={{ mt: 0.5, opacity: 0.8 }}>{point.body}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

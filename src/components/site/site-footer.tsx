import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { HOURS, NAV_LINKS, SITE } from '@/lib/site';
import { Logo } from './logo';

export function SiteFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: 'ink.main', color: 'ink.contrastText', pt: { xs: 8, md: 10 }, pb: 4 }}>
      <Container>
        <Box
          sx={{
            display: 'grid',
            gap: 6,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.4fr 1fr 1fr 1.2fr' },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Logo inverted />
            <Typography variant="body2" sx={{ opacity: 0.72, maxWidth: 320 }}>
              Virginia's ultimate source for saltwater fish, corals, live rock and custom reef systems for more than 25 years.
            </Typography>
          </Box>

          <Box>
            <FooterHeading>Explore</FooterHeading>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} color="inherit" underline="hover" sx={{ opacity: 0.85 }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </Box>
          </Box>

          <Box>
            <FooterHeading>Visit</FooterHeading>
            <Box component="address" sx={{ fontStyle: 'normal', display: 'flex', flexDirection: 'column', gap: 1, opacity: 0.85 }}>
              <span>{SITE.address.street}</span>
              <span>{`${SITE.address.city}, ${SITE.address.state} ${SITE.address.zip}`}</span>
              <Link href={SITE.phoneHref} color="inherit" underline="hover">
                {SITE.phone}
              </Link>
              <Link href={`mailto:${SITE.email}`} color="inherit" underline="hover">
                {SITE.email}
              </Link>
            </Box>
          </Box>

          <Box>
            <FooterHeading>Hours</FooterHeading>
            <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 2, rowGap: 0.75, fontSize: 14 }}>
              {HOURS.map((h) => (
                <Box key={h.day} sx={{ display: 'contents' }}>
                  <Box component="dt" sx={{ opacity: 0.6 }}>
                    {h.day.slice(0, 3)}
                  </Box>
                  <Box component="dd" sx={{ m: 0, opacity: 0.9 }}>
                    {h.hours}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 8,
            pt: 3,
            borderTop: '1px solid rgba(243, 247, 248, 0.14)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: 1,
            fontSize: 13,
            opacity: 0.6,
          }}
        >
          <span>{`© ${new Date().getFullYear()} Fish World Richmond. All rights reserved.`}</span>
          <Link href="/admin" color="inherit" underline="hover">
            Staff login
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="overline" component="h2" sx={{ display: 'block', mb: 2, color: 'secondary.main' }}>
      {children}
    </Typography>
  );
}

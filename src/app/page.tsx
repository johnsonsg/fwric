import { connectToDatabase } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

const fallbackServiceCards = [
  {
    title: "SEO & Search Visibility",
    text: "Design and content architecture built to help people find the business through search, local discovery, and trusted content.",
  },
  {
    title: "Content Management",
    text: "An easy-to-use admin area for updating homepage copy, media, sections, and business details without developer help.",
  },
  {
    title: "Performance & Trust",
    text: "Fast page delivery, clean structure, and polished presentation to improve trust and conversion across devices.",
  },
];

const fallbackStats = [
  { value: "SEO", label: "search-ready foundation" },
  { value: "CMS", label: "editable content flow" },
  { value: "Fast", label: "modern frontend performance" },
  { value: "Secure", label: "auth + deployment ready" },
];

const fallbackGallery = [
  "Brand-first homepage",
  "Service overview",
  "About and credibility",
  "Conversion-focused CTA",
];

async function getPageSettings() {
  try {
    await connectToDatabase();
    const settings = await SiteSettings.findOne({}).lean();

    return {
      siteName: settings?.siteName ?? "FWRIC",
      tagline: settings?.tagline ?? "SEO-first web presence",
      seoDescription: settings?.seoDescription ?? "Modern SEO-first web presence.",
      heroBadge: settings?.heroBadge ?? "Web presence redesign",
      heroTitle: settings?.heroTitle ?? "Build trust, improve visibility, and update the site without a developer.",
      heroSubtitle:
        settings?.heroSubtitle ??
        "A modern web presence designed to help the business rank better, look more credible, and make updates quickly through a clean admin experience.",
      primaryCtaText: settings?.primaryCtaText ?? "Open admin",
      primaryCtaHref: settings?.primaryCtaHref ?? "/admin",
      secondaryCtaText: settings?.secondaryCtaText ?? "Explore services",
      secondaryCtaHref: settings?.secondaryCtaHref ?? "#services",
      serviceCards: fallbackServiceCards,
      stats: fallbackStats,
      gallery: fallbackGallery,
    };
  } catch {
    return {
      siteName: "FWRIC",
      tagline: "SEO-first web presence",
      seoDescription: "Modern SEO-first web presence.",
      heroBadge: "Web presence redesign",
      heroTitle: "Build trust, improve visibility, and update the site without a developer.",
      heroSubtitle:
        "A modern web presence designed to help the business rank better, look more credible, and make updates quickly through a clean admin experience.",
      primaryCtaText: "Open admin",
      primaryCtaHref: "/admin",
      secondaryCtaText: "Explore services",
      secondaryCtaHref: "#services",
      serviceCards: fallbackServiceCards,
      stats: fallbackStats,
      gallery: fallbackGallery,
    };
  }
}

export default async function Home() {
  const settings = await getPageSettings();

  return (
    <Box sx={{ minHeight: "100vh", background: "radial-gradient(circle at top, rgba(34,211,238,0.18), transparent 28%), #020617" }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: "1px solid rgba(148,163,184,0.15)" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ letterSpacing: 3, color: "#67e8f9", fontWeight: 700 }}>
                {settings.siteName}
              </Typography>
              <Typography variant="caption" sx={{ color: "#a5f3fc", letterSpacing: 1.2, textTransform: "uppercase" }}>
                {settings.tagline}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Typography component="a" href="#services" sx={{ color: "#cbd5e1", textDecoration: "none", fontSize: 14 }}>
                Services
              </Typography>
              <Typography component="a" href="#approach" sx={{ color: "#cbd5e1", textDecoration: "none", fontSize: 14 }}>
                Approach
              </Typography>
              <Button href="/admin" variant="outlined" color="primary">
                Admin
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" }, gap: 5, alignItems: "center" }}>
          <Box>
            <Chip
              label={settings.heroBadge}
              sx={{ background: "rgba(34,211,238,0.12)", color: "#a5f3fc", border: "1px solid rgba(34,211,238,0.4)", fontWeight: 700 }}
            />
            <Typography variant="h1" sx={{ mt: 3, fontSize: { xs: "2.8rem", md: "5rem" }, lineHeight: 1.02, maxWidth: 680 }}>
              {settings.heroTitle}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 2, color: "#a5f3fc", maxWidth: 620, letterSpacing: 0.5 }}>
              {settings.tagline}
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, color: "#cbd5e1", maxWidth: 620, lineHeight: 1.7 }}>
              {settings.heroSubtitle}
            </Typography>
            <Typography variant="body2" sx={{ mt: 3, color: "#94a3b8", maxWidth: 620 }}>
              {settings.seoDescription}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
              <Button href={settings.primaryCtaHref} variant="contained" color="primary" size="large">
                {settings.primaryCtaText}
              </Button>
              <Button href={settings.secondaryCtaHref} variant="outlined" color="primary" size="large">
                {settings.secondaryCtaText}
              </Button>
            </Stack>
          </Box>

          <Card sx={{ borderRadius: 4, border: "1px solid rgba(148,163,184,0.18)", background: "rgba(15,23,42,0.75)", boxShadow: "0 28px 80px rgba(6,182,212,0.15)" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="overline" sx={{ color: "#67e8f9", letterSpacing: 2.5 }}>
                Key focus areas
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2, mt: 3 }}>
                {settings.stats.map((stat) => (
                  <Box key={stat.label} sx={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: 3, p: 2.5, background: "rgba(2,6,23,0.8)" }}>
                    <Typography variant="h5" sx={{ color: "#67e8f9", fontWeight: 700 }}>{stat.value}</Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 1 }}>{stat.label}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Box id="services" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ color: "#67e8f9", letterSpacing: 2.5, display: "block" }}>
            What this site is built for
          </Typography>
          <Typography variant="h2" sx={{ mt: 1, mb: 4, fontSize: { xs: "2rem", md: "3rem" } }}>
            A stronger web presence from day one.
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 3 }}>
            {settings.serviceCards.map((card) => (
              <Card key={card.title} sx={{ height: "100%", borderRadius: 4, border: "1px solid rgba(148,163,184,0.18)", background: "rgba(15,23,42,0.9)" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 2 }}>{card.title}</Typography>
                  <Typography sx={{ color: "#cbd5e1", lineHeight: 1.7 }}>{card.text}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      <Box id="approach" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" }, gap: 4, alignItems: "stretch" }}>
            <Card sx={{ borderRadius: 4, border: "1px solid rgba(148,163,184,0.18)", background: "rgba(15,23,42,0.9)", p: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" sx={{ color: "#67e8f9", letterSpacing: 2.5 }}>
                  Design foundation
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, mb: 2 }}>
                  Built to feel modern, trusted, and clear.
                </Typography>
                <Typography sx={{ color: "#cbd5e1", lineHeight: 1.8 }}>
                  The layout is structured around credibility, content clarity, and conversion so visitors can understand what the business offers and take action quickly.
                </Typography>
              </CardContent>
            </Card>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
              {settings.gallery.map((item) => (
                <Card key={item} sx={{ borderRadius: 4, border: "1px solid rgba(148,163,184,0.18)", background: "rgba(2,6,23,0.85)", p: 2 }}>
                  <CardContent sx={{ minHeight: 170, display: "flex", alignItems: "end" }}>
                    <Typography variant="h6" sx={{ color: "#e2e8f0" }}>{item}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      <Box sx={{ pb: 10 }}>
        <Container maxWidth="lg">
          <Card sx={{ borderRadius: 4, border: "1px solid rgba(148,163,184,0.18)", background: "linear-gradient(135deg, rgba(34,211,238,0.12), rgba(15,23,42,0.9))", p: 2 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="overline" sx={{ color: "#67e8f9", letterSpacing: 2.5 }}>
                    Ready for content updates
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 1 }}>
                    Turn this into your live web presence.
                  </Typography>
                </Box>
                <Button href="/admin" variant="contained" color="primary" size="large">
                  Manage content
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}

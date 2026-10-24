import { auth } from "@/auth";
import { SiteSettingsEditor } from "@/components/site-settings-editor";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const quickActions = [
  "Update homepage copy",
  "Add media and gallery content",
  "Review SEO meta settings",
  "Manage business contact details",
];

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "#020617" }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: "1px solid rgba(148,163,184,0.18)" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1 }}>
            <Typography variant="h6" sx={{ color: "#67e8f9", letterSpacing: 2.5 }}>
              FWRIC ADMIN
            </Typography>
            <Button href="/api/auth/signout" color="primary" variant="outlined">
              Sign out
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="overline" sx={{ color: "#67e8f9", letterSpacing: 2.5 }}>
              Admin dashboard
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              Content management
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 3 }}>
            <Card sx={{ borderRadius: 4, border: "1px solid rgba(148,163,184,0.18)", background: "rgba(15,23,42,0.9)" }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>Logged in as</Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>{session.user.email}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 4, border: "1px solid rgba(148,163,184,0.18)", background: "rgba(15,23,42,0.9)" }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>Role</Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>{session.user.role ?? "admin"}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 4, border: "1px solid rgba(148,163,184,0.18)", background: "rgba(15,23,42,0.9)" }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>Status</Typography>
                <Typography variant="h6" sx={{ mt: 2, color: "#86efac" }}>Online</Typography>
              </CardContent>
            </Card>
          </Box>

          <Card sx={{ borderRadius: 4, border: "1px solid rgba(148,163,184,0.18)", background: "rgba(15,23,42,0.9)" }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: "#67e8f9", letterSpacing: 2.5 }}>
                Quick actions
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2, mt: 2 }}>
                {quickActions.map((item) => (
                  <Box key={item} sx={{ borderRadius: 2, border: "1px solid rgba(148,163,184,0.18)", background: "#020617", px: 2, py: 1.7, color: "#e2e8f0" }}>
                    {item}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <SiteSettingsEditor />
        </Stack>
      </Container>
    </Box>
  );
}

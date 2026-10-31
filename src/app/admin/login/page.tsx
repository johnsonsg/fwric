"use client";

import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FormEvent, type ReactNode, useState } from "react";

import { Logo } from "@/components/site/logo";

function LoginShell({ children }: { children: ReactNode }) {
  return (
    <Box component="main" sx={{ minHeight: "100svh", display: "grid", placeItems: "center", p: { xs: 2, sm: 4, lg: 6 }, bgcolor: "background.default" }}>
      <Paper sx={{ width: "100%", minWidth: 0, maxWidth: 1120, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 0.95fr) minmax(0, 1fr)" }, borderRadius: 4, overflow: "hidden", border: 1, borderColor: "divider", boxShadow: "0 24px 80px rgba(14, 74, 92, 0.08)" }}>
        <Box sx={{ position: "relative", minWidth: 0, minHeight: { xs: 240, md: 700 }, display: "flex", flexDirection: "column", justifyContent: "space-between", p: { xs: 3, sm: 5 }, bgcolor: "ink.main", color: "white" }}>
          <Image src="/images/hero-reef.png" alt="" fill sizes="(max-width: 900px) 100vw, 540px" unoptimized style={{ objectFit: "cover" }} />
          <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5, 29, 40, 0.75) 0%, rgba(5, 29, 40, 0.2) 35%, rgba(5, 29, 40, 0.95) 100%)" }} />
          <Box sx={{ position: "relative", width: { xs: 164, sm: 200 } }}><Logo inverted /></Box>
          <Box sx={{ position: "relative", mt: { xs: 5, md: 16 } }}>
            <Typography variant="overline" sx={{ color: "#8ed8e9" }}>Behind the scenes</Typography>
            <Typography component="p" variant="h2" sx={{ fontSize: { xs: 30, sm: 40 }, maxWidth: 360, mt: 1.5, color: "white" }}>A little care.<br />A world of difference.</Typography>
            <Typography sx={{ display: { xs: "none", md: "block" }, color: "rgba(255,255,255,0.75)", mt: 2.5, maxWidth: 320 }}>Keep your corner of the ocean looking its best.</Typography>
          </Box>
        </Box>
        <Box sx={{ minWidth: 0, p: { xs: 3, sm: 5, lg: 7 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {children}
        </Box>
      </Paper>
    </Box>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
        redirect: false,
      });

      if (!result?.ok || result.error) {
        setError(result?.error === "CredentialsSignin" ? "That email and password don’t match. Please try again." : "We couldn’t sign you in. Please try again.");
        return;
      }

      const requestedPath = searchParams.get("callbackUrl") ?? "/admin";
      const callbackUrl = requestedPath === "/admin" || requestedPath.startsWith("/admin/") ? requestedPath : "/admin";
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Unable to connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginShell>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "primary.main", mb: 2.5 }}>
          <LockOutlined sx={{ fontSize: 18 }} />
          <Typography variant="overline">Site administration</Typography>
        </Stack>
        <Typography component="h1" variant="h3" sx={{ fontSize: { xs: 34, sm: 42 } }}>Welcome back.</Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>Sign in to manage your pages, photos, and store details.</Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} aria-label="Administrator sign in" aria-busy={loading}>
        <Stack spacing={2.5}>
          <TextField id="email" name="email" label="Email address" type="email" autoComplete="username" required disabled={loading} />
          <TextField
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={loading}
            slotProps={{ input: { endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} onMouseDown={(event) => event.preventDefault()} disabled={loading} edge="end">
                  {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                </IconButton>
              </InputAdornment>
            ) } }}
          />
          {error && <Alert severity="error" role="alert">{error}</Alert>}
          <Button type="submit" variant="contained" size="large" loading={loading} endIcon={<ArrowForwardRounded />} sx={{ minHeight: 52, borderRadius: 2 }}>
            Sign in
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>Access is limited to website administrators. Need help? Contact your site administrator.</Typography>
      <Box sx={{ mt: 5, pt: 3, borderTop: 1, borderColor: "divider" }}>
        <Button href="/" startIcon={<ArrowBackRounded />} size="small" sx={{ px: 0, borderRadius: 1 }}>Back to website</Button>
      </Box>
    </LoginShell>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginShell><Stack direction="row" spacing={2} role="status" sx={{ alignItems: "center" }}><CircularProgress size={24} /><Typography>Loading sign in…</Typography></Stack></LoginShell>}>
      <AdminLoginForm />
    </Suspense>
  );
}

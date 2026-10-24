"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type SiteSettings = {
  siteName: string;
  tagline: string;
  domain: string;
  seoDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
};

const defaultSettings: SiteSettings = {
  siteName: "FWRIC",
  tagline: "SEO-first web presence",
  domain: "localhost:3000",
  seoDescription: "Modern SEO-first web presence.",
  heroBadge: "Web presence redesign",
  heroTitle: "Build trust, improve visibility, and update the site without a developer.",
  heroSubtitle:
    "A modern web presence designed to help the business rank better, look more credible, and make updates quickly through a clean admin experience.",
  primaryCtaText: "Open admin",
  primaryCtaHref: "/admin",
  secondaryCtaText: "Explore services",
  secondaryCtaHref: "#services",
};

async function fetchSettings(): Promise<SiteSettings> {
  const response = await fetch("/api/site-config", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to load site settings");
  }

  return response.json();
}

async function saveSettings(values: SiteSettings): Promise<SiteSettings> {
  const response = await fetch("/api/site-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("Failed to save site settings");
  }

  return response.json();
}

export function SiteSettingsEditor() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SiteSettings>(defaultSettings);
  const [message, setMessage] = useState("");

  const query = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    if (query.data) {
      setForm(query.data);
    }
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["site-settings"], data);
      setForm(data);
      setMessage("Settings saved successfully.");
    },
    onError: () => {
      setMessage("There was a problem saving the settings.");
    },
  });

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  if (query.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ borderRadius: 4, border: "1px solid rgba(148, 163, 184, 0.2)", background: "#0f172a" }}>
      <CardHeader title="Site settings" subheader="Update the main content and search metadata for the public site." />
      <CardContent>
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate(form);
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 3,
            }}
          >
            <TextField
              fullWidth
              label="Site name"
              value={form.siteName}
              onChange={(event) => handleChange("siteName", event.target.value)}
            />
            <TextField
              fullWidth
              label="Tagline"
              value={form.tagline}
              onChange={(event) => handleChange("tagline", event.target.value)}
            />
            <TextField
              fullWidth
              label="Domain"
              value={form.domain}
              onChange={(event) => handleChange("domain", event.target.value)}
            />
            <TextField
              fullWidth
              label="SEO description"
              value={form.seoDescription}
              onChange={(event) => handleChange("seoDescription", event.target.value)}
            />
            <TextField
              fullWidth
              label="Hero badge"
              value={form.heroBadge}
              onChange={(event) => handleChange("heroBadge", event.target.value)}
            />
            <TextField
              fullWidth
              label="Primary CTA text"
              value={form.primaryCtaText}
              onChange={(event) => handleChange("primaryCtaText", event.target.value)}
            />
            <TextField
              fullWidth
              label="Primary CTA link"
              value={form.primaryCtaHref}
              onChange={(event) => handleChange("primaryCtaHref", event.target.value)}
            />
            <TextField
              fullWidth
              label="Secondary CTA text"
              value={form.secondaryCtaText}
              onChange={(event) => handleChange("secondaryCtaText", event.target.value)}
            />
            <TextField
              fullWidth
              label="Secondary CTA link"
              value={form.secondaryCtaHref}
              onChange={(event) => handleChange("secondaryCtaHref", event.target.value)}
            />
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth
                label="Hero title"
                value={form.heroTitle}
                onChange={(event) => handleChange("heroTitle", event.target.value)}
              />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth
                label="Hero subtitle"
                multiline
                minRows={3}
                value={form.heroSubtitle}
                onChange={(event) => handleChange("heroSubtitle", event.target.value)}
              />
            </Box>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
            <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="outlined" size="large" onClick={() => setForm(query.data ?? defaultSettings)}>
              Reset
            </Button>
          </Stack>

          {message ? (
            <Alert severity={mutation.isError ? "error" : "success"} sx={{ mt: 3 }}>
              {message}
            </Alert>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
}

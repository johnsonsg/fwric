"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#22d3ee",
      dark: "#0891b2",
      contrastText: "#082f49",
    },
    secondary: {
      main: "#a78bfa",
    },
    background: {
      default: "#020617",
      paper: "#0f172a",
    },
    text: {
      primary: "#e2e8f0",
      secondary: "#cbd5e1",
    },
  },
  typography: {
    fontFamily: `var(--font-geist-sans), Arial, sans-serif`,
    h1: { fontWeight: 700, letterSpacing: -0.05 },
    h2: { fontWeight: 700, letterSpacing: -0.04 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "none",
          padding: "0.8rem 1.4rem",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

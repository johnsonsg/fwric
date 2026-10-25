"use client";

import NextLink from "next/link";
import { createTheme } from "@mui/material/styles";

const DEEP_SEA = "#0E4A5C";
const FISH_BLUE = "#1B6FA8";
const FISH_BLUE_LIGHT = "#3FB6D9";
const INK = "#0B1C24";
const MIST = "#F3F7F8";
const WHITE = "#FFFFFF";

const headingFont = "var(--font-heading), system-ui, sans-serif";

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: DEEP_SEA, contrastText: MIST },
    secondary: { main: FISH_BLUE, light: FISH_BLUE_LIGHT, contrastText: WHITE },
    background: { default: MIST, paper: WHITE },
    text: { primary: INK, secondary: "rgba(11, 28, 36, 0.68)" },
    divider: "rgba(11, 28, 36, 0.1)",
    ink: { main: INK, contrastText: MIST },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "var(--font-body), system-ui, sans-serif",
    h1: { fontFamily: headingFont, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.02 },
    h2: { fontFamily: headingFont, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.08 },
    h3: { fontFamily: headingFont, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 },
    h4: { fontFamily: headingFont, fontWeight: 600, letterSpacing: "-0.015em" },
    h5: { fontFamily: headingFont, fontWeight: 600 },
    h6: { fontFamily: headingFont, fontWeight: 600 },
    overline: { fontWeight: 700, letterSpacing: "0.14em", lineHeight: 1.6 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.55 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButtonBase: { defaultProps: { LinkComponent: NextLink } },
    MuiLink: { defaultProps: { component: NextLink } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 999, paddingInline: 22 }, sizeLarge: { paddingBlock: 12 } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: "1px solid rgba(11, 28, 36, 0.08)" } },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiAppBar: { defaultProps: { elevation: 0 } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTextField: { defaultProps: { fullWidth: true } },
  },
});

declare module "@mui/material/styles" {
  interface Palette {
    ink: Palette["primary"];
  }
  interface PaletteOptions {
    ink?: PaletteOptions["primary"];
  }
}

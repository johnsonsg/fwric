import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

import { Providers } from "@/app/providers";
import { AppThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fish World | Richmond's Largest Saltwater Aquarium Store",
    template: "%s | Fish World Richmond",
  },
  description:
    "Virginia's ultimate source for live corals, saltwater fish, live rock and custom reef aquariums. Visit our 1,200-gallon living reef in Richmond, VA.",
  generator: "v0.app",
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: [
      {
        url: "/icon/icon-light-32x32.png",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon/icon-dark-32x32.png",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: dark)",
      },
      { url: "/icon/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: "/icon/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E4A5C",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} bg-background`}>
      <body>
        <AppThemeProvider>
          <Providers>{children}</Providers>
        </AppThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

import { Providers } from "@/app/providers";
import { AppThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/lib/site";
import { getContentSnapshot } from "@/lib/content-store";
import { SiteContentProvider } from "@/components/site/content-provider";
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

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { content: { branding, pages } } = await getContentSnapshot();
  return {
    title: { default: `${branding.siteName} | ${pages.home.seoTitle}`, template: `%s | ${branding.siteName}` },
    description: pages.home.seoDescription,
    metadataBase: new URL(siteConfig.url),
    icons: {
      icon: [
        { url: branding.faviconLight, media: "(prefers-color-scheme: light)" },
        { url: branding.faviconDark, media: "(prefers-color-scheme: dark)" },
        { url: branding.faviconSvg, sizes: "any" },
      ],
      apple: branding.appleIcon,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0E4A5C",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { content } = await getContentSnapshot();
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} bg-background`}>
      <body>
        <AppThemeProvider>
          <Providers><SiteContentProvider content={content}>{children}</SiteContentProvider></Providers>
        </AppThemeProvider>
      </body>
    </html>
  );
}

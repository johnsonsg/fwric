import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/app/providers";
import { AppThemeProvider } from "@/components/theme-provider";
import { connectToDatabase } from "@/lib/db";
import { siteConfig } from "@/lib/site";
import { SiteSettings } from "@/models/SiteSettings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectToDatabase();
    const settings = await SiteSettings.findOne({}).lean();
    const siteName = settings?.siteName ?? siteConfig.name;
    const title = settings?.siteName ? `${settings.siteName} | ${settings.tagline ?? "FWRIC"}` : "FWRIC";
    const description = settings?.seoDescription ?? "Fish World web presence";

    return {
      metadataBase: new URL(siteConfig.url),
      title: {
        default: title,
        template: `%s | ${siteName}`,
      },
      description,
      alternates: {
        canonical: "/",
      },
      openGraph: {
        title,
        description,
        url: siteConfig.url,
        siteName,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    const fallbackTitle = "FWRIC";
    const fallbackDescription = "Fish World web presence";

    return {
      metadataBase: new URL(siteConfig.url),
      title: {
        default: fallbackTitle,
        template: `%s | ${siteConfig.name}`,
      },
      description: fallbackDescription,
      alternates: {
        canonical: "/",
      },
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: siteConfig.url,
        siteName: siteConfig.name,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
      },
    };
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <AppThemeProvider>
          <Providers>{children}</Providers>
        </AppThemeProvider>
      </body>
    </html>
  );
}

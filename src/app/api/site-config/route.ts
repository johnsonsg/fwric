import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";

const fallbackSettings = {
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

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await SiteSettings.findOne({}).lean();

    return NextResponse.json(settings ?? fallbackSettings);
  } catch {
    return NextResponse.json(fallbackSettings);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    await connectToDatabase();
    const updated = await SiteSettings.findOneAndUpdate(
      {},
      {
        ...fallbackSettings,
        ...payload,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save settings",
      },
      { status: 400 },
    );
  }
}

import mongoose, { Schema } from "mongoose";

const siteSettingsSchema = new Schema(
  {
    siteName: { type: String, default: "FWRIC" },
    tagline: { type: String, default: "SEO-first web presence" },
    domain: { type: String, default: "localhost:3000" },
    seoDescription: { type: String, default: "Modern SEO-first web presence." },
    heroBadge: { type: String, default: "Web presence redesign" },
    heroTitle: { type: String, default: "Build trust, improve visibility, and update the site without a developer." },
    heroSubtitle: {
      type: String,
      default:
        "A modern web presence designed to help the business rank better, look more credible, and make updates quickly through a clean admin experience.",
    },
    primaryCtaText: { type: String, default: "Open admin" },
    primaryCtaHref: { type: String, default: "/admin" },
    secondaryCtaText: { type: String, default: "Explore services" },
    secondaryCtaHref: { type: String, default: "#services" },
    updatedBy: { type: String, default: "system" },
  },
  {
    timestamps: true,
  },
);

export const SiteSettings =
  mongoose.models.SiteSettings || mongoose.model("SiteSettings", siteSettingsSchema);

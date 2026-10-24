export const siteConfig = {
  name: "Fish World",
  shortName: "Fish World",
  url:
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
};

export const SITE = {
  name: "Fish World",
  tagline: "Richmond's largest saltwater store",
  phone: "(804) 379-2466",
  phoneHref: "tel:+18043792466",
  email: "fishworld1@gmail.com",
  address: {
    street: "11634A Busy Street",
    city: "Richmond",
    state: "VA",
    zip: "23236",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=11634A+Busy+Street+Richmond+VA+23236",
};

export const HOURS = [
  { day: "Sunday", hours: "1:00 PM – 4:00 PM" },
  { day: "Monday", hours: "12:00 PM – 4:00 PM" },
  { day: "Tuesday", hours: "12:00 PM – 4:00 PM" },
  { day: "Wednesday", hours: "12:00 PM – 4:00 PM" },
  { day: "Thursday", hours: "12:00 PM – 4:00 PM" },
  { day: "Friday", hours: "12:00 PM – 4:00 PM" },
  { day: "Saturday", hours: "10:00 AM – 3:00 PM" },
];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/livestock", label: "Livestock" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const CATEGORY_SLUGS = [
  "corals",
  "fish",
  "invertebrates",
  "live-rock",
  "equipment",
  "food-health",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const CATEGORIES: Record<CategorySlug, { label: string; image: string }> = {
  corals: { label: "Corals", image: "/images/corals.png" },
  fish: { label: "Saltwater Fish", image: "/images/saltwater-fish.png" },
  invertebrates: { label: "Invertebrates", image: "/images/live-rock.png" },
  "live-rock": { label: "Live Rock", image: "/images/live-rock.png" },
  equipment: { label: "Equipment", image: "/images/equipment.png" },
  "food-health": { label: "Food & Health", image: "/images/food-health.png" },
};

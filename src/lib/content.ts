import { z } from 'zod';
import { CATEGORIES, HOURS, SITE } from '@/lib/site';

export const PAGE_SLUGS = ['home', 'livestock', 'services', 'about', 'contact'] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];
export const pagePath = (slug: PageSlug) => slug === 'home' ? '/' : `/${slug}`;
export const isPageSlug = (value: string): value is PageSlug => PAGE_SLUGS.some((slug) => slug === value);

const text = z.string().trim().max(1000);
const paragraph = z.string().trim().max(12000);
export const assetUrl = z.string().trim().max(2000).refine((value) =>
  value === '' || /^\/(?!\/)[^\\\s]*$/.test(value) || /^https:\/\/[^\s\\]+$/.test(value), 'Use a local /path or an https:// URL.');
export const linkUrl = z.string().trim().max(2000).refine((value) =>
  value === '' || /^\/(?!\/)[^\\\s]*$/.test(value) || /^https:\/\/[^\s\\]+$/.test(value) || /^(tel:|mailto:|#)[^\s]+$/.test(value), 'Use a site path, HTTPS URL, phone, or email link.');

export const sectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/).max(80),
  title: text.min(1), body: paragraph,
  image: assetUrl, imageAlt: text,
  linkLabel: text, linkHref: linkUrl,
}).strict();

export const pageSchema = z.object({
  navLabel: text.min(1).max(40),
  title: text.min(1), eyebrow: text, description: paragraph,
  image: assetUrl, imageAlt: text,
  seoTitle: text, seoDescription: text.max(500),
  primaryLabel: text, primaryHref: linkUrl,
  secondaryLabel: text, secondaryHref: linkUrl,
  collectionTitle: text,
  sectionTitle: text, sectionIntro: paragraph,
  sectionImage: assetUrl, sectionImageAlt: text, sectionCaption: text,
  sections: z.array(sectionSchema).max(40),
}).strict().superRefine((page, context) => {
  const ids = new Set<string>();
  page.sections.forEach((section, index) => {
    if (ids.has(section.id)) context.addIssue({ code: 'custom', path: ['sections', index, 'id'], message: 'Section IDs must be unique.' });
    ids.add(section.id);
    if (section.image && !section.imageAlt) context.addIssue({ code: 'custom', path: ['sections', index, 'imageAlt'], message: 'Describe this image for accessibility.' });
    if (section.linkLabel && !section.linkHref) context.addIssue({ code: 'custom', path: ['sections', index, 'linkHref'], message: 'Add a destination for this link.' });
  });
  if (page.image && !page.imageAlt) context.addIssue({ code: 'custom', path: ['imageAlt'], message: 'Describe the page image.' });
  if (page.sectionImage && !page.sectionImageAlt) context.addIssue({ code: 'custom', path: ['sectionImageAlt'], message: 'Describe the section image.' });
  for (const kind of ['primary', 'secondary'] as const) {
    if (page[`${kind}Label`] && !page[`${kind}Href`]) context.addIssue({ code: 'custom', path: [`${kind}Href`], message: 'Add a destination for this button.' });
  }
});

export const brandingSchema = z.object({
  siteName: text.min(1), tagline: text,
  logoLight: assetUrl.min(1), logoDark: assetUrl.min(1), logoAlt: text.min(1),
  faviconLight: assetUrl.min(1), faviconDark: assetUrl.min(1), faviconSvg: assetUrl.min(1), appleIcon: assetUrl.min(1),
}).strict();

export const businessSchema = z.object({
  phone: text.min(1), email: z.email(), street: text.min(1), city: text.min(1), state: text.min(1), zip: text.min(1),
  mapsUrl: z.url().refine((value) => value.startsWith('https://'), 'Use an HTTPS maps URL.'),
  footerDescription: paragraph, visitTitle: text, visitDescription: paragraph,
  hours: z.array(z.object({ day: z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']), hours: text.min(1) }).strict()).length(7)
    .refine((hours) => new Set(hours.map((entry) => entry.day)).size === 7, 'Include each day once.'),
}).strict();

export const contentSchema = z.object({
  branding: brandingSchema, business: businessSchema,
  pages: z.object({ home: pageSchema, livestock: pageSchema, services: pageSchema, about: pageSchema, contact: pageSchema }).strict(),
}).strict();

export type PageContent = z.infer<typeof pageSchema>;
export type ContentSection = z.infer<typeof sectionSchema>;
export type SiteContent = z.infer<typeof contentSchema>;
export type ContentSnapshot = { content: SiteContent; revision: number; updatedAt: string | null; storageAvailable: boolean; mediaAvailable: boolean };
export const phoneHref = (phone: string) => {
  const number = phone.replace(/[^+\d]/g, '');
  return `tel:${number.length === 10 ? `+1${number}` : number}`;
};

const section = (id: string, title: string, body: string, image = '', imageAlt = ''): ContentSection => ({ id, title, body, image, imageAlt, linkLabel: '', linkHref: '' });
const page = (navLabel: string, title: string, description: string, image: string, sections: ContentSection[]): PageContent => ({
  navLabel, title, description, image, imageAlt: image ? title : '', eyebrow: 'Fish World · Richmond, Virginia',
  seoTitle: title, seoDescription: description.slice(0, 300),
  primaryLabel: 'Visit the store', primaryHref: '/contact', secondaryLabel: '', secondaryHref: '',
  collectionTitle: '', sectionTitle: '', sectionIntro: '', sectionImage: '', sectionImageAlt: '', sectionCaption: '', sections,
});

export const DEFAULT_CONTENT: SiteContent = {
  branding: {
    siteName: 'Fish World', tagline: 'Saltwater Aquariums', logoLight: '/logo/logo-light.svg', logoDark: '/logo/logo-dark.svg', logoAlt: 'Fish World - Saltwater Aquariums',
    faviconLight: '/icon/icon-light-32x32.png', faviconDark: '/icon/icon-dark-32x32.png', faviconSvg: '/icon/icon.svg', appleIcon: '/icon/apple-icon.png',
  },
  business: {
    phone: SITE.phone, email: SITE.email, ...SITE.address, mapsUrl: SITE.mapsUrl,
    footerDescription: "Virginia's ultimate source for saltwater fish, corals, live rock and custom reef systems for more than 25 years.",
    visitTitle: 'Come see the reef in person.',
    visitDescription: 'Livestock changes daily, and nothing beats seeing a coral under real light. Bring a water sample and we will test it for free.',
    hours: businessSchema.shape.hours.parse(HOURS),
  },
  pages: {
    home: {
      ...page('Home', "Richmond's largest saltwater store.", 'Hand-picked corals, healthy fish and expert advice from people who have kept reefs for decades. Come see our 1,200-gallon living reef in person.', '/images/hero-reef.png', [
        section('quarantine', 'Quarantined before it hits the floor', 'Every fish is observed and fed in our system before we offer it for sale, so it goes home eating and healthy.'),
        section('corals', 'Corals grown in the shop', 'Many of our frags come straight off the 1,200-gallon display — already acclimated to real-world aquarium conditions.'),
        section('advice', 'Advice from long-time reefers', 'Bring a water sample or a photo of your tank. We test for free and help you pick livestock that actually fits.'),
      ]),
      eyebrow: 'Richmond, Virginia · Since 1998', imageAlt: 'Vibrant reef aquarium filled with colorful corals and tropical fish',
      seoTitle: "Richmond's Largest Saltwater Aquarium Store", primaryLabel: "See what's in stock", primaryHref: '/livestock', secondaryLabel: 'Get directions', secondaryHref: SITE.mapsUrl,
      collectionTitle: 'Everything your reef needs, under one roof.', sectionTitle: 'A store run by people who keep reefs, not just sell them.',
      sectionIntro: 'Why Fish World', sectionImage: '/images/custom-install-v2.jpg', sectionImageAlt: 'Large custom reef aquarium installed in a home', sectionCaption: '1,200 gallon in-store living reef',
    },
    livestock: {
      ...page('Livestock', 'Find your next reef favorite.', 'Explore our saltwater fish, corals, live rock, and aquarium essentials. Availability changes daily; call or visit to find out what is in the store today.', '/images/corals.png',
        Object.entries(CATEGORIES).map(([id, category]) => section(id, category.label, ({ corals: 'Explore SPS, LPS, and soft corals for your reef.', fish: 'Find saltwater fish suited to your aquarium and experience.', invertebrates: 'Discover invertebrates and cleanup crew options for your aquarium.', 'live-rock': 'Build your aquascape with live rock.', equipment: 'Explore lighting, flow, and filtration for your system.', 'food-health': 'Find foods, supplements, and aquarium care essentials.' } as Record<string, string>)[id], category.image, category.label))),
      sectionTitle: 'Explore the store',
    },
    services: {
      ...page('Services', 'Support for your saltwater aquarium.', 'From your first reef to a custom aquarium, talk with our team about the right setup and ongoing care for your system.', '/images/custom-install-v2.jpg', [
        section('custom-aquariums', 'Custom aquariums', 'Tell us about your space and the aquarium you have in mind. We can discuss a custom reef system and the equipment it needs.', '/images/custom-install-v2.jpg', 'Custom reef aquarium'),
        section('equipment', 'Equipment guidance', 'Get help choosing lighting, filtration, and flow for your aquarium.', '/images/equipment.png', 'Aquarium equipment'),
        section('water-testing', 'Water testing and advice', 'Bring a water sample or photos of your tank. Our team can help you understand your system and plan your next steps.'),
      ]), sectionTitle: 'How we can help', primaryLabel: 'Talk to our team', primaryHref: '/contact',
    },
    about: {
      ...page('About', 'A local home for reef keepers.', 'Fish World is a saltwater aquarium store in Richmond, Virginia. Visit our team, explore the livestock, and experience our 1,200-gallon living reef.', '/images/hero-reef.png', [
        section('our-store', 'Come meet the team', 'Whether you are setting up your first aquarium or caring for a reef you have kept for years, we are here to help you make informed choices.'),
        section('living-reef', 'Experience the living reef', 'Our in-store reef is a place to see a mature saltwater aquarium in person and talk through ideas for your own system.', '/images/custom-install-v2.jpg', 'Fish World living reef aquarium'),
        section('our-approach', 'Advice for your aquarium', 'Tell us about your tank, your livestock, and your goals. We will help you find an approach that fits your aquarium.'),
      ]), sectionTitle: 'Get to know Fish World',
    },
    contact: {
      ...page('Contact', 'Visit Fish World in Richmond.', 'Stop by the store, give us a call, or send an email. We can help with livestock availability, aquarium equipment, and questions about your system.', '', [
        section('before-you-visit', 'Before you visit', 'Looking for a specific fish, coral, or piece of equipment? Call ahead to check current availability.'),
      ]), sectionTitle: 'Plan your visit', primaryLabel: 'Call the store', primaryHref: SITE.phoneHref,
    },
  },
};

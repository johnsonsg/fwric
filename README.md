# Fish World

Next.js public site and custom Material UI admin. Content is stored in MongoDB; uploaded photos are stored in Cloudinary.

## Local development

Configure `.env.local`, then run `npm run dev`. The public site is at `http://localhost:3000`; administration starts at `/admin/login`.

Required for administration and publishing:

- `MONGODB_URI`: MongoDB connection string.
- `AUTH_SECRET`: a strong session secret.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: the administrator account.
- `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`: the canonical application URL. Use the deployed HTTPS URL in production.

Photo uploads additionally require `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Set these in the hosting environment as well as locally. Credentials stay on the server. Existing site images and SVG logos can be selected without configuring uploads.

## Editing the site

The admin side navigation contains:

- **Pages**: Home, Livestock, Services, About, and Contact. Edit headings, introductions, photos and descriptions, buttons, search metadata, and content cards. Cards can be added, removed, and reordered. Livestock categories also supply the home page shop cards and category filters.
- **Branding & logos**: the logo for light backgrounds, the logo for dark backgrounds, and browser/bookmark icons. Each image has a preview. The light-background logo appears on white headers and the mobile menu; the dark-background logo appears on the transparent home header and the footer.
- **Business details**: shared phone, email, address, directions, store hours, visit copy, and footer introduction.
- **Media library**: drag and drop one photo or a batch of up to 250. JPG, PNG, and WebP originals up to 30 MB are resized and compressed in the browser before upload; animated GIFs must be under 4 MB. Add individual descriptions or apply an accurate shared description to a batch. Select a livestock gallery to publish there immediately, or keep uploads in the library for use in editors. Failed photos can be retried without re-uploading successful queue items. Edit uploaded photos to change descriptions, move categories, or remove them from public galleries by selecting **Media library only**. The library is paginated, supports search, and keeps the existing asset picker. SVG logos in `public/logo/` remain selectable; SVG uploads are not accepted.
- **Gallery**: manage the public Livestock galleries at `/admin/gallery`. Select a category from the Livestock page, then drag in one or many photos. The selected category filters the published photos below. Visitors open that gallery by clicking its Livestock card. Category IDs connect the gallery to the card, so renaming a category keeps its photos associated.
- **Recent changes**: the latest 100 published changes, identifying the section, changed fields, administrator, timestamp, and version.

Editors show the fields changed before publishing and warn about unsaved changes when leaving through the side navigation or closing the tab. **Save & publish** updates the public site on its next load. **View published page** opens the saved page, not an unsaved draft. Concurrent saves use version checks so an older editor cannot overwrite newer content.

Original content is defined in `src/lib/content.ts`. The first publish creates the singleton `site` document in the `sitecontents` collection. Existing legacy `sitesettings` documents are left untouched. If storage is unavailable, public pages show their original content and the admin disables publishing; it does not claim a failed save succeeded.

## Verification

- `npm run lint`: source checks.
- `npm run build`: production compilation and route validation.
- `npm run check:editors`: render every editor with the default content and verify its essential controls and labels.
- `npm run check:gallery`: check category isolation, pagination, gallery publication/removal, upload validation, and protected media endpoints against an isolated temporary MongoDB database. Cloudinary is mocked; no real uploads are created. Requires `MONGODB_URI` and permission to create/remove the temporary database.
- `npm run check:admin`: with the dev server running, sign in using `.env.local`, check admin routes and protected endpoints, and verify rejected invalid updates. This does not publish changes. Set `CHECK_BASE_URL` to check another local server.
- `npm run check:content`: test the actual save handler against an isolated, uniquely named MongoDB database, including persistence, version conflicts, concurrent edits, validation, and publishing history. The temporary database is removed afterward; the configured site database is not changed. The MongoDB account must permit creating and removing the temporary database.

Public menu routes are `/`, `/livestock`, `/services`, `/about`, and `/contact`. Livestock cards open `/livestock/<category-id>` galleries, with optimized thumbnails, pagination, and a larger photo viewer. Existing `/livestock?category=<category-id>` category filters remain supported. Unknown page slugs and gallery categories return 404. Admin routes require an authenticated administrator; the public sitemap excludes admin pages.

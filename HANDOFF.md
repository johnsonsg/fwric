# FWRIC Project Handoff

## 1. Project overview
This project is a Next.js full-stack app for the business website and admin content workflow. It is designed to support:

- public website marketing pages
- admin login and protected content management
- MongoDB-backed settings/content storage
- SEO-friendly metadata and sitemap setup
- future growth for galleries, services, and additional CMS sections

The app is intentionally built as a simple but solid foundation for future developer handoff.

## 2. Tech stack
- Frontend: Next.js 16, React 19, TypeScript
- UI: Material UI
- State/data fetching: TanStack React Query
- Backend: Next.js server routes and server actions pattern
- Auth: NextAuth with credentials login
- Database: MongoDB + Mongoose
- Media: Cloudinary ready for upload integration
- Hosting: Vercel
- CI/CD: GitHub + Vercel automatic build/deploy

## 3. Key project structure
- src/app/
  - public pages
  - admin pages
  - API routes
- src/components/
  - reusable UI and editor components
- src/lib/
  - database and helper utilities
- src/models/
  - MongoDB models
- src/auth.ts
  - authentication configuration
- src/providers/
  - query provider and app providers

## 4. Current backend foundation
The app already has real server-side backend pieces:

- protected admin dashboard
- credentials-based login flow
- MongoDB connection helper
- SiteSettings model
- GET/PUT API route for site settings
- admin-only content management entry point

This means the project already functions as a full-stack app, even though it is still a small foundation rather than a fully expanded CMS.

## 5. Local development
From the project root:

```bash
cd /Users/shawnjohnson/MyProjects/FW/fwric
npm install
cp .env.example .env.local
npm run dev
```

Then open:

- http://localhost:3000
- http://localhost:3000/admin/login

## 6. Required environment variables
The app expects values such as:

- MONGODB_URI
- AUTH_SECRET
- NEXTAUTH_URL
- ADMIN_EMAIL
- ADMIN_PASSWORD
- CLOUDINARY_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

The example file is `.env.example`.

## 7. Deployment recommendation
Use:

- GitHub repo
- Vercel for hosting
- MongoDB Atlas for database
- GoDaddy for custom domain DNS management

This is the best fit for a future handoff because it is simple, standard, and easy for another developer to understand.

## 8. Why not Netlify
Netlify is fine for purely static sites, but this app is more than that:

- server-side routes
- auth
- database connectivity
- admin content editing
- Next.js app architecture

Vercel is the better long-term match for this project and for future maintenance.

## 9. Recommended next priorities
1. Add real business copy and brand content
2. Expand the database models beyond the site settings shell
3. Add more editable sections (services, gallery, contact, about)
4. Connect live MongoDB and env vars for production
5. Deploy to Vercel and configure GoDaddy DNS

## 10. Handoff notes for future developers
A future dev should know:

- The app is a full-stack Next.js project, not a static frontend only.
- Admin pages use server-side auth checks and session validation.
- Site content is editable via API routes and MongoDB-backed models.
- The app is designed to evolve from a small site into a richer CMS.
- Build verification should happen with `npm run build` before launch.

## 11. Typical production sequence
1. Push repo to GitHub
2. Connect repo to Vercel
3. Add env vars in Vercel
4. Connect MongoDB Atlas and confirm DB access
5. Deploy preview build
6. Add custom domain in Vercel
7. Update GoDaddy DNS records to point to Vercel
8. Test admin login and public pages

## 12. Important reminders
- Keep secrets in environment variables only.
- Do not hardcode live DB credentials in the codebase.
- Always validate the app with `npm run build` after major changes.
- If the app grows, consider adding Swagger/OpenAPI for API documentation.

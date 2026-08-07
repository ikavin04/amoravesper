# Amora Vesper — Official Author Website

A production-ready, luxury author portfolio and reading platform.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Animations | Framer Motion, GSAP |
| Rich Text | TipTap |
| Backend | Node.js, Express |
| Database | PostgreSQL (Supabase) |
| Storage | Supabase Storage (auto-WebP via Sharp) |
| Auth | JWT + bcrypt (HttpOnly cookies) |

## Structure

```
Amora/
├── client/           # Next.js 15 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (client)/     # Public site
│   │   │   │   ├── page.tsx           # Homepage
│   │   │   │   ├── books/             # Books listing + detail
│   │   │   │   ├── quotes/            # Favorite lines
│   │   │   │   ├── gallery/           # Moodboard gallery
│   │   │   │   ├── news/              # Blog + posts
│   │   │   │   ├── about/             # Biography
│   │   │   │   ├── contact/           # Social links
│   │   │   │   └── search/            # Global search
│   │   │   ├── (admin)/      # Admin studio
│   │   │   │   ├── author/            # Login page (hidden)
│   │   │   │   └── dashboard/         # Full CRUD dashboard
│   │   │   ├── sitemap.ts             # Dynamic sitemap
│   │   │   ├── robots.ts              # Search crawler config
│   │   │   └── feed.xml/              # RSS feed
│   │   ├── components/
│   │   │   ├── client/                # Public components
│   │   │   └── ui/                    # Shared UI
│   │   ├── lib/
│   │   │   ├── api.ts                 # Axios API client
│   │   │   └── utils.ts               # Helper utilities
│   │   └── types/index.ts             # Shared TypeScript types
│   └── package.json
└── server/           # Express backend
    ├── src/
    │   ├── db/
    │   │   ├── schema.sql             # Full PostgreSQL schema
    │   │   └── pool.ts                # pg connection pool
    │   ├── routes/                    # All CRUD routes
    │   ├── services/                  # Auth, Storage, DB
    │   └── index.ts                   # Main Express entry
    └── package.json
```

## Getting Started

### 1. Database Setup

```bash
# Create Supabase project at supabase.com
# Run schema.sql in the SQL editor
cat server/src/db/schema.sql | paste into Supabase SQL Editor
```

### 2. Server Setup

```bash
cd server
cp .env.example .env
# Fill in your values
npm install
npm run seed  # Creates admin account
npm run dev
```

### 3. Client Setup

```bash
cd client
cp .env.example .env.local
# Fill in API URL
npm install
npm run dev
```

## Admin Access

Navigate to `/author` — the login page is intentionally unlisted and hidden from navigation.

Default admin credentials are set via `npm run seed` in the server directory.

## Deployment

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Set `NEXT_PUBLIC_API_URL` environment variable to your Railway URL
3. Deploy

### Backend → Railway

1. Connect repo to Railway
2. Set all environment variables from `.env.example`
3. Deploy (Railway auto-detects Node.js)

## Features

**Public Site**
- ✅ Hero section with GSAP character reveal + parallax
- ✅ Featured book showcase
- ✅ Writing status + progress bar
- ✅ Pinned quote with background image
- ✅ Books grid with status, genres, external links
- ✅ Countdown timer for upcoming books
- ✅ Blog / News with rich HTML content
- ✅ Gallery with masonry grid + lightbox
- ✅ Pinterest-style quotes wall
- ✅ About page with biography + social links
- ✅ Contact page
- ✅ Global search (books, quotes, characters, posts)
- ✅ Sitemap.xml, robots.txt, RSS feed
- ✅ ISR (Incremental Static Regeneration)
- ✅ Full SEO metadata + OpenGraph

**Admin Studio** (`/dashboard`)
- ✅ JWT auth with HttpOnly cookies
- ✅ Overview with analytics stats
- ✅ Books CRUD (cover/banner upload, status, featured)
- ✅ Chapters CRUD (lock/preview, word count, release dates)
- ✅ Quotes CRUD (pin, background image)
- ✅ Gallery management (drag-and-drop, folder tabs)
- ✅ Characters CRUD (per-book, photo upload)
- ✅ Blog editor (TipTap rich text, cover upload)
- ✅ Settings (hero, about, socials, announcement banner)
- ✅ Quick upload tool with URL copy
- ✅ Analytics dashboard (views, top pages, daily chart)

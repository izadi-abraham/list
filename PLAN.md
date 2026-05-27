# List — Project Plan

## What this is

A personal list app for everyday life. Started as a shared shopping list for two people, designed from day one to grow into any kind of list: books, movies, meals, tasks, and beyond.

The first iteration (in this git history) was built with NestJS + Vue 3 + PostgreSQL + Prisma. The rewrite you're reading was started in May 2026 with a new stack and a clean implementation.

---

## Stack

| Layer | Choice |
|---|---|
| Runtime | Bun |
| Backend | Elysia.js |
| Frontend | Nuxt 3 (SSR) |
| Database | PostgreSQL + JSONB (Neon for hosting) |
| ORM | Drizzle ORM |
| Real-time | Elysia WebSockets |
| Auth | JWT (15m) + refresh tokens (90d, argon2id) |
| Styling | Tailwind CSS |
| i18n | @nuxtjs/i18n — English / Persian (RTL) / Dutch |

---

## Monorepo layout

```
apps/
  api/        Elysia backend (port 4000)
  web/        Nuxt 3 frontend (port 3000)
packages/
  shared/     TypeScript types + Zod schemas used by both apps
```

---

## Data model

The core is relational: users own lists, lists have items, lists can be shared.

Items have a `metadata JSONB` column for type-specific fields so new list types never require a schema migration:

- Shopping: `{ brand, category, notes }`
- Books: `{ author, isbn, genre, status, rating }`
- Movies: `{ director, year, country, genre, platform }`
- Food / meals: `{ cuisine, cookTime, lastCooked, recipeUrl, ingredients: [] }`

---

## v1 scope (shopping list MVP)

- Register and login (two users: husband + wife)
- Create / share a shopping list
- Add, update, delete, and check off items
- Quantity stepper per item (Albert Heijn basket style)
- Real-time sync via WebSocket — changes appear on both phones instantly
- i18n: English, Persian (RTL), Dutch
- Mobile-first responsive design
- Deployed for free: Neon (DB) + Fly.io (API) + Vercel (web)

---

## Deployment (zero cost)

| Service | Provider |
|---|---|
| PostgreSQL | Neon (neon.tech) — free tier, never pauses |
| API | Fly.io — free shared VM |
| Frontend | Vercel — free, handles Nuxt SSR |
| Domain | User-provided (DNS A record → Vercel) |

---

## Future roadmap

- Book / movie / food list UIs
- Due dates and reminders (Web Push)
- Food list: "surprise me" random meal picker
- Recipe links on food items
- Native Android / iOS (Expo or Flutter — API is already REST + WS)
- Drag-to-reorder items
- Offline support (service worker + sync queue)
- Public read-only sharing link
- List templates

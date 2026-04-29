# Kaua's 

A **private family photo library** with a premium Mac-inspired design.
Built with **Next.js 16 · React 19 · Tailwind 4 · shadcn/ui · Clerk · Sanity**,
laid out as a **Pinterest-style masonry gallery**.

## ✨ Features

- 🖼️ **Pinterest masonry** gallery that keeps every photo looking its best
- 💎 **Mac-inspired UI** -frosted glass panels, soft shadows, ambient gradients
- 🔐 **Clerk** authentication, route-protected via middleware
- 📦 **Sanity** CMS for photos, albums and family members (with a mock fallback so the UI works out of the box)
- 🧩 **Component-based architecture** with `components/ui` (shadcn primitives), `components/layout`, `components/gallery`, `components/home`
- 🌗 **Light & dark mode** via CSS variables
- 🎨 Custom design tokens in `app/globals.css`

## 🗂 Project layout

```
app/
  layout.tsx              # Clerk provider, fonts, toaster, global gradient
  page.tsx                # Landing + "Family wall" masonry preview
  gallery/page.tsx        # Full masonry gallery
  albums/page.tsx         # Album index
  albums/[slug]/page.tsx  # Album detail
  family/page.tsx         # Invited members
  upload/page.tsx         # Upload flow
  sign-in/[[...]]/page.tsx
  sign-up/[[...]]/page.tsx

components/
  ui/          # shadcn primitives (button, card, dialog, dropdown…)
  layout/      # Navbar, Sidebar, Footer, Logo
  gallery/    # PhotoCard, MasonryGrid, PhotoLightbox, AlbumCard, UploadDialog
  home/        # Hero, FeatureGrid

lib/
  utils.ts     # cn() + formatDate()
  data.ts      # Sanity → mock data fallback
  mock-data.ts # Curated Unsplash placeholders

sanity/
  client.ts    # Sanity client + image URL builder
  env.ts
  queries.ts   # GROQ queries + TS types
  schemas/     # photo, album, familyMember

middleware.ts  # Clerk route protection
```

## 🚀 Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000> -without any keys it runs with **built-in mock photos** so you can explore the whole UI.

## 🔐 Clerk setup

1. Create a project at <https://clerk.com>.
2. Copy the keys into `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…
   CLERK_SECRET_KEY=sk_test_…
   ```
3. Routes under `/gallery`, `/albums`, `/family`, `/favorites`, `/highlights`, `/upload` are automatically protected by `middleware.ts`.

## 📦 Sanity setup

1. Create a project at <https://sanity.io/manage>.
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=…
   NEXT_PUBLIC_SANITY_DATASET=production
   ```
3. Bootstrap the schemas (from `sanity/schemas/`) in your own Sanity Studio, or drop them into a local studio project.

The app reads through `lib/data.ts`, which falls back to curated mock data whenever Sanity isn’t configured -so the UI stays beautiful during development.

## 🧩 Adding new shadcn primitives

The project is compatible with the shadcn CLI (`components.json` is present). Run:

```bash
pnpm dlx shadcn@latest add <component>
```

New primitives land in `components/ui` and inherit the custom Mac-style tokens defined in `app/globals.css`.

## 🛠 Scripts

```bash
pnpm dev     # Next.js dev server (Turbopack)
pnpm build   # Production build
pnpm start   # Production server
pnpm lint    # ESLint
```

## License

MIT -make it your own.

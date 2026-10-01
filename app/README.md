# BikeLelo

India-specific motorcycle & scooter marketplace and configurator — "PC Part Picker + Newegg for motorbikes".
Browse and compare specs, see ex-showroom and state on-road prices, check every retailer offer, and build a
bike part by part with live fitment checks.

## Stack

| Layer | Choice |
| :-- | :-- |
| App | Vite + React 19 + TypeScript + Tailwind CSS 3 (static SPA) |
| UI | shadcn/ui primitives + components vendored from this repo's collections (`src/components/vendor`) |
| Backend | Supabase (Postgres + Auth + RLS) — read directly from the browser |
| Hosting | GitHub Pages (`bikelelo/dist` via `.github/workflows/deploy-pages.yml`) |
| Scraper | `../scraper` — Node + Playwright/Crawlee worker that refreshes prices into Supabase |

## Commands

```bash
pnpm install
pnpm dev          # local dev server
pnpm typecheck    # tsc -b
pnpm build        # typecheck + vite build + 404.html/.nojekyll for Pages
pnpm build:single # one self-contained dist/index.html (no assets, no build step needed to deploy)
pnpm preview      # serve the production build
```

## Deploying

`pnpm build` emits `dist/` for GitHub Pages (or any static host). Set `VITE_BASE`
to the sub-path when the site is not at a domain root; the router also derives
its base from the first URL segment at runtime, so a project site works under any
repository name.

`pnpm build:single` instead inlines the JS, CSS and favicon into a single
`dist/index.html`. Upload that one file (plus `dist/404.html` for deep links) to
a repository and enable Pages to publish the whole app without a build step —
handy when the source cannot be pushed or a CI runner is not available.

## Data

The app reads the live Supabase tables when they exist and fall back to the bundled snapshot at
`src/data/catalog.json` otherwise, so the static build never breaks. Apply the schema with the SQL in
`../supabase/migrations/0001_init.sql` and the generated `../supabase/seed.sql` (see `../supabase/README.md`).

## Responsive design

Mobile-first: single-column cards and a slide-over filter sheet on phones, a sticky filter rail and multi-column
grids on laptops, and a sticky two-column layout on desktop model pages.

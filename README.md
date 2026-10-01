# BikeLelo

India's motorcycle and scooter marketplace and configurator — build, compare and price
two-wheelers across retailers. Live at **https://ricco-mallick.github.io/bikelelo/**

## Layout

| Path | What it is |
| :-- | :-- |
| `index.html` | The built, self-contained app. **This is what GitHub Pages serves.** |
| `404.html` | Same file, so deep links and refreshes work on Pages. |
| `app/` | Full source (Vite + React + TypeScript + Tailwind). |

## How deployment works

GitHub Pages is set to *Deploy from a branch → main → / (root)*, so the site is served
straight from the built `index.html` at the repository root — no build step on the server.

Because of that, **`index.html` is generated**: to change the site, edit `app/` and either

- push to `main` and let the `Build & publish` workflow rebuild `index.html` automatically, or
- run it locally:
  ```bash
  cd app
  pnpm install
  SINGLE_FILE=1 VITE_BASE=/ pnpm build
  cp dist/index.html ../index.html && cp dist/404.html ../404.html
  ```

Never hand-edit `index.html` — it is machine-generated from `app/`.

## Development

```bash
cd app
pnpm install
pnpm dev          # local dev server
pnpm build        # normal build -> dist/
pnpm lint         # oxlint
```

The app reads a bundled catalogue snapshot when Supabase tables are absent, so it runs
with no backend attached.

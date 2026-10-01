# Vendored components manifest

Curated components copied from the upstream component collections into
`bikelelo/src/components/vendor/`. The repo's Tailwind classes and visual
design are untouched; only imports and a few dead-code spots were adapted.
Re-exports live in `index.ts`.

## Vendored

| Vendored file | Original repo path | Collection | Adaptation |
|---|---|---|---|
| `spotlight-navbar.tsx` | `vengence_ui/components_code/navbar-docs/spotlight-navbar.tsx` | vengence_ui | Removed unused `isDark` state + theme MutationObserver; converted styled-jsx `<style jsx>` / `:global()` to a plain `<style>` block with a `.dark nav` selector; dropped unused `React` default import |
| `gooey-search.tsx` | `vengence_ui/components_code/navbar-docs/gooey-search.tsx` | vengence_ui | Copied as-is (no Next.js imports present) |
| `glow-border-card.tsx` | `vengence_ui/components_code/layout-cards/glow-border-card.tsx` | vengence_ui | Copied as-is |
| `logo-slider.tsx` | `vengence_ui/components_code/tooltip-marquee/logo-slider.tsx` | vengence_ui | Copied as-is |
| `faq-accordion.tsx` | `vengence_ui/components_code/tooltip-marquee/faq-accordion.tsx` | vengence_ui | Copied as-is |
| `stats-counter.tsx` | `vengence_ui/components_code/text-motion/stats-counter.tsx` | vengence_ui | Copied as-is |
| `animated-number.tsx` | `vengence_ui/components_code/text-motion/animated-number.tsx` | vengence_ui | Copied as-is |
| `kinetic-text-loader.tsx` | `vengence_ui/components_code/loaders/kinetic-text-loader.tsx` | vengence_ui | Copied as-is |
| `pop-button.tsx` | `vengence_ui/components_code/buttons/pop-button.tsx` | vengence_ui | Copied as-is |
| `radial-glow-button.tsx` | `vengence_ui/components_code/buttons/radial-glow-button.tsx` | vengence_ui | Copied as-is |
| `skiper3-apple-play-button.tsx` | `skipper_ui/components_code/minimal-interactions/skiper3-apple-play-button.tsx` | skipper_ui | Dropped unused `React` default import |
| `skiper58-text-roll-navigation.tsx` | `skipper_ui/components_code/minimal-interactions/skiper58-text-roll-navigation.tsx` | skipper_ui | Copied as-is |
| `skiper61-mouse-follow-animations.tsx` | `skipper_ui/components_code/minimal-interactions/skiper61-mouse-follow-animations.tsx` | skipper_ui | Copied as-is |
| `skiper63-apple-squicircle-effect.tsx` | `skipper_ui/components_code/minimal-interactions/skiper63-apple-squicircle-effect.tsx` | skipper_ui | Removed unused `LOGO_SPRING` const |
| `motion-orbit.tsx` | `free/components_code/loader/motion-orbit.tsx` | free | Removed unused `rotX`/`rotY` transform helpers |
| `pulse-roll.tsx` | `free/components_code/loader/pulse-roll.tsx` | free | Removed unused `rotX`/`rotY`/`scaleU` transform helpers |
| `encrypt-button.tsx` | `free/components_code/button/encrypt-button.tsx` | free | Copied as-is |

## Notes

- No file in the picked set used `next/image`, `next/link`, or
  `next/navigation`, so no `SmartImage` wrapper was needed. If one is added
  later, place it at `bikelelo/src/components/vendor/SmartImage.tsx`.
- `next/link` replacements were also unnecessary for the same reason; the
  navbar takes plain `href` strings and an `onItemClick` callback, so route
  wiring can happen at the call site with react-router.
- The app's `@/lib/utils` `cn` alias resolves correctly for all files.
- No new npm dependencies were added.

## Skipped components and why

| Component | Collection | Reason |
|---|---|---|
| `notch-navbar` | vengence_ui | Requires `next-themes` (not installed) |
| `search-modal` | vengence_ui | Requires `@phosphor-icons/react` (not installed) |
| `staggered-grid` | vengence_ui | Requires `gsap` and `imagesloaded` (not installed) |
| `circular-gallery` | vengence_ui | Requires `gsap` (not installed) |
| `animated-footer` | vengence_ui | Requires `gsap` and `next-themes` (not installed) |
| `skiper47-perspective-carousel` | skipper_ui | Requires `swiper` (not installed) |
| `skiper48-card-swipe-carousel` | skipper_ui | Requires `swiper` (not installed) |
| `skiper49-inverted-perspective-carousel` | skipper_ui | Requires `swiper` (not installed) |
| `skiper50-creative-carousel-001` | skipper_ui | Requires `swiper` (not installed) |
| `skiper51-creative-carousel-002` | skipper_ui | Requires `swiper` (not installed) |
| `skiper54-shadcn-clippath-carousal` | skipper_ui | Requires `embla-carousel-autoplay` (not installed) and `@/components/ui` shadcn primitives (not present in the app) |
| `skiper25-music-toggle-btn` | skipper_ui | Requires `use-sound` (not installed) |
| `skiper26-theme-toggle-btn` | skipper_ui | Requires `next-themes` (not installed) |
| `skiper37-animated-number` | skipper_ui | Requires `@number-flow/react` and `react-intersection-observer` (not installed) |
| `skiper40-csslink` | skipper_ui | Requires `next` (not installed) |
| free loaders (`gyro-loader`, `particle-*`, `metal-*`, `plate-stack`, etc.) | free | Only 2 loaders were requested; the rest were healthy candidates (no external deps) and can be vendored later |
| `arrow-reveal-button`, `dotted-offset-button`, `label-slide-button`, `tactile-button` | free | Require the standalone `motion` package (not installed; only `framer-motion` is) |
| threeui (entire collection) | threeui | Not in scope for the requested pick list; its 3D components target three.js (not installed) |

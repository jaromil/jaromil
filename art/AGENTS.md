# AGENTS.md — Jaromil artist website (art/)

You are working on the artist website of Jaromil (Denis Roio), an Astro
project inside the jaromil.dyne.org repository. It is **not** a portfolio
template: the homepage is one black stage and the works generate the
visual variation. Read this file fully before editing.

## Run

```sh
cd art
npm install
npm run dev       # dev server
npm run build     # static build → dist/  (the test gate, with:)
npm run check     # astro check (types)
npm run preview   # serve dist/ locally
```

Deploy: push to `master` → `.github/workflows/deploy.yml` builds `art/`
and publishes repo root + `art/dist/` at `/art/` to GitHub Pages.
`astro.config.mjs` sets `base: '/art'` and `trailingSlash: 'always'`.

## Architecture

- `src/content.config.ts` — four collections: **practices** (ongoing
  techniques), **works** (belong to / realize a practice, or standalone),
  **exhibitions**, **texts**. Relations are frontmatter references
  (`practice: <slug>`), never duplication.
- `src/lib/media.ts` — Media is a zod discriminated union:
  `image | video | peertube | svg | code`. Never raw HTML strings.
  `src/lib/assets.ts` resolves files from `src/assets/media/`.
- `src/lib/site.ts` — site identity (name, description). Single source.
- `src/lib/paths.ts` — `href()` honors base + trailing slash.
- `src/pages/index.astro` — the homepage: an explicit `sequence` list of
  slugs feeds `src/components/Stage.astro`. Open it to understand the site.
- `src/layouts/` — `Base` (chrome, ClientRouter), `Work`, `Practice`.
- `src/components/` — Stage, IndexOverlay, SiteHeader, BottomBar, Media
  family (Image/Video/PeerTube/CodeWork), MDX primitives (Statement,
  Essay, FullBleed, Caption, Meta, RelatedWorks).
- `src/styles/` — `global.css` (tokens, reset, a11y), `typography.css`
  (roles, .page column, .index-list).
- `DESIGN.md` (repo root) — the visual system. `README.md` here — how to
  update content.

## Invariants (break only on explicit instruction)

1. Interface monochrome: `--black:#080808 --white:#f1f1ed --grey:#8d8d88`.
   Colour enters only through artworks. Never desaturate artwork.
2. No cards, thumbnail grids/masonry, shadows, gradients, badges,
   hamburger menus, oversized nav, marketing typography, decorative
   animation, UI chrome for its own sake.
3. Typography and space carry identity. Long-form text: measure ≤62ch,
   leading 1.7, paragraph rhythm 1.15em (incl. inside `div[lang]`).
4. Every work/practice is a real URL (back/forward/share/SEO). Stage
   states link to pages; view-transition names `hero-<slug>` /
   `title-<slug>` are set by JS on the active state only.
5. Media is lazy: PeerTube = poster-first, iframe on activation; autoplay
   only muted; one video at a time; honor reduced-motion and save-data.
   IntersectionObserver does not see `inert` toggles — the Stage starts
   and stops its own videos.
6. Accessibility is infrastructure: landmarks, one h1, skip link, visible
   focus, `inert` inactive states, aria-live announcements, keyboard for
   everything. Test with `a11y-test.mjs`.
7. Facts come only from supplied source material. Missing content:
   `<p class="todo">…</p>` / YAML `# TODO:`. Never invent dates, titles,
   exhibitions, interpretations. Italian source prose stays in
   `<div lang="it">`.
8. Dependencies stay minimal: astro, @astrojs/mdx, typescript,
   @astrojs/check (+ playwright dev-only). Justify any addition.

## Testing

Playwright smoke suites (dev-only, against `npm run preview`):
`stage-test.mjs` (stage behaviour), `pages-test.mjs` (routes/relations),
`a11y-test.mjs` (16 routes), `vt-test.mjs` (view transitions + reduced
motion). Chromium path: `~/.cache/ms-playwright/chromium_headless_shell-1228/...`
(see any suite for `executablePath`).

## Current state (2026-09)

Complete: scaffold, design system, media abstraction, content (3
practices, 5 works, 1 exhibition, 1 text), black stage with
counter-as-control, all routes, view transitions, a11y pass, CI deploy.
Critique fixes applied (hover states, opaque header, prose rhythm, INDEX
naming). Open content TODOs (marked in files): Data Portraits practice
text; years of the three portraits (2024, inferred); year of Todos los
que traes contigo; Hasciicam video/PeerTube material; la-boheme-digitale
full text. Dowse practice/work prose deduplication was proposed, paused
by the user.

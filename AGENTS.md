# Repository: jaromil.dyne.org

Static personal site (hand-written HTML at root, `journal/` for writings)
plus the artist website in `art/` (Astro project, branch `artist-website`).

## art/ — artist website

Astro + MDX + vanilla CSS/TS. No UI framework, no CMS, no trackers.
**Start here: `art/AGENTS.md`** (full session briefing). Docs:
`art/README.md` (content updates), `DESIGN.md` (visual system, with
`.impeccable/design.json` sidecar). Build: `cd art && npm run build`.
Type-check: `npm run check`. Smoke tests: `art/*-test.mjs` (Playwright,
against `npm run preview`).

Key invariants — do not break these without explicit instruction:

- The homepage is a black stage; the interface stays monochrome
  (`--black/--white/--grey`); colour comes only from artworks.
- No cards, grids of thumbnails, shadows, gradients, badges, hamburger
  menus, or marketing typography.
- Content is file-based MDX in `art/src/content/` (practices, works,
  exhibitions, texts). Works link to practices via a single
  `practice:` frontmatter reference. Media is a typed union
  (image|video|peertube|svg|code|hasciicam) — never raw HTML strings.
- PeerTube iframes are lazy (poster first, activate on intent); autoplay
  only muted; one video at a time; respect reduced-motion and save-data.
- Facts come only from supplied source material. Missing content is
  marked with `<p class="todo">` / YAML `# TODO:` — never invent dates,
  titles, exhibitions, or interpretations.
- Italian source prose stays in Italian inside `<div lang="it">`.

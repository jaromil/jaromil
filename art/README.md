# Jaromil — artist website

Black-stage Astro site. The works generate the visual variation; the
interface stays monochrome. Stack: Astro + MDX + vanilla CSS/TS. Nothing else.

```sh
npm install
npm run dev       # http://localhost:4321/art/
npm run build     # static output in dist/
npm run preview   # serve the build
npm run check     # type-check
npm run test:content     # assertions against the built authored collections
npm run test:standalone  # isolated standalone-work rendering fixture (never published)
```

Deploy: push to `master` — `.github/workflows/deploy.yml` builds `art/`
and publishes the whole site (repo root + `art/dist/` at `/art/`) to
GitHub Pages. One-time: Settings → Pages → Source = "GitHub Actions".

## Updating content

All content is MDX files in `src/content/`. Edit a file, push, done.
Media files (images, videos) go in `src/assets/media/` and are referenced
by file name. Facts come only from supplied source material; mark gaps
with `<p class="todo">…</p>` — never invent.

| To… | Do this |
|---|---|
| Edit the site description / identity | `src/lib/site.ts` (single source of truth) |
| Edit a practice | `src/content/practices/<slug>.mdx` |
| Edit a work | `src/content/works/<slug>.mdx` |
| Edit an exhibition | `src/content/exhibitions/<slug>.mdx` |
| Edit a text | `src/content/texts/<slug>.mdx` |
| Edit interface strings (EN/IT) | `ui` dictionary in `src/lib/i18n.ts` |
| Change the homepage stage order | `sequence` list in `src/lib/stage.ts` |
| Change colors / type | tokens in `src/styles/global.css` |

## Languages

EN is the default (unprefixed URLs), IT lives under `/it/`. The entry
page redirects to the browser language; a manual choice in the header
switch (EN/IT codes) is stored and overrides the browser thereafter.
Deep links never redirect. Content without a translation falls back to
the only language available — Italian source prose shows on English
pages, English-only strings on Italian ones.

To add a language: add its code to `locales` in `src/lib/i18n.ts`, add
its `ui` dictionary, and mirror the page wrappers from `src/pages/it/`
into `src/pages/<code>/`.

## Add a work

Create `src/content/works/my-work.mdx`:

```mdx
---
title: My Work
year: 2025
practice: dowsing          # optional — links the work to a primary practice
hero:
  type: image              # image | video | peertube | svg | code | hasciicam
  src: my-image.png        # file in src/assets/media/
  alt: Describe the image for screen readers.
---

MDX body — prose, or components: <Statement> <Essay> <FullBleed>
<Media> <Caption> <Meta> <RelatedWorks>.
```

The one `practice:` line is the whole association: the practice page
lists the work, the work page shows the practice. Nothing else to edit.

## Add a practice

Create `src/content/practices/my-practice.mdx` — same shape, plus
`statement:` (one or two sentences, shown on the stage) and optional
`yearFrom`, `status: ongoing|archived`, `currentRealization: <work-slug>`.
To show it on the homepage stage, add its slug to `sequence` in
`src/pages/index.astro`.

## Add an exhibition

`src/content/exhibitions/my-exhibition.mdx` with `title`, optional
`curator`, `showings:` (list of `year` / `venue` / `city`), and
`works:` (slugs).

## Video and PeerTube

Self-hosted, plays through a plain `<video>`:

```yaml
type: video
sources: [{ src: my-clip.webm, type: video/webm }]
poster: my-poster.png     # optional
aspect: 16 / 9
autoplay: false           # autoplay only ever plays muted
muted: true
loop: false
controls: true
```

PeerTube — lazy by design (poster first, iframe only on activation):

```yaml
type: peertube
host: video.example.org   # instance hostname
uuid: 9c9de5e8-....       # video UUID
title: Title of the video
poster: my-poster.png     # optional
aspect: 16 / 9
```

Use either in a `hero:` or inline in MDX: `<Media media={{ … }} />`.

## Live HasciiCam

The visitor's own camera rendered as ASCII by the WASM build of hasciicam
(glue + binary vendored from the dyne.org CI demo into
`public/hasciicam/`). The poster shows until the camera runs and stays as
fallback; the camera starts when the media becomes visible/active and
every track stops when it is swiped away, hidden, or the page is left.
Under reduced-motion or save-data it does not auto-start — a start button
appears instead. Frames never leave the browser.

```yaml
type: hasciicam
poster: hasciicam-eye.png  # fallback/poster, file in src/assets/media/
alt: Describe the live image for screen readers.
```

To refresh the vendored runtime, download `hasciicam.js` and
`hasciicam.wasm` from https://dyne.org/hasciicam/demo/ into
`public/hasciicam/`.

## Conventions

- Italian source prose stays in Italian inside `<div lang="it">`.
- Interface stays monochrome (`--black/--white/--grey`); colour comes
  only from artworks. No cards, grids, shadows, badges, hamburger menus.
- Smoke tests (dev only): `node stage-test.mjs`, `a11y-test.mjs`,
  `vt-test.mjs`, `pages-test.mjs`, `hasciicam-test.mjs` against
  `npm run preview`.

## Reproducing the regression gates

Use the locked dependencies and an already installed Google Chrome. The
shared `tests/browser.mjs` launcher uses the `chrome` channel, keeps the
browser sandbox enabled, and never downloads a browser. If Chrome is in a
different location, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its existing
executable. On Linux, long session temporary paths use a verified descriptor
alias to the same directory so Chrome's socket path fits its system limit.

From `art/`:

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run check
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm run test:content
npm run test:standalone
ASTRO_TELEMETRY_DISABLED=1 npm run preview -- --host 127.0.0.1 --port 4323
```

Keep that production preview running; in a second terminal in `art/` run
each command below. `ART_TEST_URL` can override the default
`http://localhost:4323/art/` (include the trailing slash).

```sh
node stage-test.mjs
node pages-test.mjs
node a11y-test.mjs
node vt-test.mjs
node hasciicam-test.mjs
node locale-test.mjs
node delight-test.mjs
node polish-test.mjs
node typeset-test.mjs
```

The camera suite uses fake media devices and denial fixtures; no real camera
is needed. The media fixture is built in a temporary copy and is never
published. Diagnostic output accompanies assertions; a failed assertion
exits nonzero. Screenshot files under `shots/` and `/tmp/opencode/` are
local review artifacts.

For the personal homepage, serve the repository root with
`python3 -m http.server 4325 --bind 127.0.0.1`, then from that root run:

```sh
node --test tests/*.test.mjs
node --test tests/archive-browser.mjs
```

`ROOT_TEST_URL` overrides the root browser suite's default
`http://127.0.0.1:4325/`. These checks verify a local build; deployment is a
separate operation.

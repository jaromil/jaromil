# Jaromil — artist website

The homepage is completely black; the works generate the visual variation.
Built with Astro + MDX + vanilla CSS/TypeScript. No UI framework, no CMS,
no trackers. PeerTube is the only intentional third-party media infrastructure.

## Run

```sh
npm install
npm run dev        # develop at http://localhost:4321/art/
npm run build      # static output in dist/
npm run preview    # serve the build locally
npm run check      # type-check
```

The site is configured to be served under `https://jaromil.dyne.org/art/`
(`site` + `base` in `astro.config.mjs`). To deploy at a (sub)domain root,
set `base: '/'` and update `site`, then rebuild. Deployment is copying
`dist/` to the web server — no runtime, no server code.

## Content model

File-based, typed in `src/content.config.ts`. Four collections in
`src/content/`: **practices** (ongoing techniques: Data Portraits,
Hasciicam, Dowse), **works** (may belong to a practice, realize one, or
stand alone), **exhibitions**, **texts**. Bodies are MDX — compose pages
with the provided primitives, not with templates.

Media is a typed union (`src/lib/media.ts`): `image | video | peertube | svg | code`.
Media files live in `src/assets/media/` and are referenced by file name.
Code is first-class visual material (forkbomb's hero *is* the code).

## Add a Practice

Create `src/content/practices/my-practice.mdx`:

```mdx
---
title: My Practice
yearFrom: 2024            # optional; yearTo optional
status: ongoing           # ongoing | archived
statement: One or two sentences — shown on the stage and in indexes.
hero:
  type: image             # image | video | peertube | svg | code
  src: my-image.png       # file in src/assets/media/
  alt: Describe the image for screen readers.
currentRealization: my-work   # optional slug of a work
---

MDX body — concept, process, evolution. Use <Statement>, <Essay>,
<FullBleed>, <Media>, <Caption>, <Meta> freely.
```

Works whose frontmatter says `practice: my-practice` appear automatically
in the practice page's Works list. To put the practice on the homepage
stage, add its slug to `sequence` in `src/pages/index.astro`.

## Add a Work

Create `src/content/works/my-work.mdx`:

```mdx
---
title: My Work
year: 2025                # optional; yearTo optional
practice: my-practice     # optional — omit for standalone works
location: Lugano          # optional
statement: Short conceptual statement.   # optional
hero:
  type: image
  src: my-work.png
  alt: Describe the image.
relatedWorks: [other-work]        # optional slugs
exhibitions: [my-exhibition]      # optional slugs
---

MDX body.
```

Associating a work with a practice is the single `practice:` line — the
practice page lists it, and the work page shows the practice as context
above the title. Nothing else to edit.

## Add PeerTube media

Anywhere a Media is accepted (hero, or `<Media media={{ ... }} />` in MDX):

```yaml
type: peertube
host: video.example.org     # instance hostname
uuid: 9c9de5e8-....         # video UUID
title: Title of the video
poster: my-poster.png       # optional, from src/assets/media/
aspect: 16 / 9
autoplay: false             # autoplay only ever plays muted
muted: true
loop: false
controls: true
```

The page ships only a poster + a link; the iframe is created on activation
(or in-view for muted autoplay). One video plays at a time; `save-data`
and reduced-motion are respected. Self-hosted video uses `type: video`
with `sources: [{ src: clip.webm, type: video/webm }]` and plays through a
plain `<video>` element.

## Add an Exhibition

Create `src/content/exhibitions/my-exhibition.mdx`:

```mdx
---
title: My Exhibition
curator: Name             # optional
showings:
  - year: 2025
    venue: Gallery
    city: City
works: [my-work]          # slugs
---

MDX body — brief text, documentation via <Media>.
```

## Conventions

- Missing content is marked with `<p class="todo">…</p>` and YAML
  `# TODO:` comments — never invent facts, dates, or interpretations.
- Source texts in Italian stay in Italian inside `<div lang="it">`.
- Homepage stage order is the explicit `sequence` list in
  `src/pages/index.astro`.
- Interface stays monochrome (`--black/--white/--grey` in
  `src/styles/global.css`); colour comes only from the works.

## Smoke tests (development)

Playwright scripts (not part of the build): `stage-test.mjs` (stage
behaviour), `pages-test.mjs` (routes + relationships), `vt-test.mjs`
(view transitions + reduced motion), `a11y-test.mjs` (landmarks, h1, alt,
tab order). Run `npm run build && npm run preview`, then
`node <script>.mjs`.

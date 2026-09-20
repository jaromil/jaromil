# Jaromil — artist website

Black-stage Astro site. The works generate the visual variation; the
interface stays monochrome. Stack: Astro + MDX + vanilla CSS/TS. Nothing else.

```sh
npm install
npm run dev       # http://localhost:4321/art/
npm run build     # static output in dist/
npm run preview   # serve the build
npm run check     # type-check
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
| Change the homepage stage order | `sequence` list in `src/pages/index.astro` |
| Change colors / type | tokens in `src/styles/global.css` |

## Add a work

Create `src/content/works/my-work.mdx`:

```mdx
---
title: My Work
year: 2025
practice: dowse            # optional — links the work to a practice
hero:
  type: image              # image | video | peertube | svg | code
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

## Conventions

- Italian source prose stays in Italian inside `<div lang="it">`.
- Interface stays monochrome (`--black/--white/--grey`); colour comes
  only from artworks. No cards, grids, shadows, badges, hamburger menus.
- Smoke tests (dev only): `node stage-test.mjs`, `a11y-test.mjs`,
  `vt-test.mjs`, `pages-test.mjs` against `npm run preview`.

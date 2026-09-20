---
name: Jaromil — Artist Website
description: One black stage; the works generate the visual variation.
colors:
  stage-black: "#080808"
  warm-white: "#f1f1ed"
  whisper-grey: "#8d8d88"
typography:
  display:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "clamp(1.8rem, 1.4rem + 2vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace"
    fontSize: "clamp(0.78rem, 0.75rem + 0.15vw, 0.875rem)"
    fontWeight: 400
    letterSpacing: "0.14em"
rounded:
  none: "0"
spacing:
  edge: "clamp(1.25rem, 4vw, 4rem)"
  block: "2.5rem"
  section: "5rem"
components:
  step-arrow:
    backgroundColor: "{colors.stage-black}"
    textColor: "{colors.whisper-grey}"
    padding: "10px 12px"
  step-arrow-hover:
    backgroundColor: "{colors.stage-black}"
    textColor: "{colors.warm-white}"
  index-row:
    textColor: "{colors.warm-white}"
    padding: "14px 0"
---

# Design System: Jaromil — Artist Website

## Overview

**Creative North Star: "The Black Stage"**

The homepage is completely black, and the works generate the visual
variation. The site is not a portfolio but an exhibition space made from
black, typography, moving image, images, diagrams, code, generated visual
material, substantial conceptual writing, and empty space. The interface
stays structurally constant while the artistic media change radically —
a framed print, a live network visualization, an ASCII video, thirteen
characters of shell code each occupy the same void in turn.

The sophistication is meant to be invisible: no framework aesthetic, no
decoration, no chrome that exists because websites normally have it.
Practices and works are two views over one corpus, connected by quiet
typographic references rather than navigation furniture. The black space
is not unused space; it is part of the work.

**Key Characteristics:**
- Monochrome interface; colour appears only when a work introduces it
- Typography and spatial composition carry the entire visual identity
- One thing at a time: one work on the stage, one column on the page
- Real URLs and real text; effects never sacrifice addressability or access
- Honest placeholders `[ … ]` instead of invented content

## Colors

The palette is three neutrals and nothing else — a void, a light, and a
whisper.

### Neutral
- **Stage Black** (#080808): the default environment. Every surface, the
  stage, the overlay. Not a theme choice — the exhibition space itself.
- **Warm White** (#f1f1ed): foreground. Titles, body text, the works'
  names, focus rings. Paper-warm, never clinical.
- **Whisper Grey** (#8d8d88): secondary information only — metadata,
  counters, chrome at rest, captions, placeholders. ~5.9:1 on Stage
  Black, always legible, never loud.

### Named Rules

**The Artwork-Only Color Rule.** The interface is monochrome. Colour
enters a screen only because an artwork carries it (the green phosphor of
Hasciicam, the luminous Dowse graph). Never tint the UI, never
desaturate a work to match the UI.

**The Grey-Rests-White-Acts Rule.** Chrome rests in Whisper Grey and
brightens to Warm White on hover; content links rest in Warm White and
reveal an underline on hover. Two rules cover every interactive element
on the site.

## Typography

**Display / Body Font:** system-ui stack (no webfont; zero loading cost)
**Label / Mono Font:** ui-monospace stack — reserved for code, data, and
measurement, never as a "technical" costume

**Character:** anonymous sans for reading, terminal mono for anything the
machine would print. The pairing is the artist's lineage: the interface
speaks like a pager, not like a gallery brochure.

### Hierarchy
- **Display** (500, clamp 1.8–3rem, line-height 1.08): page titles —
  work and practice names.
- **Stage Label** (step-1, uppercase, tracking 0.06em): the current
  work's name under the visual.
- **Statement** (step-1, measure 34ch): short conceptual statements
  surrounded by substantial negative space.
- **Body** (400, clamp 1–1.125rem, line-height 1.5; 1.7 in long-form):
  prose at a restrained measure (62ch), paragraph rhythm 1.15em —
  including inside language wrappers.
- **Label** (mono, step--1, tracking 0.14em, uppercase, Whisper Grey):
  context lines (DOWSE / TITLE), counters, metadata, button chrome.
- **Code Display** (mono, clamp 1.4–4.5rem): code as artwork — forkbomb's
  hero is the code itself.

### Named Rules

**The Typography-Is-Identity Rule.** No decoration may substitute for
typographic composition. If a screen feels empty, the answer is scale,
space, or placement — never an added element.

## Layout

Two spatial models, no grid furniture.

- **The Stage:** full viewport (100dvh), one state visible at a time,
  visual centered, label and counter-as-control (`← 01 / 04 →`) below.
  Desktop exploits horizontal space and keyboard; mobile moves label and
  counter into a persistent bottom bar (`← 02 / 04 → · DOWSE · ↑ INDEX`)
  and exploits vertical swipe. Mobile is composed, not shrunk.
- **The Page:** one centered column (max 76rem, edge padding
  clamp(1.25rem, 4vw, 4rem)). Blocks separate by 2.5rem, sections by
  5rem. Full-bleed media escapes the column to 100vw. Long-form text
  holds a 62ch measure inside the column.

Breakpoints: one, at 768px. Everything fluid either side of it
(clamp-based type and spacing; dvh/svh viewport units; logical
properties).

## Elevation & Depth

Flat, absolutely. No shadows, no gradients, no blur, no layering. Depth
is conveyed by tone alone: Warm White forward, Whisper Grey back, Stage
Black underneath. The single border vocabulary is the 1px hairline —
focus rings, index-row rules, the artwork's hover outline.

### Named Rules

**The Flat Void Rule.** Any shadow, glow, or gradient on interface
elements is a defect. The void has no light source.

## Shapes

Rectilinear and unadorned. Corner radius is 0 everywhere. Lines are 1px
hairlines in Whisper Grey at low alpha (index rows) or Warm White (focus
and hover outlines). Figures are unframed; the works meet the black
directly.

## Components

### Chrome (wordmark · INDEX · close · step arrows)
- **Character:** pager chrome — mono label, grey at rest, white on hover.
- **Shape:** square (0 radius), transparent background, generous padding
  (≥44px touch target on mobile).
- **Focus:** 1px Warm White outline, 4px offset, always visible.

### The Stage (signature)
- **Character:** one black viewport; the interface stays constant while
  the media change.
- **States:** opacity/visibility crossfade (480ms, exponential ease-out);
  inactive states are `inert`. Counter is the control: mono
  `← 01 / 04 →`, arrows step, position announces via aria-live with the
  work's title. A one-time gesture hint ("scroll · swipe · arrows")
  fades on first interaction and never returns.
- **Transitions:** the active state alone carries view-transition names,
  so the stage visual/title morphs into the work page.

### Index Overlay
- **Character:** the sitemap as a black room — full-screen dialog,
  typographic link columns (Practices / Works / Site), mono section
  labels. Opens from INDEX (desktop) or ↑ INDEX (mobile bar); Esc closes;
  focus is trapped (everything behind is inert) and restored.

### Index Lists
- **Character:** directory listings — hairline-ruled rows, title in
  step-1, mono grey aside (year, practice, status) right-aligned. No
  thumbnails, no cards.

### Media
- **Poster-first:** PeerTube and video ship as poster surfaces; the
  player/iframe exists only after visitor intent (or in-view, muted).
  One video plays at a time.
- **Code as media:** a work whose code is the visual material renders as
  large selectable mono on black — never replaced by a photograph.

### Statement & Essay
- **Statement:** short text (34ch) in a large size, isolated by clamp
  (4rem, 14vh, 10rem) of vertical space.
- **Essay:** long-form at 62ch, leading 1.7, rhythm 1.15em; blockquotes
  carry a 1px grey inline-start rule.

## Do's and Don'ts

### Do:
- **Do** keep the interface to the three neutrals and let artworks supply
  colour.
- **Do** give every work and practice a real, shareable URL.
- **Do** use mono for code, data, imprints, counters, and measurement.
- **Do** mark missing content with bracketed placeholders (`[ … ]`) in
  mono grey — honest gaps over invented prose.
- **Do** keep media lazy: poster first, muted autoplay only, one video at
  a time, reduced-motion and save-data respected.
- **Do** compose mobile intentionally (bottom bar, swipe, viewport media).

### Don't:
- **Don't** add cards, thumbnail grids, masonry, shadows, gradients,
  rounded rectangles, badges, or dashboard aesthetics.
- **Don't** add hamburger menus, oversized navigation bars, or marketing
  typography.
- **Don't** add decorative animation or gratuitous scroll effects;
  motion is the crossfade, the view-transition morph, and the works
  themselves.
- **Don't** desaturate or frame artworks to match the interface.
- **Don't** load trackers, analytics, webfonts, or third-party content
  beyond intentional PeerTube media.
- **Don't** fill missing artistic content with generic placeholder prose.

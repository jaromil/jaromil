# Artwork documentation checklist

Facts and quotations come from supplied material. A filename, an image imprint
or a portfolio's coverage dates do not establish an artwork's date. Keep YAML
`# TODO:` comments and visible `p.todo` notices until the corresponding input
is supplied. Italian source prose stays in `div[lang="it"]`.

## Source review

Reviewed the existing MDX gaps and the personal homepage's Artworks section;
searched the local journal HTML and its 95 PDFs. `journal/forkbomb.html` contains English,
Italian and German versions of *La bohème digitale*; `journal/forkbomb_art.html`
links that text and records its presentation with forkbomb in 2002. The homepage
identifies `img/dataportraits_palermo.jpg` as a photograph of the Palermo Data
Portraits exhibition, without identifying its photographer or date. These local
sources support archive links, not a new essay or a date for that photograph.

The MDX refers to a supplied 2023–26 portfolio, but that original document is
not present in this checkout. Its statements below are retained as existing
editorial context, not independently reverified quotations. Recheck the original
portfolio before turning any of these gaps into facts.

## Open inputs

Paths below are relative to `src/content/`. Each row covers an existing TODO;
two rows share the Data Portraits practice file.

| Record / marker | Available evidence and disposition | Exact input needed from artist/editor |
|---|---|---|
| `practices/data-portraits.mdx` — YAML yearFrom | Remove the inferred 2024 start year. The existing Palermo exhibition record establishes a presentation in 2021; neither it nor an imprint establishes the practice's start date. Keep the YAML TODO. | Artist-confirmed start year or a dated primary account establishing the start. |
| `practices/data-portraits.mdx` — `p.todo` | Retain the notice that the practice text is being written. The existing statement and three work relations remain available. | Artist-approved practice text and the original portfolio page marked to be written. |
| `works/dp-amsterdam.mdx` — `p.todo` | Retain the work-text gap. Preserve the three supplied image captions, source filenames and SHA-1 strings as imprints, without deriving a date. | Artist-approved work text and confirmation of the grouping's date, venue and captions against the original portfolio. |
| `works/dp-palermo.mdx` — `p.todo` | Link the existing homepage photograph. Retain the gap for work-specific primary documentation; the photograph is not evidence that the placeholder hero depicts this realization. Preserve the existing 2021 exhibition relation. | Identified images of this realization, captions/photographer credits and confirmation of which works were shown. |
| `works/dp-lugano.mdx` — `p.todo` | Retain the notice and explicitly labelled placeholder; no Lugano-specific source recovered locally. | Artist-approved work description, date, venue, actual media and captions/credits. |
| `works/ascii-portraits.mdx` — `p.todo` | Retain the forthcoming notice and placeholder SVG; no completed series documentation recovered locally. | Artist-approved series text, individual works, media, dates and captions/credits. |
| `works/hasciicam.mdx` — `p.todo` | The local artist archive supports the existing software account and stills, but supplies no verified video asset or PeerTube identifier. Keep the video notice. | Video file or verified watch/embed URL, title, date, credits and poster. |
| `works/making-visible-the-invisible.mdx` — `p.todo` | Retain the documentation gap and existing Dowsing relation. The shared graph demonstrates the software; it does not establish installation-specific facts. | Work-specific documentation, date/location, installation media and captions/credits. |
| `works/todos-los-que-traes-contigo.mdx` — YAML year | Retain the unknown year; a portfolio coverage range is not a work date. Preserve the Italian text unchanged. | Artist-confirmed creation/presentation year with a primary source. |
| `practices/dowsing.mdx` — `p.todo` | Retain the full-practice-text gap. Preserve the existing Italian prose and paused practice/work deduplication. | Artist-approved full practice text; no inferred completion from work prose. |
| `texts/la-boheme-digitale.mdx` — `p.todo` | Link the complete archived English and Italian text. Keep draft status and a notice for the in-site edition, replacing the inaccurate claim that source material is absent. | Editor-approved in-site edition/transcription, attribution and language treatment; no duplicate essay added here. |
| `exhibitions/codedoc-ii.mdx` — `p.todo` | Retain the unresolved individual title. `journal/who.pdf` and the existing exhibition account support participation, not an individual work-title relation. | Commission checklist or artist/curator confirmation naming the contributed artwork. |
| `exhibitions/joburg-art-fair-2009.mdx` — `p.todo` | Retain the unresolved individual artwork/project linkage; do not add a work relation based on fair participation. | Fair/project checklist naming Jaromil's artwork and confirming the exact project-title linkage. |

The Palermo exhibition body also retains unresolved dates, rooms, organizers and
local titles for earlier OBA/Amsterdam and MACRO/Rome presentations. Those require
dated programmes or artist/organizer confirmation before adding exhibition records.
No collection counts change in this reconciliation.

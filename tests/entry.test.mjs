import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");

// Inspect delivered HTML, including Astro's built pages, without requiring JS.
function links(markup) {
  return [...markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)].map(
    ([, attributes, content]) => ({
      href: attributes.match(/\bhref=["']([^"']+)["']/i)?.[1],
      text: content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(),
    }),
  );
}

function assertArtistEntry(markup, location) {
  assert.ok(
    links(markup).some(
      ({ href, text }) => href === "/art/" && /visit the artist website/i.test(text),
    ),
    `Missing descriptive /art/ entry ${location}`,
  );
}

test("section navigation and historical artwork destinations remain available", () => {
  const navigation = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/i)?.[0];
  assert.ok(navigation, "Missing section navigation");
  for (const id of ["pubs", "code", "video", "articles", "art"]) {
    assert.ok(links(navigation).some(({ href }) => href === `#${id}`));
    assert.equal([...html.matchAll(new RegExp(`\\bid=["']${id}["']`, "g"))].length, 1);
  }
  for (const href of [
    "https://zkm.de/media/file/de/forkbomb_boheme_digitale.pdf",
    "https://www.e-flux.com/announcements/339153/always-the-property-drama/",
    "https://binart.eu/hasciicam/",
    "https://rastasoft.org",
  ]) {
    assert.ok(links(html).some((link) => link.href === href), `Lost archive link: ${href}`);
  }
});

test("the introduction offers a descriptive artist-site entry", () => {
  const header = html.match(/<header\b[^>]*>[\s\S]*?<\/header>/i)?.[0];
  assert.ok(header, "Missing personal introduction");
  assertArtistEntry(header, "in the introduction");
});

test("the historical art section also offers the artist-site entry", () => {
  const art = html.match(/<h2\b[^>]*\bid=["']art["'][^>]*>[\s\S]*?<\/section>/i)?.[0];
  assert.ok(art, "Missing historical art section");
  assertArtistEntry(art, "in the historical art section");
});

test("the built artist entrance retains its /art/ deployment base", async () => {
  const entrance = await readFile(new URL("art/dist/index.html", root), "utf8");
  assert.match(entrance, /<html\b[^>]*\bdata-base=["']\/art\/["']/i);
});

for (const [locale, route] of [["en", "bio/"], ["it", "it/bio/"]]) {
  test(`${locale} artist biography links back to the personal homepage`, async () => {
    const bio = await readFile(new URL(`art/dist/${route}index.html`, root), "utf8");
    assert.match(bio, new RegExp(`<html\\b[^>]*\\blang=["']${locale}["']`, "i"));
    const main = bio.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0];
    assert.ok(main, `Missing ${locale} biography main content`);
    assert.ok(
      links(main).some(
        ({ href, text }) =>
          ["/", "https://jaromil.dyne.org/"].includes(href) &&
          /personal website|sito personale/i.test(text),
      ),
      `Missing descriptive personal-homepage link in ${locale} biography`,
    );
  });
}

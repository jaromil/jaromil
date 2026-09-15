import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");

function attribute(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
  return match?.[1];
}

function meta(selector, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const tag = tags.find((candidate) => attribute(candidate, selector) === value);
  assert.ok(tag, `Missing meta tag ${selector}="${value}"`);
  return attribute(tag, "content");
}

function link(rel, href) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  assert.ok(
    tags.some(
      (candidate) =>
        attribute(candidate, "rel") === rel && attribute(candidate, "href") === href,
    ),
    `Missing link rel="${rel}" href="${href}"`,
  );
}

function jpegDimensions(buffer) {
  let offset = 2;
  assert.equal(buffer.readUInt16BE(0), 0xffd8, "Social card is not a JPEG");

  while (offset < buffer.length) {
    assert.equal(buffer[offset], 0xff, "Invalid JPEG marker");
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;

    const length = buffer.readUInt16BE(offset);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += length;
  }

  throw new Error("JPEG dimensions were not found");
}

test("page exposes complete canonical, social, and browser metadata", () => {
  assert.match(html, /<html\s+lang="en">/i);
  link("canonical", "https://jaromil.dyne.org/");
  link("apple-touch-icon", "/apple-touch-icon.png");
  link("manifest", "/site.webmanifest");

  const description = meta("name", "description");
  assert.ok(description.length >= 110 && description.length <= 160);
  assert.equal(meta("name", "theme-color"), "#111111");

  assert.equal(meta("property", "og:type"), "profile");
  assert.equal(meta("property", "og:site_name"), "Jaromil");
  assert.equal(meta("property", "og:locale"), "en_US");
  assert.equal(meta("property", "og:image:width"), "1200");
  assert.equal(meta("property", "og:image:height"), "630");
  assert.ok(meta("property", "og:image:alt"));

  assert.equal(meta("name", "twitter:card"), "summary_large_image");
  assert.ok(meta("name", "twitter:image:alt"));
});

test("structured data and web app manifest contain valid JSON", async () => {
  const jsonLd = html.match(
    /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i,
  );
  assert.ok(jsonLd, "Missing JSON-LD script");
  const profile = JSON.parse(jsonLd[1]);
  assert.equal(profile["@type"], "ProfilePage");
  assert.equal(profile.mainEntity["@type"], "Person");

  const manifest = JSON.parse(
    await readFile(new URL("site.webmanifest", root), "utf8"),
  );
  assert.equal(manifest.name, "Denis 'Jaromil' Roio");
  assert.deepEqual(
    manifest.icons.map(({ sizes }) => sizes),
    ["192x192", "512x512"],
  );
});

test("declared Open Graph dimensions match the social card", async () => {
  const image = await readFile(new URL("img/jaromil-social-card.jpg", root));
  assert.deepEqual(jpegDimensions(image), { width: 1200, height: 630 });
});

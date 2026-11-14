import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const html = (await readFile(new URL('../index.html', import.meta.url), 'utf8'))
  .replace(/<!--[\s\S]*?-->/g, '');
const sha = value => createHash('sha256').update(value).digest('hex');

// Recorded from 438a12a before L4 edits. Preserve item order, text and every
// destination while allowing markup and image-loading improvements.
for (const [id, count, digest] of [
  ['pubs', 21, 'd52bf8ff77f3e9f72f6966ced1d740e8110693b9000e15d70e834f3889cec419'],
  ['video', 26, '2e8a31fe3548ad5caee8de386b0913a264bb4cf7879a74f8b580eb9808c1f4ce'],
  ['articles', 29, '967f22e2b863192a3e16f885850f6fdc6f1fe5086f9b6411b1478543aca14534'],
]) {
  test(`${id}: every archive item, known label and link survives in order`, () => {
    const section = html.match(new RegExp(`<section aria-labelledby="${id}">([\\s\\S]*?)<\\/section>`))?.[1];
    assert.ok(section, `Missing archive ${id}`);
    const items = [...section.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, item]) => ({
      text: item.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      links: [...item.matchAll(/href="([^"]+)"/g)].map(match => match[1]),
    }));
    assert.equal(items.length, count);
    assert.equal(sha(JSON.stringify(items)), digest);
  });
}

test('historical fragments remain unique and every local fragment resolves', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate fragment target');
  for (const id of ['about','contact','background','main','pubs','papers','grants','code','video','articles','art']) {
    assert.ok(ids.includes(id), `Lost fragment #${id}`);
  }
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(id), `Broken local fragment #${id}`);
  }
});

test('full talk and writing archives retain native disclosure and all entries', () => {
  const archives = [...html.matchAll(/<details class="archive">([\s\S]*?)<\/details>/g)];
  assert.equal(archives.length, 2);
  for (const [index, [, archive]] of archives.entries()) {
    assert.match(archive, /<summary>Browse the full .* archive<\/summary>/);
    assert.match(archive, /<ul class="archive-list">/);
    assert.equal([...archive.matchAll(/<li\b/g)].length, index === 0 ? 22 : 25);
  }
});

test('newsletter has a descriptive direct signup link outside the script embed', () => {
  const utilities = html.match(/<section\b[^>]*aria-labelledby="contact"[\s\S]*?<\/section>/)?.[0];
  assert.ok(utilities);
  const fallback = utilities.match(/<p class="newsletter-fallback">([\s\S]*?)<\/p>/)?.[1];
  assert.ok(fallback, 'Missing always-visible newsletter fallback');
  assert.match(fallback, /<a href="https:\/\/news\.dyne\.org\/signup-to-rewild-the-internet\/">Sign up on news\.dyne\.org<\/a>/);
  assert.doesNotMatch(fallback, /<script|<noscript|\bhidden\b/);
  assert.ok(utilities.indexOf(fallback) > utilities.indexOf('</script>'));
});

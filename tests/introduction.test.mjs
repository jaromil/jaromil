import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const header = html.match(/<header\b[^>]*>[\s\S]*?<\/header>/)[0];
const text = header.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
const sha = value => createHash('sha256').update(value).digest('hex');

// Recorded from the L1.1 candidate, before rearranging the introduction.
test('all existing archive content and metadata survive media loading attributes', () => {
  assert.equal(sha(html.match(/<head>[\s\S]*?<\/head>/)[0]), '4efe6b372a5aee96aa5f698cde1c8fce2a56df201724f350886df8426397dcd0');
  const archive = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1]
    .replace(/<img\b[^>]*>/g, tag => tag.replace(/\s+(?:width|height|loading|decoding)="[^"]*"/g, ''));
  assert.equal(sha(archive), '50c58dd337a13a706cd4d16966abe7671c23de3c3dce30e44733ecaffd24558f');
});

test('every existing link destination survives the introduction edit', () => {
  const destinations = [...new Set([...html.matchAll(/\bhref=["']([^"']+)/g)].map(match => match[1]))]
    // L4 adds one direct signup route; all original destinations remain frozen.
    .filter(href => !['#main', 'https://news.dyne.org/signup-to-rewild-the-internet/'].includes(href)).sort();
  assert.equal(sha(destinations.join('\n')), '4528dd9c42404e830224dacf7eee0056a2c43179af136eddfd3d55224da31c86');
  for (const href of ['mailto:j@dyne.org', 'mailto:J@Dyne.org', 'jaromil.pub', 'jaromil-plan-b.pub']) {
    assert.ok(destinations.includes(href), `Missing contact/key destination ${href}`);
  }
});

test('public signing fingerprints retain their exact bytes', () => {
  assert.deepEqual(html.match(/[A-F0-9]{4}(?:\s+[A-F0-9]{4}){9}/g), [
    '6113 D89C A825 C5CE DD02 C872 73B3 5DA5\n        4ACB 7D10',
    '5EAD D53F 2CD1 F0B7 AEEE 920D 25FC 5C29\n        CD52 8E32',
  ]);
});

test('identity and background claims remain available after the main choices', () => {
  for (const claim of [
    'Denis Roio, known as Jaromil', 'scientific director of the Plan ₿ Foundation in Lugano',
    'founder of Dyne.org think & do tank', 'digital innovation, free software, and art',
    'algorethics, digital autonomy, and the social impact of cryptography',
    'old-school Ph.D., literally in philosophy', 'coined the term "Algorithmic Sovereignty"',
    'ethics and society, media theory, and hard sciences', 'Since 1999',
    'started and facilitated', 'cultural initiatives, and research collaborations',
    'European Commission',
  ]) assert.ok(text.includes(claim), `Lost identity/background claim: ${claim}`);
  assert.ok(header.indexOf('<nav') < header.indexOf('id="background"'));
  assert.ok(header.indexOf('<nav') < header.indexOf('aria-labelledby="contact"'));
});

test('contact, profiles, newsletter and keys are grouped without hiding email', () => {
  const utilities = header.match(/<section\b[^>]*aria-labelledby="contact"[\s\S]*?<\/section>/)?.[0];
  assert.ok(utilities);
  for (const target of ['mailto:j@dyne.org', 'https://news.dyne.org/author/jaromil/', 'https://www.linkedin.com/in/jaromil', 'jaromil.pub', 'jaromil-plan-b.pub', 'data-site="https://news.dyne.org/"']) {
    assert.ok(utilities.includes(target), `Utility missing: ${target}`);
  }
  assert.doesNotMatch(utilities, /<details\b|\bhidden\b/);
});

test('the first body control skips to a focusable main landmark without JavaScript', () => {
  assert.match(html, /<body>\s*<a class="skip-link" href="#main">Skip to main content<\/a>/);
  assert.equal([...html.matchAll(/\bid="main"/g)].length, 1);
  assert.match(html, /<main\b[^>]*\bid="main"[^>]*\btabindex="-1"/);
});

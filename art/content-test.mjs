import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const routeHtml = async (route) =>
  readFile(new URL(`dist/${route}/index.html`, import.meta.url), 'utf8');

const workRoutes = await readdir(new URL('dist/work/', import.meta.url));
const practiceRoutes = await readdir(new URL('dist/practice/', import.meta.url));
const exhibitionRoutes = await readdir(new URL('dist/exhibition/', import.meta.url));

assert.equal(workRoutes.length, 10, 'the complete authored-work selection is built');
assert.equal(practiceRoutes.length, 6, 'the complete practice selection is built');
assert.equal(exhibitionRoutes.length, 18, 'all researched exhibition records are represented');

for (const route of [
  'farah',
  'hasciicam',
  'ascii-mirrors',
  'ascii-portraits',
  'making-visible-the-invisible',
  'dp-amsterdam',
  'dp-palermo',
  'dp-lugano',
]) {
  await routeHtml(`work/${route}`);
}

for (const route of ['ascii-art', 'net-art', 'code-art', 'dowsing', 'time-based-text']) {
  await routeHtml(`practice/${route}`);
}

const asciiArt = await routeHtml('practice/ascii-art');
assert.match(asciiArt, /ASCII art/);
assert.match(asciiArt, /work\/ascii-mirrors/);
assert.match(asciiArt, /work\/ascii-portraits/);
assert.match(asciiArt, /work\/hasciicam/);

const asciiMirrors = await routeHtml('work/ascii-mirrors');
assert.match(asciiMirrors, /practice\/ascii-art/);
assert.match(asciiMirrors, /practice\/net-art/);

const asciiPortraits = await routeHtml('work/ascii-portraits');
assert.match(asciiPortraits, /forthcoming/i);

const netArt = await routeHtml('practice/net-art');
for (const work of ['farah', 'hasciicam', 'ascii-mirrors', 'ascii-portraits']) {
  assert.match(netArt, new RegExp(`work/${work}`));
}

const codeArt = await routeHtml('practice/code-art');
assert.match(codeArt, /work\/forkbomb/);

const forkbomb = await routeHtml('work/forkbomb');
assert.match(forkbomb, /practice\/code-art/);
assert.match(forkbomb, /practice\/ascii-art/);

const dowsing = await routeHtml('practice/dowsing');
assert.match(dowsing, /work\/making-visible-the-invisible/);
assert.match(dowsing, /work\/todos-los-que-traes-contigo/);
assert.match(dowsing, /Todo lo que traes con tigo/);

for (const work of ['making-visible-the-invisible', 'todos-los-que-traes-contigo']) {
  const html = await routeHtml(`work/${work}`);
  assert.match(html, /dowse-dns-graph[^"']*\.webm/);
}

const dataPortraitPractice = await routeHtml('practice/data-portraits');
for (const work of ['dp-amsterdam', 'dp-palermo', 'dp-lugano']) {
  assert.match(dataPortraitPractice, new RegExp(`work/${work}`));
}
const dpLugano = await routeHtml('work/dp-lugano');
assert.match(dpLugano, /D\.P\. Lugano/);
assert.match(dpLugano, /forthcoming/i);

for (const route of [
  'digital-is-not-analog',
  'realplay',
  'speaking-out-loud',
  'data-portraits',
  'etica-estetica-digitale',
]) {
  await routeHtml(`exhibition/${route}`);
}

const farah = await routeHtml('work/farah');
assert.match(farah, /Farah: In Search for Joy/);
assert.match(farah, /exhibition\/realplay/);

const iLoveYou = await routeHtml('exhibition/i-love-you');
assert.match(iLoveYou, /Post &amp; Tele Museum/);
assert.match(iLoveYou, /Copenhagen/);

const dataPortraits = await routeHtml('exhibition/data-portraits');
assert.match(dataPortraits, /work\/dp-palermo/);

console.log(
  `ok: ${workRoutes.length} works, ${practiceRoutes.length} practices, ${exhibitionRoutes.length} exhibitions`,
);

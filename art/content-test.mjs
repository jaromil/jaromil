import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';

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

// Remaining documentation gaps stay visible in both locale outputs.
const unresolved = [
  ['practice/dowsing', 'Testo completo sulla pratica'],
  ['work/dp-amsterdam', "Testo sull[’']opera"],
  ['work/dp-palermo', 'Primary documentation of D.P. Palermo'],
  ['work/dp-lugano', 'Documentation forthcoming'],
  ['work/ascii-portraits', 'Documentation forthcoming'],
  ['work/hasciicam', 'Video documentation'],
  ['work/making-visible-the-invisible', 'Documentation'],
  ['text/la-boheme-digitale', 'In-site edition forthcoming'],
  ['exhibition/codedoc-ii', 'Individual artwork title'],
  ['exhibition/joburg-art-fair-2009', 'Individual artwork and exact project-title linkage'],
];
for (const locale of ['', 'it/']) {
  for (const [route, notice] of unresolved) {
    const html = await routeHtml(`${locale}${route}`);
    assert.match(html, new RegExp(`<p class="todo">[^<]*(?:${notice})[^<]*</p>`), `${locale}${route} retains its unresolved notice`);
  }
  const practice = await routeHtml(`${locale}practice/data-portraits`);
  const language = locale ? 'it' : 'en';
  const essay = practice.match(new RegExp(`<div class="essay" lang="${language}">([\\s\\S]*?)<\\/div>`))?.[1];
  assert.ok(essay, `${language} Data Portraits essay is rendered without JavaScript`);
  assert.equal([...essay.matchAll(/<p>/g)].length, 7, 'all seven supplied paragraphs are present');
  assert.match(essay, /Marcel Golay/);
  assert.match(essay, /Gaetano La Rosa/);
  assert.match(essay, /John Cage/);
  assert.match(essay, language === 'it' ? /Siamo abituati a pensare/ : /We are used to thinking/);
  assert.match(essay, language === 'it' ? /struttura stessa del ritratto/ : /very structure of the portrait/);
  assert.doesNotMatch(practice, new RegExp(`<div class="essay" lang="${language === 'it' ? 'en' : 'it'}">`));
  assert.doesNotMatch(practice, /<p class="todo">|Testo su Data Portraits|to be written/);
  assert.doesNotMatch(practice, /(?:since|dal)\s+2024/i, 'an imprint must not become a practice start year');
  for (const work of ['dp-amsterdam', 'dp-palermo', 'dp-lugano']) {
    assert.match(practice, new RegExp(`href="/art/${locale}work/${work}/"`));
    assert.match(await routeHtml(`${locale}work/${work}`), new RegExp(`href="/art/${locale}practice/data-portraits/"`));
  }
  const palermo = await routeHtml(`${locale}work/dp-palermo`);
  assert.match(palermo, new RegExp(`href="/art/${locale}exhibition/data-portraits/"`));
  assert.match(palermo, /href="\/img\/dataportraits_palermo.jpg"/);
  const text = await routeHtml(`${locale}text/la-boheme-digitale`);
  for (const anchor of ['english', 'italiano']) assert.match(text, new RegExp(`href="/journal/forkbomb.html#${anchor}"`));
  assert.doesNotMatch(text, /awaiting source material/);
  const italian = await routeHtml(`${locale}work/todos-los-que-traes-contigo`);
  assert.match(italian, /<div lang="it">/);

  const lugano = await routeHtml(`${locale}work/dp-lugano`);
  const header = lugano.match(/<article\b[^>]*>\s*<header[^>]*>([\s\S]*?)<\/header>/)?.[1];
  assert.ok(header, 'incomplete work header is rendered');
  assert.doesNotMatch(header, /class="meta"|forthcoming|\b20\d\d\b/, 'absent work facts must not become metadata');
  assert.ok(lugano.indexOf('class="hero"') < lugano.indexOf('<p class="todo">'), 'media precedes the incomplete notice');
  for (const sibling of ['dp-amsterdam', 'dp-palermo']) {
    assert.match(lugano, new RegExp(`href="/art/${locale}work/${sibling}/"`));
  }
  assert.doesNotMatch(lugano, /<span class="aside">\s*<\/span>/, 'unknown related-work years are omitted');
  assert.doesNotMatch(practice, /<span class="aside">\s*<\/span>/, 'unknown realization years are omitted');
  assert.match(text, new RegExp(`href="/art/${locale}work/forkbomb/"`), 'the verified text/work relation follows the page locale');
  const hasciicam = await routeHtml(`${locale}work/hasciicam`);
  assert.ok(hasciicam.indexOf('>Artist archive</a>') < hasciicam.indexOf('<p class="todo">'), 'available context and archive precede the video gap');
  const complete = await routeHtml(`${locale}work/farah`);
  assert.doesNotMatch(complete, /<p class="todo">/, 'complete records do not acquire forthcoming notices');
  assert.match(complete, /<p class="meta"[^>]*>2002<\/p>/, 'verified dates remain visible');
}

// Archive links are backed by actual local media, text and fragment targets.
await readFile(new URL('../img/dataportraits_palermo.jpg', import.meta.url));
const archive = await readFile(new URL('../journal/forkbomb.html', import.meta.url), 'utf8');
for (const anchor of ['english', 'italiano']) assert.match(archive, new RegExp(`id="${anchor}"`));
for (const [path, marker] of [
  ['practices/data-portraits', '# TODO: confirm yearFrom'],
  ['works/todos-los-que-traes-contigo', '# TODO: year not stated'],
]) {
  assert.ok((await readFile(new URL(`src/content/${path}.mdx`, import.meta.url), 'utf8')).includes(marker));
}

// Every rendered collection relation must lead to a built record, including IT.
let checkedRelationLinks = 0;
for (const locale of ['', 'it/']) {
  for (const collection of ['work', 'practice', 'exhibition', 'text']) {
    for (const slug of await readdir(new URL(`dist/${locale}${collection}/`, import.meta.url))) {
      const html = await routeHtml(`${locale}${collection}/${slug}`);
      for (const [, target] of html.matchAll(/href="\/art\/((?:it\/)?(?:work|practice|exhibition|text)\/[^"#?]+\/)(?:#[^"]*)?"/g)) {
        await access(new URL(`dist/${target}index.html`, import.meta.url));
        checkedRelationLinks++;
      }
    }
  }
}
assert.ok(checkedRelationLinks > 0, 'relation validation must exercise links');

console.log(
  `ok: ${workRoutes.length} works, ${practiceRoutes.length} practices, ${exhibitionRoutes.length} exhibitions; ${unresolved.length * 2} unresolved-notice cases; ${checkedRelationLinks} valid relation links`,
);

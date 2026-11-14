import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';

const dist = new URL('../art/dist/', import.meta.url);
const pages = (await readdir(dist, { recursive: true })).filter(path => path.endsWith('.html'));

test('every delivered artist route has its own canonical and valid EN/IT alternates', async () => {
  assert.ok(pages.length >= 80, 'Exercise the complete artist build');
  let alternates = 0;
  for (const path of pages) {
    const html = await readFile(new URL(path, dist), 'utf8');
    const route = `/art/${path.replace(/index\.html$/, '')}`;
    const links = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => Object.fromEntries(
      [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]),
    ));
    assert.deepEqual(links.filter(link => link.rel === 'canonical').map(link => link.href), [`https://jaromil.dyne.org${route}`], route);
    const languages = links.filter(link => link.rel === 'alternate' && link.hreflang);
    assert.deepEqual(languages.map(link => link.hreflang).sort(), ['en', 'it', 'x-default'], route);
    for (const link of languages) {
      const url = new URL(link.href);
      assert.equal(url.origin, 'https://jaromil.dyne.org');
      assert.ok(url.pathname.startsWith('/art/') && url.pathname.endsWith('/'));
      await access(new URL(`${url.pathname.slice('/art/'.length)}index.html`, dist));
      alternates++;
    }
  }
  assert.equal(alternates, pages.length * 3);
});

import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { launchBrowser } from '../art/tests/browser.mjs';

// Serve the repository root, e.g. python3 -m http.server 4325. Reuse installed
// Chrome; this runner never downloads a browser or submits the signup form.
const base = process.env.ROOT_TEST_URL ?? 'http://127.0.0.1:4325/';
const browser = await launchBrowser();
after(() => browser.close());

test('lazy root images retain browser-oriented intrinsic dimensions and composition', async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  try {
    await context.route('https://**/*', route => route.abort());
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('details').evaluateAll(es => es.forEach(e => { e.open = true; }));
    const images = page.locator('img[src^="img/"]');
    assert.equal(await images.count(), 14);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      const size = await image.evaluate(async e => {
        await e.decode();
        const r = e.getBoundingClientRect();
        return { src:e.getAttribute('src'), width:Number(e.getAttribute('width')), height:Number(e.getAttribute('height')), naturalWidth:e.naturalWidth, naturalHeight:e.naturalHeight, ratio:r.width/r.height };
      });
      assert.equal(size.width, size.naturalWidth, size.src);
      assert.equal(size.height, size.naturalHeight, size.src);
      assert.ok(Math.abs(size.ratio - size.naturalWidth / size.naturalHeight) < 0.001, size.src);
    }
  } finally { await context.close(); }
});

for (const javaScriptEnabled of [false, true]) {
  test(`archive keyboard access and signup fallback with ${javaScriptEnabled ? 'third-party scripts blocked' : 'JavaScript disabled'}`, async () => {
    const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 390, height: 844 } });
    let blockedScripts = 0;
    try {
      await context.route('https://**/*', route => {
        if (route.request().resourceType() === 'script') blockedScripts++;
        return route.abort();
      });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      if (javaScriptEnabled) assert.ok(blockedScripts > 0, 'External-script failure was not exercised');
      const archives = page.locator('details.archive');
      assert.equal(await archives.count(), 2);
      for (const [index, archive] of (await archives.all()).entries()) {
        const summary = archive.locator('summary');
        assert.equal(await archive.getAttribute('open'), null);
        await summary.focus();
        await page.keyboard.press('Enter');
        assert.notEqual(await archive.getAttribute('open'), null);
        assert.equal(await archive.locator('li:visible').count(), index === 0 ? 22 : 25);
        await page.keyboard.press('Tab');
        assert.equal(await archive.locator('a').first().evaluate(e => e === document.activeElement), true);
        await summary.focus();
        await page.keyboard.press('Space');
        assert.equal(await archive.getAttribute('open'), null);
      }
      const fallback = page.getByRole('link', { name: 'Sign up on news.dyne.org', exact: true });
      assert.equal(await fallback.count(), 1);
      assert.equal(await fallback.isVisible(), true);
      assert.equal(await fallback.getAttribute('href'), 'https://news.dyne.org/signup-to-rewild-the-internet/');
      await fallback.focus();
      assert.equal(await fallback.evaluate(e => e === document.activeElement), true);
      for (const id of ['pubs', 'code', 'video', 'articles', 'art']) {
        await page.goto(`${base}#${id}`, { waitUntil: 'domcontentloaded' });
        const top = await page.locator(`#${id}`).evaluate(e => e.getBoundingClientRect().top);
        assert.ok(top >= 0 && top < 100, `Fragment #${id} did not reach its heading: ${top}`);
      }
    } finally { await context.close(); }
  });
}

for (const width of [390, 1440, 320]) for (const scale of [100, 200]) for (const colorScheme of ['light', 'dark']) {
  test(`expanded archives reflow at ${width}px, ${scale}% text, ${colorScheme}`, async () => {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 900 : 844 }, colorScheme });
    try {
      await context.route('https://**/*', route => route.abort());
      const page = await context.newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: `html { font-size: ${scale}% !important; }` });
      await page.locator('details').evaluateAll(es => es.forEach(e => { e.open = true; }));
      const layout = await page.evaluate(() => ({
        rootPx: getComputedStyle(document.documentElement).fontSize,
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        items: [...document.querySelectorAll('details')].map(e => e.querySelectorAll('li').length),
      }));
      assert.equal(layout.rootPx, scale === 100 ? '16px' : '32px', 'Expected text scaling, not viewport zoom');
      assert.ok(layout.scrollWidth <= layout.width, `Horizontal overflow: ${JSON.stringify(layout)}`);
      assert.deepEqual(layout.items, [22, 25]);
      for (const last of await page.locator('details li:last-child a').all()) {
        await last.scrollIntoViewIfNeeded();
        const rect = await last.boundingBox();
        assert.ok(rect && rect.x >= 0 && rect.x + rect.width <= width + 1);
        assert.equal(await last.isVisible(), true);
      }
    } finally { await context.close(); }
  });
}

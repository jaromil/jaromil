import assert from 'node:assert/strict';
import { launchBrowser, artBase } from './tests/browser.mjs';

const base = artBase;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('response', (r) => r.status() >= 400 && errors.push(r.status() + ': ' + r.url()));

await page.goto(base, { waitUntil: 'networkidle' });

// Go to forkbomb state (End key) and enter the work via the title link.
await page.keyboard.press('End');
await page.waitForTimeout(600);
await page.click('[data-state]:not([inert]) [data-label]');
await page.waitForTimeout(1200);
console.log('url after enter:', page.url());
const forkbomb = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent,
  code: document.querySelector('.code-work code')?.textContent?.trim(),
  context: document.querySelector('.context')?.textContent?.trim() ?? null,
  exhibitions: [...document.querySelectorAll('.index-list a')].map((a) => a.textContent),
}));
console.log('forkbomb page:', JSON.stringify(forkbomb));
assert.equal(new URL(page.url()).pathname, '/art/work/forkbomb/');
assert.equal(forkbomb.h1, 'forkbomb');
assert.equal(forkbomb.code, ':(){ :|:& };:');

// Back via history — ClientRouter restores the stage.
await page.goBack();
await page.waitForTimeout(1000);
const back = await page.evaluate(() => ({
  url: location.pathname,
  visible: [...document.querySelectorAll('[data-state]')].filter((s) => !s.inert).map((s) => s.dataset.slug),
}));
console.log('after goBack:', JSON.stringify(back));
assert.equal(back.url, '/art/');
assert.equal(back.visible.length, 1);

// Practice page: Dowsing — video hero and works list.
await page.goto(base + 'practice/dowsing/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const dowsing = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent,
  videoPlaying: ![...document.querySelectorAll('video')].every((v) => v.paused),
  works: [...document.querySelectorAll('.index-list a')].map((a) => a.textContent),
  current: document.querySelector('.index-list .aside')?.textContent,
}));
console.log('Dowsing practice:', JSON.stringify(dowsing));
assert.equal(dowsing.h1, 'Dowsing');
assert.equal(dowsing.videoPlaying, true);
assert.ok(dowsing.works.some(title => title.includes('Todo lo que traes con tigo')));

// Work belonging to a practice: context link back to Dowsing.
await page.goto(base + 'work/todos-los-que-traes-contigo/', { waitUntil: 'networkidle' });
const todos = await page.evaluate(() => ({
  context: document.querySelector('.context a')?.textContent,
  contextHref: document.querySelector('.context a')?.getAttribute('href'),
  videos: document.querySelectorAll('video').length,
  related: [...document.querySelectorAll('.related a')].map((a) => a.textContent),
  h2: [...document.querySelectorAll('h2')].map((h) => h.textContent),
}));
console.log('todos work:', JSON.stringify(todos));
assert.equal(todos.contextHref, '/art/practice/dowsing/');
assert.ok(todos.videos > 0);

// Exhibition page.
await page.goto(base + 'exhibition/i-love-you/', { waitUntil: 'networkidle' });
const exh = await page.evaluate(() => ({
  showings: document.querySelectorAll('.index-list li').length,
  workLink: document.querySelector('.index-list a')?.getAttribute('href'),
}));
console.log('exhibition:', JSON.stringify(exh));
assert.ok(exh.showings > 0);
assert.equal(exh.workLink, '/art/work/forkbomb/');

// Incomplete pages retain native reading paths and omit facts not supplied.
let documentationCases = 0;
let relatedLinks = 0;
for (const locale of ['', 'it/']) {
  for (const [route, incomplete] of [
    ['practice/data-portraits/', false],
    ['work/dp-lugano/', true],
    ['text/la-boheme-digitale/', true],
    ['work/farah/', false],
  ]) {
    assert.equal((await page.goto(base + locale + route, { waitUntil: 'networkidle' })).status(), 200);
    const article = page.locator('article');
    assert.equal(await article.locator('h1').count(), 1);
    assert.equal(await article.locator('p.todo').count(), incomplete ? 1 : 0);
    assert.equal(await article.locator('.meta:empty, .aside:empty').count(), 0);
    if (route === 'practice/data-portraits/') {
      const language = locale ? 'it' : 'en';
      assert.equal(await article.locator(`.essay[lang="${language}"]`).count(), 1);
      assert.equal(await article.locator('.essay p').count(), 7);
      assert.match(await article.locator('.essay').innerText(), language === 'it' ? /Siamo abituati a pensare/ : /We are used to thinking/);
      assert.deepEqual((await article.locator('.index-list a').evaluateAll(links => links.map(a => a.getAttribute('href')))).sort(), [
        `/art/${locale}work/dp-amsterdam/`, `/art/${locale}work/dp-lugano/`, `/art/${locale}work/dp-palermo/`,
      ].sort());
    }
    if (route === 'work/dp-lugano/') {
      assert.equal(await article.locator('header .meta').count(), 0);
      assert.equal(await article.locator(`header a[href="/art/${locale}practice/data-portraits/"]`).count(), 1);
      assert.deepEqual((await article.locator('.related a').evaluateAll(links => links.map(a => a.getAttribute('href')))).sort(), [
        `/art/${locale}work/dp-amsterdam/`, `/art/${locale}work/dp-palermo/`,
      ].sort());
    }
    if (route === 'text/la-boheme-digitale/') {
      assert.equal(await article.locator(`a[href="/art/${locale}work/forkbomb/"]`).count(), 1);
      const notice = await article.locator('p.todo').boundingBox();
      for (const anchor of ['english', 'italiano']) {
        const link = article.locator(`a[href="/journal/forkbomb.html#${anchor}"]`);
        assert.equal(await link.count(), 1);
        assert.ok((await link.boundingBox()).y < notice.y, 'available text precedes its in-site edition notice');
      }
    }
    for (const target of await article.locator('a[href^="/art/"]').evaluateAll(links => links.map(a => a.getAttribute('href')))) {
      assert.equal((await page.request.get(new URL(target, base).href)).status(), 200, target);
      relatedLinks++;
    }
    documentationCases++;
  }
  const context = await browser.newContext({ javaScriptEnabled: false, locale: locale ? 'it' : 'en', viewport: { width: 390, height: 844 } });
  await context.route('**/*', route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
  const fallback = await context.newPage();
  await fallback.goto(base + locale + 'work/dp-lugano/');
  const practice = fallback.locator(`article header a[href="/art/${locale}practice/data-portraits/"]`);
  for (let tab = 0; tab < 30 && !(await practice.evaluate(el => el === document.activeElement)); tab++) await fallback.keyboard.press('Tab');
  assert.ok(await practice.evaluate(el => el === document.activeElement), 'practice link remains keyboard reachable without JS or images');
  await fallback.keyboard.press('Enter');
  await fallback.waitForURL(base + locale + 'practice/data-portraits/');
  assert.equal(await fallback.locator(`article a[href="/art/${locale}work/dp-lugano/"]`).count(), 1);
  await context.close();
  documentationCases++;
}
console.log(`documentation assertions: ${documentationCases} cases, ${relatedLinks} related link targets, 0 failed, 0 skipped`);

// Screenshots for visual review.
await page.goto(base, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'shots/home-data-portraits.png' });
await page.keyboard.press('End');
await page.waitForTimeout(700);
await page.screenshot({ path: 'shots/home-forkbomb.png' });
await page.goto(base + 'work/forkbomb/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'shots/work-forkbomb.png', fullPage: true });
await page.goto(base + 'practice/dowsing/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: 'shots/practice-dowsing.png' });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'shots/home-mobile.png' });

console.log('errors:', errors.length ? errors : 'none');
await browser.close();
assert.deepEqual(errors, []);

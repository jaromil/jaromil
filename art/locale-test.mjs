import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = 'http://localhost:4323/art/';
const browser = await chromium.launch({
  executablePath:
    process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});
const errors = [];

// 1. Italian browser: root redirects to /it/
let ctx = await browser.newContext({ locale: 'it-IT' });
let page = await ctx.newPage();
page.on('pageerror', (e) => errors.push('it: ' + e.message));
await page.goto(base, { waitUntil: 'networkidle' });
console.log('IT browser, root →', page.url());
const itHome = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  h1: document.querySelector('h1')?.textContent,
  hint: document.querySelector('[data-hint]')?.textContent,
  skip: document.querySelector('.skip-link')?.textContent,
  switchValue: document.querySelector('[data-lang-switch]')?.value,
  hreflang: [...document.querySelectorAll('link[hreflang]')].map((l) => l.getAttribute('hreflang')),
}));
console.log('IT home:', JSON.stringify(itHome));
assert.equal(page.url(), base + 'it/');
assert.equal(itHome.lang, 'it');
assert.equal(itHome.skip.trim(), 'Salta al contenuto');
assert.equal(itHome.switchValue, 'it');
assert.deepEqual(itHome.hreflang.sort(), ['en', 'it', 'x-default'].sort());

// 2. Manual switch to EN on an IT page: stores + navigates to EN equivalent
await page.goto(base + 'it/work/forkbomb/', { waitUntil: 'networkidle' });
await page.selectOption('[data-lang-switch]', 'en');
await page.waitForTimeout(1000);
console.log('after switch to EN:', page.url(), '| stored:', await page.evaluate(() => localStorage.getItem('lang')));
assert.equal(page.url(), base + 'work/forkbomb/');
assert.equal(await page.evaluate(() => localStorage.getItem('lang')), 'en');

// 3. Stored EN overrides IT browser on root
await page.goto(base, { waitUntil: 'networkidle' });
console.log('stored EN + IT browser, root →', page.url());
assert.equal(page.url(), base);

// 4. Deep link never redirects (stored cleared, IT browser, EN work URL)
await page.evaluate(() => localStorage.clear());
await page.goto(base + 'work/forkbomb/', { waitUntil: 'networkidle' });
console.log('deep link EN + IT browser →', page.url());
assert.equal(page.url(), base + 'work/forkbomb/');
await ctx.close();

// 5. English browser: stays on EN root
ctx = await browser.newContext({ locale: 'en-US' });
page = await ctx.newPage();
page.on('pageerror', (e) => errors.push('en: ' + e.message));
await page.goto(base, { waitUntil: 'networkidle' });
console.log('EN browser, root →', page.url());
assert.equal(page.url(), base);

// 6. Switch to IT from EN work page
await page.goto(base + 'work/todos-los-que-traes-contigo/', { waitUntil: 'networkidle' });
await page.selectOption('[data-lang-switch]', 'it');
await page.waitForTimeout(1000);
const itWork = await page.evaluate(() => ({
  url: location.pathname,
  lang: document.documentElement.lang,
  context: document.querySelector('.context a')?.textContent,
  contextHref: document.querySelector('.context a')?.getAttribute('href'),
  h2: [...document.querySelectorAll('h2.section-label')].map((h) => h.textContent.trim()),
  overlayLinks: [...document.querySelectorAll('#index-overlay a')].slice(0, 3).map((a) => a.getAttribute('href')),
  wordmark: document.querySelector('.wordmark')?.getAttribute('href'),
}));
console.log('after switch to IT:', JSON.stringify(itWork, null, 1));
assert.equal(itWork.lang, 'it');
assert.equal(itWork.url, '/art/it/work/todos-los-que-traes-contigo/');
assert.equal(itWork.wordmark, '/art/it/');
assert.ok(itWork.overlayLinks.every(link => link.startsWith('/art/it/')));

// 7. Stage works on IT home (arrows + live region in Italian)
await page.goto(base + 'it/', { waitUntil: 'networkidle' });
await page.click('.counter [data-next]');
await page.waitForTimeout(600);
const itStage = await page.evaluate(() => ({
  live: document.querySelector('[data-live]')?.textContent,
  bb: document.querySelector('[data-bb-context]')?.textContent,
}));
console.log('IT stage after arrow:', JSON.stringify(itStage));
assert.match(itStage.live, /— 2 di \d+$/);
for (const [prefix, names] of [['', ['Index', 'Site index', 'Language', 'Jaromil — home']], ['it/', ['Indice', 'Indice del sito', 'Lingua', 'Jaromil — pagina iniziale']]]) {
  await page.evaluate(value => localStorage.setItem('lang', value), prefix ? 'it' : 'en');
  await page.goto(base + prefix, { waitUntil: 'networkidle' });
  assert.equal(await page.getByRole('button', { name: prefix ? 'Opera precedente' : 'Previous work', exact: true }).count(), 1);
  assert.equal(await page.getByRole('button', { name: prefix ? 'Opera successiva' : 'Next work', exact: true }).count(), 1);
  assert.equal(await page.getByRole('combobox', { name: names[2], exact: true }).count(), 1);
  assert.equal(await page.getByRole('link', { name: names[3], exact: true }).count(), 1);
  await page.locator('.site-header [data-open-index]').click();
  assert.equal(await page.getByRole('dialog', { name: names[0], exact: true }).count(), 1);
  assert.equal(await page.getByRole('navigation', { name: names[1], exact: true }).count(), 1);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#index-overlay').evaluate(el => el.inert), true);
}
await ctx.close();

console.log('JS errors:', errors.length ? errors : 'none');
// Explicit locale URLs win over browser/stored preference, including /it/ itself.
for (const locale of ['en-US', 'it-IT']) for (const stored of ['en', 'it']) {
  const explicit = await browser.newContext({ locale });
  await explicit.addInitScript(value => localStorage.setItem('lang', value), stored);
  const deep = await explicit.newPage();
  for (const route of ['it/', 'it/work/forkbomb/', 'work/forkbomb/']) {
    await deep.goto(base + route, { waitUntil: 'networkidle' });
    assert.equal(deep.url(), base + route);
    assert.equal(await deep.locator('html').getAttribute('lang'), route.startsWith('it/') ? 'it' : 'en');
  }
  await explicit.close();
}
for (const blocked of ['getItem', 'setItem', 'both']) {
  const storage = await browser.newContext({ locale: 'it-IT' });
  const storageErrors = [];
  await storage.addInitScript(mode => {
    for (const method of mode === 'both' ? ['getItem', 'setItem'] : [mode]) {
      Storage.prototype[method] = () => { throw new DOMException('Blocked for test', 'SecurityError'); };
    }
  }, blocked);
  const blockedPage = await storage.newPage();
  blockedPage.on('pageerror', error => storageErrors.push(error.message));
  await blockedPage.goto(base, { waitUntil: 'networkidle' });
  assert.equal(blockedPage.url(), base + 'it/');
  await blockedPage.selectOption('[data-lang-switch]', 'en');
  await blockedPage.waitForURL(url => url.pathname === '/art/');
  assert.equal(await blockedPage.locator('html').getAttribute('lang'), 'en');
  await blockedPage.keyboard.press('ArrowRight');
  assert.equal(await blockedPage.locator('[data-current]').textContent(), '02');
  await blockedPage.selectOption('[data-lang-switch]', 'it');
  await blockedPage.waitForURL(url => url.pathname === '/art/it/');
  assert.deepEqual(storageErrors, []);
  await storage.close();
}
console.log('locale resilience:12 explicit-link cases and3 blocked-storage switch/step cases passed');
await browser.close();
assert.deepEqual(errors, []);

import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = 'http://localhost:4323/art/';
const routes = [
  '',
  'practices/',
  'works/',
  'exhibitions/',
  'texts/',
  'bio/',
  'practice/data-portraits/',
  'practice/dowsing/',
  'practice/ascii-art/',
  'practice/net-art/',
  'practice/code-art/',
  'practice/time-based-text/',
  'work/dp-amsterdam/',
  'work/dp-palermo/',
  'work/dp-lugano/',
  'work/todos-los-que-traes-contigo/',
  'work/forkbomb/',
  'work/farah/',
  'work/hasciicam/',
  'work/ascii-mirrors/',
  'work/ascii-portraits/',
  'work/making-visible-the-invisible/',
  'exhibition/i-love-you/',
  'exhibition/realplay/',
  'exhibition/data-portraits/',
  'text/la-boheme-digitale/',
  'it/',
  'it/practices/',
  'it/works/',
  'it/exhibitions/',
  'it/texts/',
  'it/bio/',
  'it/practice/dowsing/',
  'it/work/forkbomb/',
  'it/work/todos-los-que-traes-contigo/',
  'it/work/farah/',
  'it/exhibition/i-love-you/',
  'it/text/la-boheme-digitale/',
];

const browser = await chromium.launch({
  executablePath:
    process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});
const page = await browser.newPage();
let failures = 0;

for (const route of routes) {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  const report = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((n) => n.id);
    return {
      title: document.title,
      lang: document.documentElement.lang,
      h1Count: document.querySelectorAll('h1').length,
      mainLandmark: !!document.querySelector('main#main'),
      imgsNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
      dupIds: ids.length - new Set(ids).size,
      skipLink: !!document.querySelector('.skip-link'),
    };
  });
  const problems = [];
  if (report.h1Count !== 1) problems.push(`h1=${report.h1Count}`);
  if (!report.mainLandmark) problems.push('no main landmark');
  if (report.imgsNoAlt > 0) problems.push(`${report.imgsNoAlt} imgs without alt`);
  if (report.dupIds > 0) problems.push(`${report.dupIds} duplicate ids`);
  if (!report.skipLink) problems.push('no skip link');
  if (problems.length) failures++;
  console.log((problems.length ? 'FAIL ' : 'ok   ') + (route || '/'), JSON.stringify(report), problems.join('; '));
}

// Keyboard walk on homepage: skip link -> wordmark -> INFO -> stage links -> prev/next
await page.goto(base, { waitUntil: 'networkidle' });
const tabStops = [];
for (let i = 0; i < 8; i++) {
  await page.keyboard.press('Tab');
  tabStops.push(
    await page.evaluate(() => {
      const el = document.activeElement;
      return el ? `${el.tagName.toLowerCase()}.${el.className?.toString().split(' ')[0] || el.textContent.trim().slice(0, 20)}` : 'none';
    }),
  );
}
console.log('tab order:', JSON.stringify(tabStops));

// Focus visibility: focused element must have a visible outline.
const outline = await page.evaluate(() => {
  const el = document.activeElement;
  if (!el) return null;
  const s = getComputedStyle(el);
  return { outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth };
});
console.log('focus outline:', JSON.stringify(outline));
assert.notEqual(outline?.outlineStyle, 'none');
assert.ok(parseFloat(outline?.outlineWidth) > 0);

for (const prefix of ['', 'it/']) for (const motion of ['no-preference', 'reduce']) {
  await page.emulateMedia({ reducedMotion: motion });
  await page.evaluate(value => localStorage.setItem('lang', value), prefix ? 'it' : 'en');
  await page.goto(base + prefix, { waitUntil: 'networkidle' });
  const overlay = page.locator('#index-overlay');
  assert.equal(await overlay.evaluate(el => el.hidden && el.inert), true);
  const trigger = page.locator('.site-header [data-open-index]');
  await trigger.focus();
  await page.keyboard.press('Enter');
  assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(await overlay.evaluate(el => el.contains(document.activeElement)), true);
  const first = overlay.locator('a').first();
  const last = overlay.locator('[data-close-index]');
  await first.focus();
  await page.keyboard.press('Shift+Tab');
  assert.equal(await last.evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Tab');
  assert.equal(await first.evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Escape');
  assert.equal(await overlay.evaluate(el => el.inert), true);
  assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
  // A second close must not leave an older timer able to hide a reopened Index.
  await page.keyboard.press('Escape');
  await trigger.click({ force: true });
  await page.waitForTimeout(650);
  assert.deepEqual(await overlay.evaluate(el => ({ hidden: el.hidden, inert: el.inert, open: el.classList.contains('open') })), { hidden: false, inert: false, open: true });
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await last.focus();
  assert.equal(await last.evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(650);
  assert.deepEqual(await overlay.evaluate(el => ({ hidden: el.hidden, inert: el.inert, open: el.classList.contains('open') })), { hidden: true, inert: true, open: false });
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.locator('main, .site-header, .bottom-bar, .skip-link').evaluateAll(nodes => nodes.every(el => !el.inert)), true);
  assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Tab');
  assert.equal(await overlay.evaluate(el => el.contains(document.activeElement)), false);
  console.log(`keyboard dialog ${prefix || 'en'} ${motion}: open, wrap, repeated close/rapid reopen, settled cleanup, focus return, closed exclusion`);
}

console.log(failures ? `${failures} route(s) with problems` : 'all routes pass');
await browser.close();
process.exit(failures ? 1 : 0);

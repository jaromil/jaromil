import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = 'http://localhost:4323/art/';
const browser = await chromium.launch({
  executablePath:
    process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));
page.on('response', (r) => r.status() === 404 && errors.push('404: ' + r.url()));

await page.goto(base, { waitUntil: 'networkidle' });

const state = () =>
  page.evaluate(() => ({
    visible: [...document.querySelectorAll('[data-state]')].filter((s) => !s.inert).map((s) => s.dataset.slug),
    counter: document.querySelector('[data-current]')?.textContent,
    vt: [...document.querySelectorAll('[data-visual]')].map((v) => v.style.viewTransitionName || '-'),
    videoPlaying: [...document.querySelectorAll('video')].map((v) => !v.paused),
  }));

console.log('initial:      ', JSON.stringify(await state()));
const initial = await state();
assert.equal(initial.visible.length, 1);
assert.equal(initial.counter, '01');
const slugs = await page.locator('[data-state]').evaluateAll(nodes => nodes.map(node => node.dataset.slug));

await page.keyboard.press('ArrowRight');
await page.waitForTimeout(600);
console.log('ArrowRight:   ', JSON.stringify(await state()));
assert.deepEqual((await state()).visible, [slugs[1]]);
assert.equal((await state()).counter, '02');

await page.keyboard.press('ArrowRight');
await page.waitForTimeout(600);
console.log('ArrowRight x2:', JSON.stringify(await state()));
assert.deepEqual((await state()).visible, [slugs[2]]);

await page.mouse.move(720, 450);
await page.mouse.wheel(0, 300);
await page.waitForTimeout(900);
console.log('wheel down:   ', JSON.stringify(await state()));
assert.deepEqual((await state()).visible, [slugs[3]]);

await page.keyboard.press('Home');
await page.waitForTimeout(600);
console.log('Home:         ', JSON.stringify(await state()));
assert.deepEqual((await state()).visible, [slugs[0]]);
await page.keyboard.press('End');
assert.deepEqual((await state()).visible, [slugs.at(-1)]);
await page.keyboard.press('ArrowLeft');
assert.deepEqual((await state()).visible, [slugs.at(-2)]);
await page.keyboard.press('Home');

// Index overlay: open, Esc, focus return
await page.click('.site-header .info');
await page.waitForTimeout(600);
const overlayOpen = await page.evaluate(() => !document.getElementById('index-overlay').hidden);
const desktopGroups = await page.evaluate(() => ({
  firstSection: document.querySelector('.panel > section')?.className,
  layout: getComputedStyle(document.querySelector('[data-practice-group]')).display,
  order: [...document.querySelectorAll('[data-practice-group]')].map((group) => group.dataset.practiceGroup),
  groups: Object.fromEntries(
    [...document.querySelectorAll('[data-practice-group]')].map((group) => [
      group.dataset.practiceGroup,
      [...group.querySelectorAll('.work-list a')].map((link) => link.textContent.trim()).sort(),
    ]),
  ),
}));
assert.equal(desktopGroups.firstSection, 'pages');
assert.equal(desktopGroups.layout, 'grid');
assert.deepEqual(desktopGroups.groups, {
  'ascii-art': ['ASCII mirrors', 'ASCII portraits', 'Hasciicam'].sort(),
  'code-art': ['forkbomb'],
  'data-portraits': ['D.P. Amsterdam', 'D.P. Lugano', 'D.P. Palermo'].sort(),
  dowsing: ['Making visible the invisible', 'Todo lo que traes con tigo'].sort(),
  'net-art': ['Farah: In Search for Joy'],
  'time-based-text': [],
});
console.log('desktop practice/work groups:', JSON.stringify(desktopGroups));
await page.keyboard.press('Escape');
await page.waitForTimeout(700);
const overlayClosed = await page.evaluate(() => document.getElementById('index-overlay').hidden);
const focusBack = await page.evaluate(() => document.activeElement?.textContent);
console.log('overlay open/close/focus:', overlayOpen, overlayClosed, JSON.stringify(focusBack));
assert.equal(overlayOpen, true);
assert.equal(overlayClosed, true);
assert.equal(await page.locator('.site-header .info').evaluate(el => el === document.activeElement), true);

// Wheel must not cycle while overlay open
await page.click('.site-header .info');
await page.waitForTimeout(500);
await page.mouse.wheel(0, 300);
await page.waitForTimeout(800);
const afterOverlayWheel = await state();
await page.keyboard.press('Escape');
console.log('wheel w/overlay:', JSON.stringify(afterOverlayWheel.visible));
assert.deepEqual(afterOverlayWheel.visible, [slugs[0]]);

// Mobile viewport: bottom bar + swipe
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const bb = await page.evaluate(() => ({
  counter: document.querySelector('[data-bb-counter]')?.textContent,
  context: document.querySelector('[data-bb-context]')?.textContent,
  barVisible: getComputedStyle(document.querySelector('.bottom-bar')).display,
}));
console.log('mobile bar:   ', JSON.stringify(bb));
assert.equal(bb.barVisible, 'flex');
assert.equal(bb.counter, `01 / ${String(slugs.length).padStart(2, '0')}`);
await page.click('.bottom-bar [data-open-index]');
await page.waitForTimeout(500);
const mobileGroups = await page.evaluate(() => ({
  layout: getComputedStyle(document.querySelector('[data-practice-group]')).display,
  order: [...document.querySelectorAll('[data-practice-group]')].map((group) => group.dataset.practiceGroup),
}));
assert.equal(mobileGroups.layout, 'block');
assert.deepEqual(mobileGroups.order, desktopGroups.order);
console.log('mobile practice/work groups:', JSON.stringify(mobileGroups));
await page.keyboard.press('Escape');
await page.waitForTimeout(700);
await page.evaluate(() => {
  const stage = document.querySelector('[data-stage]');
  stage.dispatchEvent(new TouchEvent('touchstart', { touches: [new Touch({ identifier: 1, target: stage, clientY: 600 })], bubbles: true }));
  stage.dispatchEvent(new TouchEvent('touchend', { changedTouches: [new Touch({ identifier: 1, target: stage, clientY: 200 })], bubbles: true }));
});
await page.waitForTimeout(600);
console.log('after swipe:  ', JSON.stringify(await state()));
assert.deepEqual((await state()).visible, [slugs[1]]);

// Each active artwork remains a direct, locale-specific page entry.
for (const locale of ['en', 'it']) {
  const prefix = locale === 'it' ? 'it/' : '';
  await page.evaluate(value => localStorage.setItem('lang', value), locale);
  await page.goto(base + prefix, { waitUntil: 'networkidle' });
  await page.keyboard.press('End');
  const active = page.locator('[data-state]:not([inert]) [data-visual]');
  const title = await page.locator('[data-state]:not([inert]) [data-label]').textContent();
  assert.equal(await active.getAttribute('aria-label'), `${locale === 'it' ? 'Entra in' : 'Enter'} ${title}`);
  const destination = await active.getAttribute('href');
  assert.ok(destination.startsWith(`/art/${prefix}`));
  await active.click();
  await page.waitForURL(url => url.pathname === destination);
  assert.equal(await page.locator('main h1').count(), 1);
  console.log(`direct entry ${locale}: ${destination}`);
}

// Text enlargement must preserve the complete controls, including at 320px.
for (const locale of ['en', 'it']) for (const width of [320, 390, 1440]) for (const scale of [100, 200]) {
  await page.evaluate(value => localStorage.setItem('lang', value), locale);
  await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
  await page.goto(base + (locale === 'it' ? 'it/' : ''), { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: `html { font-size: ${scale}% !important; }` });
  const geometry = await page.evaluate(() => ({
    root: getComputedStyle(document.documentElement).fontSize,
    controls: [...document.querySelectorAll('.site-header a, .site-header select, .site-header button, .bottom-bar button')]
      .filter(el => el.getClientRects().length).map(el => {
        const r = el.getBoundingClientRect();
        return { name: el.textContent.trim(), x: r.x, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      }),
  }));
  assert.equal(geometry.root, scale === 100 ? '16px' : '32px');
  for (const control of geometry.controls) {
    assert.ok(control.x >= 0 && control.right <= width && control.bottom <= (width === 1440 ? 900 : 844), JSON.stringify({ locale, width, scale, control }));
    assert.ok(control.height >= 44, JSON.stringify(control));
  }
}
console.log('control reflow: 12 EN/IT viewport/text-scale combinations passed (16/32px)');

for (const prefix of ['', 'it/']) {
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await nojs.newPage();
  await staticPage.goto(base + prefix, { waitUntil: 'networkidle' });
  const browse = staticPage.locator('.no-js-browse');
  assert.equal(await browse.isVisible(), true);
  assert.equal(await staticPage.locator('[data-open-index]:visible').count(), 0);
  await browse.click();
  await staticPage.waitForURL(base + prefix + 'works/');
  assert.equal(await staticPage.locator('main .index-list a').count(), 10);
  await staticPage.locator(`main a[href="/art/${prefix}work/forkbomb/"]`).click();
  await staticPage.waitForURL(base + prefix + 'work/forkbomb/');
  assert.equal(await staticPage.locator('h1').textContent(), 'forkbomb');
  await nojs.close();
}
console.log('noJS: localized browse, complete work list and direct work entry passed');

console.log('JS errors:', errors.length ? errors : 'none');
await browser.close();
assert.deepEqual(errors, []);

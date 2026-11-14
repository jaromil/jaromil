import assert from 'node:assert/strict';
import { launchBrowser, artBase } from './tests/browser.mjs';

const base = artBase;
const browser = await launchBrowser();

// Desktop: arrows, hint, live region
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(base, { waitUntil: 'networkidle' });

const probe = () =>
  page.evaluate(() => ({
    visible: [...document.querySelectorAll('[data-state]')].filter((s) => !s.inert).map((s) => s.dataset.slug),
    live: document.querySelector('[data-live]')?.textContent,
    hintHidden: document.querySelector('[data-hint]')?.hidden,
    stored: localStorage.getItem('jaromil-stage-hint-seen'),
  }));

console.log('initial:        ', JSON.stringify(await probe()));
const slugs = await page.locator('[data-state]').evaluateAll(es => es.map(e => e.dataset.slug));
assert.deepEqual((await probe()).visible, [slugs[0]]);
assert.equal((await probe()).hintHidden, false);
await page.click('.counter [data-next]');
await page.waitForTimeout(600);
console.log('after arrow:    ', JSON.stringify(await probe()));
assert.deepEqual((await probe()).visible, [slugs[1]]);
assert.match((await probe()).live, /— 2 of \d+$/);
await page.click('.counter [data-prev]');
await page.waitForTimeout(600);
console.log('after prev:     ', JSON.stringify(await probe()));
assert.deepEqual((await probe()).visible, [slugs[0]]);

// Reload: hint must not return
await page.reload({ waitUntil: 'networkidle' });
console.log('after reload:   ', JSON.stringify(await probe()));
assert.equal((await probe()).hintHidden, true);
assert.equal((await probe()).stored, '1');

// Overlay: skip link inert — Tab from close button must not reach skip link
await page.click('.site-header .info');
await page.waitForTimeout(500);
const skipInert = await page.evaluate(() => document.querySelector('.skip-link').inert);
await page.keyboard.press('Escape');
console.log('skip link inert under overlay:', skipInert);
assert.equal(skipInert, true);
assert.equal(await page.locator('.skip-link').evaluate(e => e.inert), false);

// Mobile: bottom bar arrows
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
mob.on('pageerror', e => errors.push(e.message));
await mob.goto(base, { waitUntil: 'networkidle' });
const bbBefore = await mob.evaluate(() => document.querySelector('[data-bb-counter]').textContent);
await mob.click('.bottom-bar [data-next]');
await mob.waitForTimeout(600);
const bbAfter = await mob.evaluate(() => ({
  counter: document.querySelector('[data-bb-counter]').textContent,
  context: document.querySelector('[data-bb-context]').textContent,
  visible: [...document.querySelectorAll('[data-state]')].filter((s) => !s.inert).map((s) => s.dataset.slug),
}));
console.log('mobile before:', bbBefore, '→ after arrow:', JSON.stringify(bbAfter));
assert.equal(bbBefore, `01 / ${String(slugs.length).padStart(2, '0')}`);
assert.equal(bbAfter.counter, `02 / ${String(slugs.length).padStart(2, '0')}`);
assert.deepEqual(bbAfter.visible, [slugs[1]]);
assert.ok(bbAfter.context.trim().length > 0);

// Screenshots for visual check
await page.screenshot({ path: '/tmp/opencode/delight-counter.png' });
await mob.screenshot({ path: '/tmp/opencode/delight-mobile.png' });

console.log('JS errors:', errors.length ? errors : 'none');
await browser.close();
assert.deepEqual(errors, []);

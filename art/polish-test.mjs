import { chromium } from 'playwright';
const base = 'http://localhost:4323/art/';
const browser = await chromium.launch({
  executablePath: process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(base, { waitUntil: 'networkidle' });

// Hover on stage label: underline must appear
const deco = async (selector) => page.evaluate((s) => {
  const el = document.querySelector(s);
  return getComputedStyle(el).textDecorationColor + ' | ' + getComputedStyle(el).textDecorationLine;
}, selector);
const labelBefore = await deco('[data-state]:not([inert]) [data-label]');
await page.hover('[data-state]:not([inert]) [data-label]');
const labelAfter = await deco('[data-state]:not([inert]) [data-label]');
console.log('stage label hover:', labelBefore, '→', labelAfter);

// Hover on visual: outline
const outBefore = await page.evaluate(() => getComputedStyle(document.querySelector('[data-state]:not([inert]) .visual')).outlineStyle);
await page.hover('[data-state]:not([inert]) .visual');
const outAfter = await page.evaluate(() => getComputedStyle(document.querySelector('[data-state]:not([inert]) .visual')).outlineStyle);
console.log('visual outline:', outBefore, '→', outAfter);

// Works index rows
await page.goto(base + 'works/', { waitUntil: 'networkidle' });
const rowBefore = await deco('.index-list a');
await page.hover('.index-list a');
const rowAfter = await deco('.index-list a');
console.log('index row hover:', rowBefore, '→', rowAfter);

// Wordmark
const wmBefore = await deco('.wordmark');
await page.hover('.wordmark');
const wmAfter = await deco('.wordmark');
console.log('wordmark hover:', wmBefore, '→', wmAfter);

// Mobile: header opaque while scrolling long page
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto(base + 'work/todos-los-que-traes-contigo/', { waitUntil: 'networkidle' });
const headerBg = await mob.evaluate(() => getComputedStyle(document.querySelector('.site-header')).backgroundColor);
await mob.evaluate(() => window.scrollTo(0, 1200));
await mob.waitForTimeout(300);
// Sample: is any body text visually above the header? Check overlap via elementFromPoint at header wordmark position
const top = await mob.evaluate(() => {
  const el = document.elementFromPoint(60, 26);
  return el?.closest('.site-header') ? 'header owns top layer' : 'COLLISION: ' + el?.tagName;
});
console.log('header bg:', headerBg, '| top layer mid-scroll:', top);
await mob.screenshot({ path: '/tmp/opencode/polish-mobile-scroll.png' });
await page.screenshot({ path: '/tmp/opencode/polish-works.png' });

console.log('JS errors:', errors.length ? errors : 'none');
await browser.close();

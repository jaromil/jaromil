import { chromium } from 'playwright';

const base = 'http://localhost:4323/art/';
const browser = await chromium.launch({
  executablePath:
    process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});

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
await page.click('.counter [data-next]');
await page.waitForTimeout(600);
console.log('after arrow:    ', JSON.stringify(await probe()));
await page.click('.counter [data-prev]');
await page.waitForTimeout(600);
console.log('after prev:     ', JSON.stringify(await probe()));

// Reload: hint must not return
await page.reload({ waitUntil: 'networkidle' });
console.log('after reload:   ', JSON.stringify(await probe()));

// Overlay: skip link inert — Tab from close button must not reach skip link
await page.click('.site-header .info');
await page.waitForTimeout(500);
const skipInert = await page.evaluate(() => document.querySelector('.skip-link').inert);
await page.keyboard.press('Escape');
console.log('skip link inert under overlay:', skipInert);

// Mobile: bottom bar arrows
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
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

// Screenshots for visual check
await page.screenshot({ path: '/tmp/opencode/delight-counter.png' });
await mob.screenshot({ path: '/tmp/opencode/delight-mobile.png' });

console.log('JS errors:', errors.length ? errors : 'none');
await browser.close();

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

await page.keyboard.press('ArrowRight');
await page.waitForTimeout(600);
console.log('ArrowRight:   ', JSON.stringify(await state()));

await page.keyboard.press('ArrowRight');
await page.waitForTimeout(600);
console.log('ArrowRight x2:', JSON.stringify(await state()));

await page.mouse.move(720, 450);
await page.mouse.wheel(0, 300);
await page.waitForTimeout(900);
console.log('wheel down:   ', JSON.stringify(await state()));

await page.keyboard.press('Home');
await page.waitForTimeout(600);
console.log('Home:         ', JSON.stringify(await state()));

// Index overlay: open, Esc, focus return
await page.click('.site-header .info');
await page.waitForTimeout(600);
const overlayOpen = await page.evaluate(() => !document.getElementById('index-overlay').hidden);
await page.keyboard.press('Escape');
await page.waitForTimeout(700);
const overlayClosed = await page.evaluate(() => document.getElementById('index-overlay').hidden);
const focusBack = await page.evaluate(() => document.activeElement?.textContent);
console.log('overlay open/close/focus:', overlayOpen, overlayClosed, JSON.stringify(focusBack));

// Wheel must not cycle while overlay open
await page.click('.site-header .info');
await page.waitForTimeout(500);
await page.mouse.wheel(0, 300);
await page.waitForTimeout(800);
const afterOverlayWheel = await state();
await page.keyboard.press('Escape');
console.log('wheel w/overlay:', JSON.stringify(afterOverlayWheel.visible));

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
await page.evaluate(() => {
  const stage = document.querySelector('[data-stage]');
  stage.dispatchEvent(new TouchEvent('touchstart', { touches: [new Touch({ identifier: 1, target: stage, clientY: 600 })], bubbles: true }));
  stage.dispatchEvent(new TouchEvent('touchend', { changedTouches: [new Touch({ identifier: 1, target: stage, clientY: 200 })], bubbles: true }));
});
await page.waitForTimeout(600);
console.log('after swipe:  ', JSON.stringify(await state()));

console.log('JS errors:', errors.length ? errors : 'none');
await browser.close();

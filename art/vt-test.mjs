import { chromium } from 'playwright';

const base = 'http://localhost:4323/art/';
const browser = await chromium.launch({
  executablePath:
    process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  window.__vtCalls = [];
  const original = document.startViewTransition.bind(document);
  document.startViewTransition = (cb) => {
    window.__vtCalls.push('call');
    return original(cb);
  };
});

await page.goto(base, { waitUntil: 'networkidle' });
await page.keyboard.press('End'); // forkbomb state
await page.waitForTimeout(600);
await page.click('[data-state]:not([inert]) [data-label]');
await page.waitForTimeout(1200);
const vtAfterEnter = await page.evaluate(() => window.__vtCalls.length);
console.log('startViewTransition calls on enter:', vtAfterEnter);

await page.goBack();
await page.waitForTimeout(1000);
const vtAfterBack = await page.evaluate(() => window.__vtCalls.length);
console.log('startViewTransition calls after back:', vtAfterBack);

// Reduced motion: stage cycles instantly, autoplay video stays paused.
const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
await page2.goto(base, { waitUntil: 'networkidle' });
await page2.keyboard.press('ArrowRight');
await page2.waitForTimeout(300);
const rm = await page2.evaluate(() => ({
  visible: [...document.querySelectorAll('[data-state]')].filter((s) => !s.inert).map((s) => s.dataset.slug),
  videoPlaying: ![...document.querySelectorAll('video')].every((v) => v.paused),
}));
console.log('reduced motion:', JSON.stringify(rm));

await browser.close();

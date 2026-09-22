import { chromium } from 'playwright';

// Smoke test for the live HasciiCam media type: camera auto-starts with a
// fake device when the stage state becomes current, stops when swiped away,
// and the practice page hero runs standalone. Run against `npm run preview`.
const base = 'http://localhost:4323/art/';
const browser = await chromium.launch({
  executablePath:
    process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
  args: [
    '--use-fake-device-for-media-stream',
    '--use-fake-ui-for-media-stream',
  ],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));
page.on('response', (r) => r.status() === 404 && errors.push('404: ' + r.url()));

const camState = () =>
  page.evaluate(() => {
    const root = document.querySelector('[data-hasciicam]');
    if (!root) return null;
    const canvas = root.querySelector('[data-canvas]');
    const video = root.querySelector('[data-video]');
    const ctx = canvas.getContext('2d');
    const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let lit = 0;
    for (let i = 0; i < sample.length; i += 400) if (sample[i] > 40) lit++;
    return {
      canvasVisible: !canvas.hidden,
      posterVisible: !root.querySelector('[data-poster]').hidden,
      streaming: video.srcObject !== null,
      trackLive: video.srcObject?.getTracks().some((t) => t.readyState === 'live') ?? false,
      litSamples: lit,
      toggleShown: !root.querySelector('[data-toggle]').hidden,
    };
  });

await page.goto(base, { waitUntil: 'networkidle' });

// Step to the hasciicam state (3rd in the stage sequence).
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(700);
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(2500); // wasm load + permission + first frames
const active = await page.evaluate(
  () => [...document.querySelectorAll('[data-state]')].find((s) => !s.inert)?.dataset.slug,
);
const on = await camState();
console.log('stage hasciicam active:', active, JSON.stringify(on));
if (active !== 'hasciicam') errors.push('hasciicam state not active');
if (!on?.canvasVisible || !on?.streaming || !on?.trackLive) errors.push('camera did not start on stage');
if ((on?.litSamples ?? 0) < 50) errors.push('canvas looks blank: ' + on?.litSamples);

// Swipe away: camera must stop.
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(800);
const off = await camState();
console.log('after swipe away:      ', JSON.stringify(off));
if (off?.streaming || off?.trackLive) errors.push('camera still live after swipe away');
if (off?.canvasVisible) errors.push('canvas still visible after swipe away');

// Practice page: hero runs standalone.
await page.goto(base + 'practice/hasciicam/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const hero = await camState();
console.log('practice page hero:    ', JSON.stringify(hero));
if (!hero?.canvasVisible || !hero?.streaming || !hero?.trackLive)
  errors.push('camera did not start on practice page');
if ((hero?.litSamples ?? 0) < 50) errors.push('practice canvas looks blank: ' + hero?.litSamples);

// Navigating away stops the camera (astro:before-swap).
await page.goto(base + 'practices/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
process.exit(errors.length ? 1 : 0);

import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = 'http://localhost:4323/art/';
const browser = await chromium.launch({
  executablePath: process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
});
const errors = [];
async function trackedPage(options = {}) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ...options });
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.__cameraTracks = []; window.__cameraRequests = 0;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async constraints => {
      window.__cameraRequests++;
      const stream = await original(constraints);
      window.__cameraTracks.push(...stream.getTracks());
      return stream;
    };
  });
  return page;
}
async function running(page) {
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-hasciicam]');
    return root?.__hc?.running && !root.querySelector('[data-canvas]').hidden;
  });
  assert.equal(await page.locator('[data-hasciicam] [data-video]').evaluate(video => video.srcObject.getTracks().every(track => track.readyState === 'live')), true);
}
async function stopped(page) {
  await page.waitForFunction(() => window.__cameraTracks.length > 0 && window.__cameraTracks.every(track => track.readyState === 'ended'));
  const roots = await page.locator('[data-hasciicam]').evaluateAll(nodes => nodes.map(root => ({
    streaming: root.querySelector('[data-video]').srcObject !== null,
    canvas: !root.querySelector('[data-canvas]').hidden,
    poster: !root.querySelector('[data-poster]').hidden,
    raf: root.__hc?.raf ?? 0,
  })));
  for (const root of roots) assert.deepEqual(root, { streaming: false, canvas: false, poster: true, raf: 0 });
}
try {
  const page = await trackedPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(() => window.__cameraRequests), 0);
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  await running(page);
  const lit = await page.locator('[data-canvas]').evaluate(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0; for (let i = 0; i < pixels.length; i += 400) if (pixels[i] > 40) count++;
    return count;
  });
  assert.ok(lit > 50, `fake-camera ASCII canvas looks blank: ${lit}`);
  await page.keyboard.press('ArrowRight'); await stopped(page);
  console.log('fake stage camera: rendered; deactivate ends every retained track and RAF');
  for (const event of ['pagehide', 'astro:before-swap', 'visibilitychange']) {
    await page.goto(base + 'practice/ascii-art/', { waitUntil: 'networkidle' }); await running(page);
    await page.evaluate(name => {
      if (name === 'pagehide') window.dispatchEvent(new PageTransitionEvent(name));
      else {
        if (name === 'visibilitychange') Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event(name));
      }
    }, event);
    await stopped(page);
    console.log(`fake camera ${event}: every retained track ended; poster restored`);
  }
  await page.goto(base + 'practice/ascii-art/', { waitUntil: 'networkidle' }); await running(page);
  await page.locator('.site-header [data-open-index]').click();
  await page.locator('#index-overlay a[href="/art/practices/"]').click();
  await page.waitForURL(base + 'practices/'); await stopped(page);
  console.log('ClientRouter navigation away: retained fake tracks ended');
  for (const mode of ['reduce', 'save-data']) {
    const still = await trackedPage(mode === 'reduce' ? { reducedMotion: 'reduce' } : {});
    if (mode === 'save-data') await still.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }));
    await still.goto(base + 'practice/ascii-art/', { waitUntil: 'networkidle' });
    assert.equal(await still.evaluate(() => window.__cameraRequests), 0);
    assert.equal(await still.locator('[data-toggle]').isVisible(), true);
    assert.ok(await still.locator('[data-toggle]').evaluate(button => button.getBoundingClientRect().height >= 44));
    assert.equal(await still.locator('[data-poster]').isVisible(), true);
    await still.locator('[data-toggle]').click(); await running(still);
    await still.evaluate(() => document.querySelector('[data-hasciicam]').dispatchEvent(new Event('hasciicam:deactivate')));
    await stopped(still); await still.close();
    console.log(`${mode}: poster/no automatic camera; explicit fake-camera start and cleanup pass`);
  }
  for (const locale of ['en', 'it']) {
    const denied = await trackedPage({ locale: locale === 'it' ? 'it-IT' : 'en-US' });
    await denied.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied for test', 'NotAllowedError'); }; });
    await denied.goto(base + (locale === 'it' ? 'it/' : '') + 'practice/ascii-art/', { waitUntil: 'networkidle' });
    const status = denied.locator('[data-status]'); await status.waitFor({ state: 'visible' });
    assert.equal(await status.textContent(), locale === 'it' ? 'Permesso per la camera negato' : 'Camera permission denied');
    assert.ok(await status.evaluate(el => el.getBoundingClientRect().height >= 16), 'camera failure status must be readable, not visually hidden');
    assert.equal(await denied.locator('[data-poster]').isVisible(), true);
    assert.equal(await denied.locator('[data-toggle]').isVisible(), true);
    assert.equal(await denied.locator('[data-video]').evaluate(video => video.srcObject), null);
    await denied.close(); console.log(`${locale}: denied camera leaves visible localized status, poster and retry`);
  }
  const late = await trackedPage();
  await late.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async constraints => {
      const stream = await original(constraints);
      await new Promise(resolve => { window.__releaseCamera = resolve; }); return stream;
    };
  });
  await late.goto(base + 'practice/ascii-art/', { waitUntil: 'networkidle' });
  await late.waitForFunction(() => typeof window.__releaseCamera === 'function');
  await late.evaluate(() => {
    document.querySelector('[data-hasciicam]').dispatchEvent(new Event('hasciicam:deactivate')); window.__releaseCamera();
  });
  await stopped(late); await late.close();
  console.log('late fake permission result after deactivate: all tracks immediately ended');
  assert.deepEqual(errors, []);
} finally { await browser.close(); }

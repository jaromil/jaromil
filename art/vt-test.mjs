import { launchBrowser, artBase } from './tests/browser.mjs';
import assert from 'node:assert/strict';
import { mediaFixture } from './tests/media-fixture.mjs';

const base = artBase;
const browser = await launchBrowser();
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
assert.ok(vtAfterEnter > 0);
assert.equal(new URL(page.url()).pathname, '/art/work/forkbomb/');

await page.goBack();
await page.waitForTimeout(1000);
const vtAfterBack = await page.evaluate(() => window.__vtCalls.length);
console.log('startViewTransition calls after back:', vtAfterBack);
assert.ok(vtAfterBack > vtAfterEnter);
assert.equal(new URL(page.url()).pathname, '/art/');

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
assert.deepEqual(rm.visible, ['dowsing']);
assert.equal(rm.videoPlaying, false);

const saving = await browser.newPage();
await saving.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }));
const downloads=[];
saving.on('request', request => /\.webm(?:\?|$)/.test(request.url()) && downloads.push(request.url()));
await saving.goto(base, { waitUntil: 'networkidle' });
await saving.keyboard.press('ArrowRight');
await saving.waitForTimeout(600);
assert.equal(await saving.locator('video').evaluateAll(videos => videos.every(video => video.paused)), true);
assert.deepEqual(downloads, [], 'save-data must not fetch autoplay video before intent');
assert.equal(await saving.locator('[data-state]:not([inert]) video').evaluate(video => video.controls), true);
console.log('save-data: no autoplay/download; manual controls available');

await page.goto(base, { waitUntil: 'networkidle' });
await page.keyboard.press('ArrowRight');
await page.waitForFunction(() => document.querySelector('[data-state]:not([inert]) video')?.paused === false);
assert.equal(await page.locator('video').evaluateAll(videos => videos.filter(video => !video.paused).length), 1);
await page.evaluate(() => {
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  document.dispatchEvent(new Event('visibilitychange'));
});
assert.equal(await page.locator('video').evaluateAll(videos => videos.every(video => video.paused)), true);
console.log('ordinary motion: muted active video only; tab-hide pauses all');

const fixture = await mediaFixture();
try {
  const media = await browser.newPage();
  const external = [];
  await media.route('https://video.invalid/**', route => { external.push(route.request().url()); return route.abort('failed'); });
  await media.goto(fixture.url, { waitUntil: 'networkidle' });
  assert.deepEqual(external, [], 'no offscreen PeerTube request before intent');
  assert.equal(await media.locator('[data-peertube] iframe').count(), 0);
  const first = media.locator('[data-peertube]').nth(0);
  await first.locator('.surface').click();
  await media.waitForTimeout(300);
  const src = await first.locator('iframe').getAttribute('src');
  const frameBox = await first.locator('iframe').boundingBox();
  const posterBox = await first.boundingBox();
  assert.ok(Math.abs(frameBox.width - posterBox.width) < 1, 'dynamic iframe must preserve the poster width');
  assert.ok(Math.abs(frameBox.width / frameBox.height - 16 / 9) < 0.01, 'dynamic iframe must preserve the media aspect ratio');
  assert.equal(new URL(src).searchParams.get('muted'), '1');
  assert.equal(new URL(src).searchParams.get('autoplay'), '1');
  assert.ok(external.length > 0, 'the deliberately failed external embed was requested');
  assert.equal(await first.locator('a[href="https://video.invalid/w/fixture-one"]').isVisible(), true);
  const second = media.locator('[data-peertube]').nth(1);
  await second.locator('.surface').focus();
  await media.keyboard.press('Enter');
  assert.equal(await media.locator('[data-peertube] iframe').count(), 1);
  assert.equal(await first.locator('.surface').isVisible(), true);
  const localVideo = media.locator('.media-video video');
  await localVideo.scrollIntoViewIfNeeded();
  await localVideo.evaluate(video => video.play());
  assert.equal(await media.locator('[data-peertube] iframe').count(), 0, 'local video must stop the prior external player');
  await localVideo.evaluate(video => video.dispatchEvent(new Event('error')));
  assert.equal(await media.locator('[data-video-fallback]').isVisible(), true);
  const auto = media.locator('[data-peertube]').nth(2);
  await auto.scrollIntoViewIfNeeded();
  await media.waitForFunction(() => document.querySelector('[data-uuid="fixture-auto"] iframe'));
  assert.equal(await localVideo.evaluate(video => video.paused), true);
  await media.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.equal(await media.locator('[data-peertube] iframe').count(), 0);
  console.log('isolated PeerTube fixture: poster-first; failed external watch link; muted/one-player; local-video error; tab-hide cleanup');
  await media.close();
  const failedLocal = await browser.newPage();
  let failedLocalRequests = 0;
  await failedLocal.route('**/*.webm', route => { failedLocalRequests++; return route.abort('failed'); });
  await failedLocal.route('https://video.invalid/**', route => route.abort('failed'));
  await failedLocal.goto(fixture.url, { waitUntil: 'networkidle' });
  await failedLocal.locator('.media-video video').evaluate(video => { void video.play().catch(() => {}); });
  await failedLocal.locator('[data-video-fallback]').waitFor({ state: 'visible' });
  assert.ok(failedLocalRequests > 0);
  assert.ok(await failedLocal.locator('.media-video video').getAttribute('poster'));
  assert.equal(await failedLocal.locator('[data-video-fallback] a').count(), 1);
  await failedLocal.close();
  console.log('actual failed local-video request: poster and direct watch fallback retained');
  for (const prefix of ['', 'it/']) {
    const nojs = await browser.newPage({ javaScriptEnabled: false });
    await nojs.goto(fixture.url.replace('/media-fixture/', `/${prefix}media-fixture/`), { waitUntil: 'networkidle' });
    assert.equal(await nojs.locator('[data-peertube] a[href^="https://video.invalid/w/"]').count(), 3);
    assert.equal(await nojs.locator('.media-video a:visible').count(), 1);
    await nojs.close();
  }
  console.log('unpublished EN/IT noJS media: direct external/local watch links remain');
  for (const mode of ['reduce', 'save-data']) {
    const still = await browser.newPage(mode === 'reduce' ? { reducedMotion: 'reduce' } : {});
    if (mode === 'save-data') await still.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }));
    await still.route('https://video.invalid/**', route => route.abort('failed'));
    await still.goto(fixture.url, { waitUntil: 'networkidle' });
    await still.locator('[data-uuid="fixture-auto"]').scrollIntoViewIfNeeded();
    await still.waitForTimeout(300);
    assert.equal(await still.locator('iframe').count(), 0);
    await still.locator('[data-uuid="fixture-auto"] .surface').click();
    assert.equal(await still.locator('iframe').count(), 1, `${mode} permits explicit video intent`);
    await still.close();
  }
  console.log('isolated PeerTube reduced-motion/save-data: no automatic iframe, explicit intent works');
} finally { await fixture.close(); }

await browser.close();

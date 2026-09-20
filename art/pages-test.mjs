import { chromium } from 'playwright';

const base = 'http://localhost:4323/art/';
const browser = await chromium.launch({
  executablePath:
    process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('response', (r) => r.status() >= 400 && errors.push(r.status() + ': ' + r.url()));

await page.goto(base, { waitUntil: 'networkidle' });

// Go to forkbomb state (End key) and enter the work via the title link.
await page.keyboard.press('End');
await page.waitForTimeout(600);
await page.click('[data-state]:not([inert]) [data-label]');
await page.waitForTimeout(1200);
console.log('url after enter:', page.url());
const forkbomb = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent,
  code: document.querySelector('.code-work code')?.textContent?.trim(),
  context: document.querySelector('.context')?.textContent?.trim() ?? null,
  exhibitions: [...document.querySelectorAll('.index-list a')].map((a) => a.textContent),
}));
console.log('forkbomb page:', JSON.stringify(forkbomb));

// Back via history — ClientRouter restores the stage.
await page.goBack();
await page.waitForTimeout(1000);
const back = await page.evaluate(() => ({
  url: location.pathname,
  visible: [...document.querySelectorAll('[data-state]')].filter((s) => !s.inert).map((s) => s.dataset.slug),
}));
console.log('after goBack:', JSON.stringify(back));

// Practice page: dowse — video hero, works list, current realization.
await page.goto(base + 'practice/dowse/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const dowse = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent,
  videoPlaying: ![...document.querySelectorAll('video')].every((v) => v.paused),
  works: [...document.querySelectorAll('.index-list a')].map((a) => a.textContent),
  current: document.querySelector('.index-list .aside')?.textContent,
}));
console.log('dowse practice:', JSON.stringify(dowse));

// Work belonging to a practice: context link back to Dowse.
await page.goto(base + 'work/todos-los-que-traes-contigo/', { waitUntil: 'networkidle' });
const todos = await page.evaluate(() => ({
  context: document.querySelector('.context a')?.textContent,
  contextHref: document.querySelector('.context a')?.getAttribute('href'),
  videos: document.querySelectorAll('video').length,
  related: [...document.querySelectorAll('.related a')].map((a) => a.textContent),
  h2: [...document.querySelectorAll('h2')].map((h) => h.textContent),
}));
console.log('todos work:', JSON.stringify(todos));

// Exhibition page.
await page.goto(base + 'exhibition/i-love-you/', { waitUntil: 'networkidle' });
const exh = await page.evaluate(() => ({
  showings: document.querySelectorAll('.index-list li').length,
  workLink: document.querySelector('.index-list a')?.getAttribute('href'),
}));
console.log('exhibition:', JSON.stringify(exh));

// Screenshots for visual review.
await page.goto(base, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'shots/home-data-portraits.png' });
await page.keyboard.press('End');
await page.waitForTimeout(700);
await page.screenshot({ path: 'shots/home-forkbomb.png' });
await page.goto(base + 'work/forkbomb/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'shots/work-forkbomb.png', fullPage: true });
await page.goto(base + 'practice/dowse/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: 'shots/practice-dowse.png' });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'shots/home-mobile.png' });

console.log('errors:', errors.length ? errors : 'none');
await browser.close();

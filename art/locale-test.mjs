import { chromium } from 'playwright';

const base = 'http://localhost:4323/art/';
const browser = await chromium.launch({
  executablePath:
    process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});
const errors = [];

// 1. Italian browser: root redirects to /it/
let ctx = await browser.newContext({ locale: 'it-IT' });
let page = await ctx.newPage();
page.on('pageerror', (e) => errors.push('it: ' + e.message));
await page.goto(base, { waitUntil: 'networkidle' });
console.log('IT browser, root →', page.url());
const itHome = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  h1: document.querySelector('h1')?.textContent,
  hint: document.querySelector('[data-hint]')?.textContent,
  skip: document.querySelector('.skip-link')?.textContent,
  switchValue: document.querySelector('[data-lang-switch]')?.value,
  hreflang: [...document.querySelectorAll('link[hreflang]')].map((l) => l.getAttribute('hreflang')),
}));
console.log('IT home:', JSON.stringify(itHome));

// 2. Manual switch to EN on an IT page: stores + navigates to EN equivalent
await page.goto(base + 'it/work/forkbomb/', { waitUntil: 'networkidle' });
await page.selectOption('[data-lang-switch]', 'en');
await page.waitForTimeout(1000);
console.log('after switch to EN:', page.url(), '| stored:', await page.evaluate(() => localStorage.getItem('lang')));

// 3. Stored EN overrides IT browser on root
await page.goto(base, { waitUntil: 'networkidle' });
console.log('stored EN + IT browser, root →', page.url());

// 4. Deep link never redirects (stored cleared, IT browser, EN work URL)
await page.evaluate(() => localStorage.clear());
await page.goto(base + 'work/forkbomb/', { waitUntil: 'networkidle' });
console.log('deep link EN + IT browser →', page.url());
await ctx.close();

// 5. English browser: stays on EN root
ctx = await browser.newContext({ locale: 'en-US' });
page = await ctx.newPage();
page.on('pageerror', (e) => errors.push('en: ' + e.message));
await page.goto(base, { waitUntil: 'networkidle' });
console.log('EN browser, root →', page.url());

// 6. Switch to IT from EN work page
await page.goto(base + 'work/todos-los-que-traes-contigo/', { waitUntil: 'networkidle' });
await page.selectOption('[data-lang-switch]', 'it');
await page.waitForTimeout(1000);
const itWork = await page.evaluate(() => ({
  url: location.pathname,
  lang: document.documentElement.lang,
  context: document.querySelector('.context a')?.textContent,
  contextHref: document.querySelector('.context a')?.getAttribute('href'),
  h2: [...document.querySelectorAll('h2.section-label')].map((h) => h.textContent.trim()),
  overlayLinks: [...document.querySelectorAll('#index-overlay a')].slice(0, 3).map((a) => a.getAttribute('href')),
  wordmark: document.querySelector('.wordmark')?.getAttribute('href'),
}));
console.log('after switch to IT:', JSON.stringify(itWork, null, 1));

// 7. Stage works on IT home (arrows + live region in Italian)
await page.goto(base + 'it/', { waitUntil: 'networkidle' });
await page.click('.counter [data-next]');
await page.waitForTimeout(600);
const itStage = await page.evaluate(() => ({
  live: document.querySelector('[data-live]')?.textContent,
  bb: document.querySelector('[data-bb-context]')?.textContent,
}));
console.log('IT stage after arrow:', JSON.stringify(itStage));
await ctx.close();

console.log('JS errors:', errors.length ? errors : 'none');
await browser.close();

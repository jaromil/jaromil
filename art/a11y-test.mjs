import { chromium } from 'playwright';

const base = 'http://localhost:4323/art/';
const routes = [
  '',
  'practices/',
  'works/',
  'exhibitions/',
  'texts/',
  'bio/',
  'practice/data-portraits/',
  'practice/dowse/',
  'practice/hasciicam/',
  'work/random-data-0001/',
  'work/john-cage-4-33/',
  'work/leaves-of-grass-0011/',
  'work/todos-los-que-traes-contigo/',
  'work/forkbomb/',
  'exhibition/i-love-you/',
  'text/la-boheme-digitale/',
];

const browser = await chromium.launch({
  executablePath:
    process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});
const page = await browser.newPage();
let failures = 0;

for (const route of routes) {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  const report = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((n) => n.id);
    return {
      title: document.title,
      lang: document.documentElement.lang,
      h1Count: document.querySelectorAll('h1').length,
      mainLandmark: !!document.querySelector('main#main'),
      imgsNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
      dupIds: ids.length - new Set(ids).size,
      skipLink: !!document.querySelector('.skip-link'),
    };
  });
  const problems = [];
  if (report.h1Count !== 1) problems.push(`h1=${report.h1Count}`);
  if (!report.mainLandmark) problems.push('no main landmark');
  if (report.imgsNoAlt > 0) problems.push(`${report.imgsNoAlt} imgs without alt`);
  if (report.dupIds > 0) problems.push(`${report.dupIds} duplicate ids`);
  if (!report.skipLink) problems.push('no skip link');
  if (problems.length) failures++;
  console.log((problems.length ? 'FAIL ' : 'ok   ') + (route || '/'), JSON.stringify(report), problems.join('; '));
}

// Keyboard walk on homepage: skip link -> wordmark -> INFO -> stage links -> prev/next
await page.goto(base, { waitUntil: 'networkidle' });
const tabStops = [];
for (let i = 0; i < 8; i++) {
  await page.keyboard.press('Tab');
  tabStops.push(
    await page.evaluate(() => {
      const el = document.activeElement;
      return el ? `${el.tagName.toLowerCase()}.${el.className?.toString().split(' ')[0] || el.textContent.trim().slice(0, 20)}` : 'none';
    }),
  );
}
console.log('tab order:', JSON.stringify(tabStops));

// Focus visibility: focused element must have a visible outline.
await page.keyboard.press('Tab');
const outline = await page.evaluate(() => {
  const el = document.activeElement;
  if (!el) return null;
  const s = getComputedStyle(el);
  return { outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth };
});
console.log('focus outline:', JSON.stringify(outline));

console.log(failures ? `${failures} route(s) with problems` : 'all routes pass');
await browser.close();
process.exit(failures ? 1 : 0);

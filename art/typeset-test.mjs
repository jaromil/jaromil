import { chromium } from 'playwright';
const base = 'http://localhost:4323/art/';
const browser = await chromium.launch({
  executablePath: process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base + 'work/todos-los-que-traes-contigo/', { waitUntil: 'networkidle' });
const measure = await page.evaluate(() => {
  const ps = [...document.querySelectorAll('.body [lang] p')];
  const h2Spacing = (() => {
    const sec = document.querySelector('.body section');
    return sec ? getComputedStyle(sec.querySelector('[lang]')).marginBlockStart : 'n/a';
  })();
  return {
    count: ps.length,
    margins: [...new Set(ps.map((p) => getComputedStyle(p).marginBlockStart))],
    lineHeights: [...new Set(ps.map((p) => getComputedStyle(p).lineHeight))],
    h2ToDiv: h2Spacing,
  };
});
console.log('todos page:', JSON.stringify(measure));
await page.evaluate(() => window.scrollTo(0, 1400));
await page.waitForTimeout(200);
await page.screenshot({ path: '/tmp/opencode/typeset-todos.png' });
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto(base + 'work/todos-los-que-traes-contigo/', { waitUntil: 'networkidle' });
await mob.evaluate(() => window.scrollTo(0, 1200));
await mob.waitForTimeout(200);
await mob.screenshot({ path: '/tmp/opencode/typeset-mobile.png' });
await browser.close();

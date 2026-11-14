import assert from 'node:assert/strict';
import { launchBrowser, artBase } from './tests/browser.mjs';
const base = artBase;
const browser = await launchBrowser();
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
    leading: ps.map(p => parseFloat(getComputedStyle(p).lineHeight) / parseFloat(getComputedStyle(p).fontSize)),
    paragraphGaps: ps.filter(p => p.previousElementSibling).map(p => parseFloat(getComputedStyle(p).marginBlockStart) / parseFloat(getComputedStyle(p).fontSize)),
    h2ToDiv: h2Spacing,
  };
});
console.log('todos page:', JSON.stringify(measure));
assert.ok(measure.count > 1, 'Exercise actual Italian source paragraphs');
for (const ratio of measure.leading) assert.ok(Math.abs(ratio - 1.7) < 0.01, `Source leading ${ratio}`);
for (const ratio of measure.paragraphGaps) assert.ok(Math.abs(ratio - 1.15) < 0.01, `Source paragraph rhythm ${ratio}`);
assert.ok(parseFloat(measure.h2ToDiv) > 0, 'Technical note heading must separate from its source prose');
await page.evaluate(() => window.scrollTo(0, 1400));
await page.waitForTimeout(200);
await page.screenshot({ path: '/tmp/opencode/typeset-todos.png' });
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto(base + 'work/todos-los-que-traes-contigo/', { waitUntil: 'networkidle' });
assert.equal(await mob.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
await mob.evaluate(() => window.scrollTo(0, 1200));
await mob.waitForTimeout(200);
await mob.screenshot({ path: '/tmp/opencode/typeset-mobile.png' });
await browser.close();

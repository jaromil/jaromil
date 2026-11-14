import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';

// Exercise the real layout and content schema without publishing a fictional work.
const root = fileURLToPath(new URL('.', import.meta.url));
const fixture = await mkdtemp(join(process.env.TMPDIR || tmpdir(), 'jaromil-standalone-'));
try {
  await cp(join(root, 'src'), join(fixture, 'src'), {
    recursive: true,
    filter: (path) => path !== join(root, 'src/assets'),
  });
  for (const directory of ['src/assets', 'node_modules', 'public']) {
    await symlink(join(root, directory), join(fixture, directory), 'dir');
  }
  await cp(join(root, 'package.json'), join(fixture, 'package.json'));
  await cp(join(root, 'tests/fixtures/standalone.mdx'), join(fixture, 'src/content/works/standalone-fixture.mdx'));
  await writeFile(join(fixture, 'astro.config.mjs'), `import config from ${JSON.stringify(new URL('astro.config.mjs', import.meta.url).href)};\nexport default { ...config, cacheDir: './.cache/' };\n`);
  const { stdout, stderr } = await promisify(execFile)(process.execPath, [join(root, 'node_modules/astro/astro.js'), 'build'], {
    cwd: fixture,
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    maxBuffer: 1024 * 1024,
  });
  if (process.env.JAROMIL_FIXTURE_LOG) await writeFile(process.env.JAROMIL_FIXTURE_LOG, stdout + stderr);
  for (const locale of ['', 'it/']) {
    await test(`${locale || 'en/'} standalone record omits missing facts and retains explicit related work`, async () => {
      const html = await readFile(join(fixture, 'dist', locale, 'work/standalone-fixture/index.html'), 'utf8');
      const header = html.match(/<article\b[^>]*>\s*<header[^>]*>([\s\S]*?)<\/header>/)?.[1];
      assert.ok(header);
      assert.match(header, /Standalone rendering fixture/);
      assert.doesNotMatch(header, /class="context"|class="meta"|\b20\d\d\b/);
      assert.doesNotMatch(html, /<p class="todo">|id="exhibitions-heading"/);
      const related = html.match(/<nav class="related"[\s\S]*?<\/nav>/)?.[0];
      assert.ok(related);
      assert.match(related, new RegExp(`href="/art/${locale}work/forkbomb/"`));
      assert.doesNotMatch(related, /practice\//, 'an explicit related work must not imply a practice');
    });
  }
} finally {
  await rm(fixture, { recursive: true, force: true });
}

import { chromium } from 'playwright';
import { closeSync, constants, fstatSync, openSync, realpathSync, statSync } from 'node:fs';

export const artBase = process.env.ART_TEST_URL ?? 'http://localhost:4323/art/';
const scratchDescriptors = new Map();

// Linux socket names have a 108-byte limit. Keep the session-owned scratch
// directory and expose the same inode through a short, verified descriptor path.
// No profile relocation, cache download or sandbox relaxation is required.
function browserEnvironment(environment) {
  const directory = environment.TMPDIR || environment.TMP || environment.TEMP;
  if (process.platform !== 'linux' || !directory || Buffer.byteLength(directory) <= 50) return environment;
  const canonical = realpathSync(directory);
  let descriptor = scratchDescriptors.get(canonical);
  if (descriptor === undefined) {
    descriptor = openSync(canonical, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
    scratchDescriptors.set(canonical, descriptor);
  }
  const alias = `/proc/${process.pid}/fd/${descriptor}`;
  const held = fstatSync(descriptor);
  const current = statSync(canonical);
  const target = statSync(alias);
  if (!held.isDirectory() || held.uid !== process.getuid?.() || held.dev !== current.dev || held.ino !== current.ino || target.dev !== held.dev || target.ino !== held.ino || Buffer.byteLength(alias) > 50) {
    scratchDescriptors.delete(canonical);
    closeSync(descriptor);
    throw new Error('Cannot establish short browser temporary directory ownership');
  }
  return { ...environment, TMPDIR: alias, TMP: alias, TEMP: alias };
}

/** Use an existing Chrome installation. Never fall back to a downloaded cache. */
export function launchBrowser(options = {}) {
  const environment = { ...process.env, ...options.env };
  return chromium.launch({
    ...options,
    channel: 'chrome',
    ...(environment.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: environment.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
    env: browserEnvironment(environment),
    chromiumSandbox: true,
  });
}

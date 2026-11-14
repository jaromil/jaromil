import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => Object.fromEntries(
  [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]),
));

function dimensions(bytes) {
  if (bytes.subarray(1, 4).toString() === 'PNG') return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  if (bytes.subarray(0, 3).toString() === 'GIF') return [bytes.readUInt16LE(6), bytes.readUInt16LE(8)];
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'Unsupported image signature');
  let offset = 2;
  let orientation = 1;
  while (offset < bytes.length) {
    assert.equal(bytes[offset], 0xff);
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    const length = bytes.readUInt16BE(offset);
    if (marker === 0xe1 && bytes.subarray(offset + 2, offset + 8).toString() === 'Exif\0\0') {
      const tiff = offset + 8;
      const little = bytes.subarray(tiff, tiff + 2).toString() === 'II';
      const u16 = at => little ? bytes.readUInt16LE(at) : bytes.readUInt16BE(at);
      const u32 = at => little ? bytes.readUInt32LE(at) : bytes.readUInt32BE(at);
      assert.equal(u16(tiff + 2), 42, 'Valid EXIF TIFF header');
      const directory = tiff + u32(tiff + 4);
      for (let i = 0; i < u16(directory); i++) {
        const entry = directory + 2 + i * 12;
        if (u16(entry) === 0x112 && u16(entry + 2) === 3 && u32(entry + 4) === 1) orientation = u16(entry + 8);
      }
    }
    if (marker >= 0xc0 && marker <= 0xc3) {
      const size = [bytes.readUInt16BE(offset + 5), bytes.readUInt16BE(offset + 3)];
      return orientation >= 5 && orientation <= 8 ? size.reverse() : size;
    }
    offset += length;
  }
  throw new Error('Missing JPEG frame dimensions');
}

test('root local image dimensions match the delivered files, including the animated GIF', async () => {
  const local = images.filter(image => !image.src.startsWith('https:'));
  assert.equal(local.length, 14);
  for (const image of local) {
    const bytes = await readFile(new URL(`../${image.src}`, import.meta.url));
    assert.deepEqual([Number(image.width), Number(image.height)], dimensions(bytes), image.src);
  }
});

test('offscreen root media defers loading and retains original source and accessible text', () => {
  assert.equal(images.length, 15);
  for (const image of images) {
    assert.equal(image.loading, 'lazy', image.src);
    assert.equal(image.decoding, 'async', image.src);
    assert.ok(image.alt.trim(), image.src);
    assert.equal(image.srcset, undefined, 'Full original imagery remains the delivered media');
  }
});

for (const locale of ['', 'it/']) {
  test(`first ${locale || 'en'} stage image remains eager, responsive and high priority`, async () => {
    const art = await readFile(new URL(`../art/dist/${locale}index.html`, import.meta.url), 'utf8');
    const first = art.match(/<li\b[^>]*data-state[^>]*>([\s\S]*?)<\/li>/)?.[1];
    assert.ok(first);
    const image = first.match(/<img\b[^>]*>/)?.[0];
    assert.match(image, /loading="eager"/);
    assert.match(image, /fetchpriority="high"/);
    assert.match(image, /srcset=/);
    assert.match(image, /\bwidth="\d+"/);
    assert.match(image, /\bheight="\d+"/);
    assert.doesNotMatch(art, /<iframe\b/, 'External players stay deferred until intent');
  });
}

import type { ImageMetadata } from 'astro';

/**
 * Media files live in src/assets/media/ and are referenced by file name
 * from content frontmatter. Images resolve to ImageMetadata for
 * astro:assets optimization; videos and SVGs resolve to URLs.
 */
const images = import.meta.glob<ImageMetadata>(
  '../assets/media/*.{png,jpg,jpeg,webp,avif,gif}',
  { eager: true, import: 'default' },
);
const files = import.meta.glob<string>('../assets/media/*.{mp4,webm,svg}', {
  eager: true,
  import: 'default',
});

export function imageAsset(name: string): ImageMetadata {
  const found = images[`../assets/media/${name}`];
  if (!found) throw new Error(`Unknown image asset: ${name}`);
  return found;
}

export function fileAsset(name: string): string {
  const found = files[`../assets/media/${name}`];
  if (!found) throw new Error(`Unknown media asset: ${name}`);
  return found;
}

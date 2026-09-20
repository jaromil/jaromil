import { getEntry } from 'astro:content';
import { href } from './i18n';
import type { StageState } from '../components/Stage.astro';

/**
 * The homepage stage sequence, in order. One practice/work at a time; the
 * interface stays constant while the media change. Edit this list to
 * change the rhythm.
 */
const sequence = [
  { kind: 'practice', slug: 'data-portraits' },
  { kind: 'practice', slug: 'dowse' },
  { kind: 'practice', slug: 'hasciicam' },
  { kind: 'work', slug: 'forkbomb' },
] as const;

export async function getStageStates(locale: string): Promise<StageState[]> {
  return Promise.all(
    sequence.map(async ({ kind, slug }) => {
      const entry = await getEntry(kind === 'practice' ? 'practices' : 'works', slug);
      if (!entry) throw new Error(`Stage entry not found: ${kind}/${slug}`);
      return {
        slug,
        title: entry.data.title,
        href: href(`${kind}/${slug}`, locale),
        hero: entry.data.hero,
      };
    }),
  );
}

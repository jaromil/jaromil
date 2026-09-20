import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { mediaSchema } from './lib/media';

/**
 * Practices and Works are two views over the same artistic corpus.
 * A Practice is an ongoing technique/medium (Data Portraits, Hasciicam, Dowse).
 * A Work may belong to a Practice, be a realization of it, or stand alone
 * (forkbomb). Relationships use references, not duplication.
 */
const practices = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/practices' }),
  schema: z.object({
    title: z.string(),
    yearFrom: z.number().optional(),
    yearTo: z.number().optional(),
    status: z.enum(['ongoing', 'archived']).default('ongoing'),
    /** One or two sentences, shown on the stage and indexes. */
    statement: z.string(),
    hero: mediaSchema,
    /** The realization currently representing the practice, if any. */
    currentRealization: reference('works').optional(),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    year: z.number().optional(),
    yearTo: z.number().optional(),
    /** Practice this work belongs to / realizes. Omit for standalone works. */
    practice: reference('practices').optional(),
    location: z.string().optional(),
    statement: z.string().optional(),
    hero: mediaSchema,
    relatedWorks: z.array(reference('works')).default([]),
    exhibitions: z.array(reference('exhibitions')).default([]),
  }),
});

const exhibitions = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/exhibitions' }),
  schema: z.object({
    title: z.string(),
    curator: z.string().optional(),
    /** An exhibition may tour: one entry per showing. */
    showings: z.array(
      z.object({
        year: z.number(),
        venue: z.string(),
        city: z.string(),
      }),
    ),
    works: z.array(reference('works')).default([]),
  }),
});

const texts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/texts' }),
  schema: z.object({
    title: z.string(),
    year: z.number().optional(),
    /** 'draft' marks a placeholder awaiting source material. */
    status: z.enum(['draft', 'published']).default('published'),
  }),
});

export const collections = { practices, works, exhibitions, texts };

import { z } from 'astro:content';

/**
 * Media is the first-class abstraction for everything that can occupy the
 * visual field: image, video, PeerTube embed, SVG, or code (forkbomb's code
 * is itself visual material). Never arbitrary HTML strings.
 */
export const mediaSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('image'),
    /** File name inside src/assets/media/ */
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal('svg'),
    /** File name inside src/assets/media/ */
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal('video'),
    /** Self-hosted sources, e.g. [{ src: 'clip.webm', type: 'video/webm' }] */
    sources: z.array(z.object({ src: z.string(), type: z.string() })).min(1),
    poster: z.string().optional(),
    /** CSS aspect-ratio, e.g. '16 / 9' */
    aspect: z.string().optional(),
    autoplay: z.boolean().default(false),
    muted: z.boolean().default(true),
    loop: z.boolean().default(false),
    controls: z.boolean().default(true),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal('peertube'),
    /** Instance hostname, e.g. 'video.dyne.org' */
    host: z.string(),
    /** Video UUID on the instance */
    uuid: z.string(),
    title: z.string(),
    poster: z.string().optional(),
    aspect: z.string().default('16 / 9'),
    autoplay: z.boolean().default(false),
    muted: z.boolean().default(true),
    loop: z.boolean().default(false),
    controls: z.boolean().default(true),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal('code'),
    code: z.string(),
    lang: z.string().default('sh'),
    caption: z.string().optional(),
  }),
]);

export type Media = z.infer<typeof mediaSchema>;

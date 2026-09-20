// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// The site is developed to be served under https://jaromil.dyne.org/art/
// If it moves to its own (sub)domain, set base: '/' and update `site`.
export default defineConfig({
  site: 'https://jaromil.dyne.org',
  base: '/art',
  trailingSlash: 'always',
  integrations: [mdx()],
});

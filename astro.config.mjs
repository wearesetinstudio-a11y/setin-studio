// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import prettySitemap from './integrations/pretty-sitemap.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.wearesetin.com',
	integrations: [prettySitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
});

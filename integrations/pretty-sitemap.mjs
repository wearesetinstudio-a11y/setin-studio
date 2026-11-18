import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SITE = 'https://www.wearesetin.com';

const LOCALES = [
	{ prefix: '', hreflang: 'en' },
	{ prefix: '/pl', hreflang: 'pl' },
	{ prefix: '/es', hreflang: 'es-PA' },
];

/** @param {string} value */
function escapeXml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

/** @param {string} pathname */
function normalizePathname(pathname) {
	let path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	if (path !== '/' && !path.endsWith('/')) path += '/';
	return path;
}

/** @param {string} pathname */
function stripLocalePrefix(pathname) {
	const match = pathname.match(/^\/(pl|es)(?=\/|$)/);
	if (!match) return pathname === '' ? '/' : pathname;
	const bare = pathname.slice(match[0].length) || '/';
	return bare.startsWith('/') ? bare : `/${bare}`;
}

/** @param {string} prefix @param {string} bare */
function localePath(prefix, bare) {
	if (bare === '/') return prefix ? `${prefix}/` : '/';
	return `${prefix}${bare}`;
}

/**
 * Pretty-printed XML sitemap for Google.
 * Replaces the minified @astrojs/sitemap output that looks like concatenated URLs in many viewers.
 */
export default function prettySitemap() {
	return {
		name: 'pretty-sitemap',
		hooks: {
			'astro:build:done': async ({ dir, pages, logger }) => {
				const outDir = fileURLToPath(dir);

				const builtPaths = [
					...new Set(
						pages
							.map((page) => normalizePathname(page.pathname))
							.filter((pathname) => !pathname.includes('/pitches/')),
					),
				].sort((a, b) => a.localeCompare(b));

				const lines = [
					'<?xml version="1.0" encoding="UTF-8"?>',
					'<urlset',
					'\txmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
					'\txmlns:xhtml="http://www.w3.org/1999/xhtml"',
					'>',
				];

				for (const pathname of builtPaths) {
					const loc = `${SITE}${pathname}`;
					const bare = normalizePathname(stripLocalePrefix(pathname));

					lines.push('\t<url>');
					lines.push(`\t\t<loc>${escapeXml(loc)}</loc>`);

					for (const locale of LOCALES) {
						const href = `${SITE}${localePath(locale.prefix, bare)}`;
						lines.push(
							`\t\t<xhtml:link rel="alternate" hreflang="${locale.hreflang}" href="${escapeXml(href)}" />`,
						);
					}
					lines.push(
						`\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${SITE}${localePath('', bare)}`)}" />`,
					);

					lines.push('\t</url>');
				}

				lines.push('</urlset>');
				lines.push('');

				const xml = lines.join('\n');
				writeFileSync(new URL('sitemap.xml', dir), xml, 'utf8');

				const indexXml = [
					'<?xml version="1.0" encoding="UTF-8"?>',
					'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
					'\t<sitemap>',
					`\t\t<loc>${SITE}/sitemap.xml</loc>`,
					'\t</sitemap>',
					'</sitemapindex>',
					'',
				].join('\n');
				writeFileSync(new URL('sitemap-index.xml', dir), indexXml, 'utf8');

				logger.info(`Generated pretty sitemap with ${builtPaths.length} URLs`);
				logger.info(`Wrote ${outDir}sitemap.xml and sitemap-index.xml`);
			},
		},
	};
}

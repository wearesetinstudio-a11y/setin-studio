import { defaultLocale, isLocale, type Locale } from './dictionaries.ts';

/**
 * Canonical site origin (no trailing slash).
 * The apex host 308-redirects here. Social crawlers often drop og:image when that URL redirects.
 */
export const SITE_URL = 'https://www.wearesetin.com';

const LOCALE_PREFIXES = ['pl', 'es'] as const;

/** BCP 47 value for the HTML `lang` attribute. */
export function htmlLang(locale: Locale): string {
	if (locale === 'es') return 'es-PA';
	return locale;
}

/** Map an HTML `lang` value back to an app locale. */
export function localeFromHtmlLang(lang: string | null | undefined): Locale | null {
	if (!lang) return null;
	const normalized = lang.trim().toLowerCase();
	if (normalized === 'es-pa' || normalized === 'es') return 'es';
	if (normalized === 'en' || normalized === 'pl') return normalized;
	return null;
}

export function stripLocalePrefix(pathname: string): string {
	const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
	const stripped = clean.replace(/^\/(pl|es)(?=\/|$)/, '') || '/';
	return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

export function getLocaleFromPath(pathname: string): Locale {
	const match = pathname.match(/^\/(pl|es)(?=\/|$)/);
	if (match && isLocale(match[1])) return match[1];
	return defaultLocale;
}

/** Build a locale-prefixed path. EN has no prefix. */
export function buildLocalePath(locale: Locale, pathname: string): string {
	const bare = stripLocalePrefix(pathname);
	const normalized =
		bare === '/' ? '/' : bare.endsWith('/') ? bare.slice(0, -1) : bare;

	if (locale === 'en') {
		return normalized === '/' ? '/' : `${normalized}/`;
	}

	if (normalized === '/') return `/${locale}/`;
	return `/${locale}${normalized.endsWith('/') ? normalized : `${normalized}/`}`;
}

export function absoluteUrl(pathname: string): string {
	const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	if (path === '/') return `${SITE_URL}/`;
	return `${SITE_URL}${path.endsWith('/') ? path : `${path}/`}`;
}

export type HreflangLink = {
	hreflang: string;
	href: string;
};

/** Alternate links for the current page path (locale-agnostic). */
export function getHreflangLinks(pathname: string): HreflangLink[] {
	const bare = stripLocalePrefix(pathname);

	return [
		{ hreflang: 'en', href: absoluteUrl(buildLocalePath('en', bare)) },
		{ hreflang: 'pl', href: absoluteUrl(buildLocalePath('pl', bare)) },
		{ hreflang: 'es-PA', href: absoluteUrl(buildLocalePath('es', bare)) },
		{ hreflang: 'x-default', href: absoluteUrl(buildLocalePath('en', bare)) },
	];
}

export function getOrganizationJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': ['Organization', 'ProfessionalService'],
		name: 'Setin Studio',
		url: SITE_URL,
		knowsLanguage: ['English', 'Polish', 'Spanish'],
		areaServed: [
			{
				'@type': 'Country',
				name: 'Panama',
				identifier: 'PA',
			},
			{
				'@type': 'Country',
				name: 'Poland',
				identifier: 'PL',
			},
		],
	};
}

/** Panama / Spanish ProfessionalService schema for /es/ SEO. */
export function getPanamaProfessionalServiceJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfessionalService',
		name: 'Setin Studio',
		url: `${SITE_URL}/es/`,
		logo: `${SITE_URL}/logo.png`,
		description:
			'Estudio boutique de diseño web, branding y productos digitales en Ciudad de Panamá.',
		address: {
			'@type': 'PostalAddress',
			addressLocality: 'Ciudad de Panamá',
			addressCountry: 'PA',
		},
		geo: {
			'@type': 'GeoCoordinates',
			latitude: '8.9824',
			longitude: '-79.5199',
		},
		areaServed: [
			{
				'@type': 'Country',
				name: 'Panama',
			},
			{
				'@type': 'AdministrativeArea',
				name: 'Ciudad de Panamá',
			},
		],
		knowsLanguage: ['es', 'en', 'pl'],
		priceRange: '$$$',
	};
}

export function isLocalePrefix(segment: string): boolean {
	return (LOCALE_PREFIXES as readonly string[]).includes(segment);
}

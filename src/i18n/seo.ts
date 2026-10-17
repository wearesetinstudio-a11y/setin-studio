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
		'@id': `${SITE_URL}/#organization`,
		name: 'Setin Studio',
		url: SITE_URL,
		logo: `${SITE_URL}/logo-setin.svg`,
		description:
			'Boutique digital studio specializing in branding, UI/UX design, and B2B digital platforms for Panama, Latin America, and Europe.',
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

export type ProjectPortfolioJsonLdInput = {
	slug: string;
	name: string;
	description: string;
	client: string;
	industry?: string;
	service?: string;
	year?: number;
	image?: string;
	keywords?: string[];
};

/** Agency + portfolio CreativeWork schema for individual case study pages. */
export function getProjectPortfolioJsonLd(input: ProjectPortfolioJsonLdInput) {
	const pageUrl = absoluteUrl(`/projects/${input.slug}`);
	const orgId = `${SITE_URL}/#organization`;
	const caseStudyId = `${pageUrl}#case-study`;
	const imageUrl = input.image
		? input.image.startsWith('http')
			? input.image
			: `${SITE_URL}${input.image.startsWith('/') ? input.image : `/${input.image}`}`
		: undefined;

	const organization = {
		'@type': ['Organization', 'ProfessionalService'],
		'@id': orgId,
		name: 'Setin Studio',
		url: SITE_URL,
		logo: `${SITE_URL}/logo-setin.svg`,
		description:
			'Boutique digital studio specializing in branding, UI/UX design, and B2B digital platforms.',
	};

	const creativeWork: Record<string, unknown> = {
		'@type': 'CreativeWork',
		'@id': caseStudyId,
		name: input.name,
		headline: input.name,
		description: input.description,
		url: pageUrl,
		inLanguage: 'en',
		creator: { '@id': orgId },
		provider: { '@id': orgId },
		publisher: { '@id': orgId },
		author: { '@id': orgId },
		about: {
			'@type': 'Thing',
			name: input.client,
			description: input.industry || undefined,
		},
	};

	if (imageUrl) creativeWork.image = imageUrl;
	if (input.year) {
		creativeWork.dateCreated = String(input.year);
		creativeWork.copyrightYear = input.year;
	}
	if (input.service) creativeWork.genre = input.service;
	if (input.keywords?.length) creativeWork.keywords = input.keywords.join(', ');

	const webPage: Record<string, unknown> = {
		'@type': 'WebPage',
		'@id': pageUrl,
		url: pageUrl,
		name: `${input.name} — Setin Studio`,
		description: input.description,
		isPartOf: {
			'@type': 'WebSite',
			name: 'Setin Studio',
			url: SITE_URL,
		},
		about: { '@id': caseStudyId },
		mainEntity: { '@id': caseStudyId },
		publisher: { '@id': orgId },
		inLanguage: 'en',
	};

	if (imageUrl) webPage.primaryImageOfPage = imageUrl;

	return {
		'@context': 'https://schema.org',
		'@graph': [organization, creativeWork, webPage],
	};
}

/** Panama / Spanish ProfessionalService schema for /es/ SEO. */
export function getPanamaProfessionalServiceJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfessionalService',
		name: 'Setin Studio',
		url: `${SITE_URL}/es/`,
		logo: `${SITE_URL}/logo-setin.svg`,
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

import type { Locale } from '../i18n/dictionaries.ts';

export type LocalizedAlt = Partial<Record<Locale, string>> & { en: string };

/**
 * SEO-focused image alts for portfolio covers / gallery / overview graphics.
 * English is canonical; Spanish includes service keywords (UI/UX, B2B, branding)
 * and the business vertical each project serves.
 */
const PROJECT_IMAGE_ALTS: Record<string, LocalizedAlt> = {
	app: {
		en: 'Agencia Panamá Pacífico rebranding — government special economic zone branding and visual identity for international investment in Panama',
		es: 'Rebranding de Agencia Panamá Pacífico — branding e identidad visual para zona franca gubernamental e inversión internacional en Panamá',
		pl: 'Rebranding Agencia Panamá Pacífico — branding i identyfikacja wizualna strefy ekonomicznej dla inwestycji międzynarodowych w Panamie',
	},
	avendin: {
		en: 'Avendin branding — B2B smart vending brand identity and UI design for high-tech retail infrastructure in Panama',
		es: 'Branding Avendin — identidad de marca B2B y diseño UI para vending inteligente e infraestructura retail en Panamá',
		pl: 'Branding Avendin — identyfikacja B2B i projekt UI dla inteligentnego vendigu i infrastruktury retail w Panamie',
	},
	'epic-realty': {
		en: 'Epic Realty luxury real estate branding, UI/UX design and B2B property platform for boutique high-end listings in Panama',
		es: 'Branding, diseño UI/UX y plataforma B2B de Epic Realty para bienes raíces de lujo y listados boutique en Panamá',
		pl: 'Branding, UI/UX i platforma B2B Epic Realty dla luksusowych nieruchomości i ofert boutique w Panamie',
	},
	'les-negres-de-europe': {
		en: 'Les Negres de Europe motion and AI-directed brand film for a cultural entertainment project',
		es: 'Film de marca con motion e IA para Les Negres de Europe — proyecto cultural y de entretenimiento',
		pl: 'Film brandowy z motion i AI dla Les Negres de Europe — projekt kulturalny i rozrywkowy',
	},
	'mexi-munchies': {
		en: 'Mexi Munchies rebranding — FMCG snack brand identity and packaging-ready branding for Mexican e-commerce in Panama',
		es: 'Rebranding Mexi Munchies — identidad FMCG y branding para snacks mexicanos y e-commerce en Panamá',
		pl: 'Rebranding Mexi Munchies — identyfikacja FMCG i branding dla meksykańskich przekąsek i e-commerce w Panamie',
	},
	'nrv-rebranding': {
		en: 'NRV Control Systems rebranding — B2B branding and visual identity for security and access-control technology in Panama',
		es: 'Rebranding NRV Control Systems — branding B2B e identidad visual para tecnología de seguridad y control de acceso en Panamá',
		pl: 'Rebranding NRV Control Systems — branding B2B i identyfikacja wizualna dla technologii bezpieczeństwa i kontroli dostępu w Panamie',
	},
	nrv: {
		en: 'NRV Systems B2B web platform — UI/UX design and product interface for security and building-control solutions in Panama',
		es: 'Plataforma web B2B de NRV Systems — diseño UI/UX e interfaz de producto para seguridad y control de edificios en Panamá',
		pl: 'Platforma web B2B NRV Systems — UI/UX i interfejs produktu dla bezpieczeństwa i automatyki budynków w Panamie',
	},
	'see-more': {
		en: 'See More Logistics branding — industrial logistics brand identity and motion design for B2B transport in Panama',
		es: 'Branding See More Logistics — identidad de marca y motion para logística industrial y transporte B2B en Panamá',
		pl: 'Branding See More Logistics — identyfikacja marki i motion dla logistyki przemysłowej i transportu B2B w Panamie',
	},
	'see-more-web': {
		en: 'See More Logistics B2B landing page — UI/UX design and web interface for Panamanian transport and logistics',
		es: 'Landing page B2B de See More Logistics — diseño UI/UX e interfaz web para transporte y logística en Panamá',
		pl: 'Landing page B2B See More Logistics — UI/UX i interfejs web dla transportu i logistyki w Panamie',
	},
	'snacks-lovers': {
		en: 'Snacks Lovers rebranding — FMCG snack brand identity and playful branding for American snacks e-commerce in Panama',
		es: 'Rebranding Snacks Lovers — identidad FMCG y branding para snacks americanos y e-commerce en Panamá',
		pl: 'Rebranding Snacks Lovers — identyfikacja FMCG i branding dla amerykańskich przekąsek i e-commerce w Panamie',
	},
	warszewicz: {
		en: 'Warszewicz AI-directed motion film — cultural storytelling connecting Polish botanical history and Panama',
		es: 'Film motion dirigido con IA sobre Warszewicz — narrativa cultural que conecta historia botánica polaca y Panamá',
		pl: 'Film motion z AI o Warszewiczu — narracja kulturowa łącząca polską historię botaniczną i Panamę',
	},
	'znicz-pruszkow': {
		en: 'Znicz Pruszków football club rebranding — sports branding, crest redesign and kit identity for Polish First League',
		es: 'Rebranding del club Znicz Pruszków — branding deportivo, rediseño de escudo e identidad de uniforme en Polonia',
		pl: 'Rebranding klubu Znicz Pruszków — branding sportowy, redesign herbu i identyfikacja strojów w Polsce',
	},
};

const CLIENT_LOGO_ALTS: Record<string, LocalizedAlt> = {
	'Epic Realty': {
		en: 'Epic Realty logo — luxury real estate branding client of Setin Studio',
		es: 'Logo de Epic Realty — cliente de branding para bienes raíces de lujo de Setin Studio',
		pl: 'Logo Epic Realty — klient brandingu luksusowych nieruchomości Setin Studio',
	},
	'See More Logistics': {
		en: 'See More Logistics logo — B2B logistics branding and UI/UX client of Setin Studio',
		es: 'Logo de See More Logistics — cliente de branding logístico B2B y UI/UX de Setin Studio',
		pl: 'Logo See More Logistics — klient brandingu logistyki B2B i UI/UX Setin Studio',
	},
	'Snacks Lovers': {
		en: 'Snacks Lovers logo — FMCG snack branding client of Setin Studio',
		es: 'Logo de Snacks Lovers — cliente de branding FMCG de Setin Studio',
		pl: 'Logo Snacks Lovers — klient brandingu FMCG Setin Studio',
	},
	Detalles: {
		en: 'Detalles logo — branding client of Setin Studio',
		es: 'Logo de Detalles — cliente de branding de Setin Studio',
		pl: 'Logo Detalles — klient brandingu Setin Studio',
	},
	Avendin: {
		en: 'Avendin logo — B2B smart vending branding client of Setin Studio',
		es: 'Logo de Avendin — cliente de branding B2B para vending inteligente de Setin Studio',
		pl: 'Logo Avendin — klient brandingu B2B inteligentnego vendigu Setin Studio',
	},
	'Andrea Vega': {
		en: 'Andrea Vega logo — branding client of Setin Studio',
		es: 'Logo de Andrea Vega — cliente de branding de Setin Studio',
		pl: 'Logo Andrea Vega — klient brandingu Setin Studio',
	},
	'NRV Control Systems': {
		en: 'NRV Control Systems logo — B2B security technology branding and UI/UX client of Setin Studio',
		es: 'Logo de NRV Control Systems — cliente de branding B2B y UI/UX en tecnología de seguridad de Setin Studio',
		pl: 'Logo NRV Control Systems — klient brandingu B2B i UI/UX technologii bezpieczeństwa Setin Studio',
	},
	'Mexi Munchies': {
		en: 'Mexi Munchies logo — FMCG snack branding client of Setin Studio',
		es: 'Logo de Mexi Munchies — cliente de branding FMCG de Setin Studio',
		pl: 'Logo Mexi Munchies — klient brandingu FMCG Setin Studio',
	},
	'TRG Abogada': {
		en: 'TRG Abogada logo — legal services branding client of Setin Studio',
		es: 'Logo de TRG Abogada — cliente de branding para servicios legales de Setin Studio',
		pl: 'Logo TRG Abogada — klient brandingu usług prawnych Setin Studio',
	},
	'Fiesta House': {
		en: 'Fiesta House logo — branding client of Setin Studio',
		es: 'Logo de Fiesta House — cliente de branding de Setin Studio',
		pl: 'Logo Fiesta House — klient brandingu Setin Studio',
	},
	'Znicz Pruszków': {
		en: 'Znicz Pruszków logo — sports branding client of Setin Studio',
		es: 'Logo de Znicz Pruszków — cliente de branding deportivo de Setin Studio',
		pl: 'Logo Znicz Pruszków — klient brandingu sportowego Setin Studio',
	},
	'Agencia Panamá Pacífico': {
		en: 'Agencia Panamá Pacífico logo — government economic zone branding client of Setin Studio',
		es: 'Logo de Agencia Panamá Pacífico — cliente de branding para zona económica gubernamental de Setin Studio',
		pl: 'Logo Agencia Panamá Pacífico — klient brandingu rządowej strefy ekonomicznej Setin Studio',
	},
	'WCR Kraków': {
		en: 'WCR Kraków logo — branding client of Setin Studio',
		es: 'Logo de WCR Kraków — cliente de branding de Setin Studio',
		pl: 'Logo WCR Kraków — klient brandingu Setin Studio',
	},
	Visioneer: {
		en: 'Visioneer logo — branding client of Setin Studio',
		es: 'Logo de Visioneer — cliente de branding de Setin Studio',
		pl: 'Logo Visioneer — klient brandingu Setin Studio',
	},
	ACLA: {
		en: 'ACLA logo — branding client of Setin Studio',
		es: 'Logo de ACLA — cliente de branding de Setin Studio',
		pl: 'Logo ACLA — klient brandingu Setin Studio',
	},
	Nesta: {
		en: 'Nesta logo — branding client of Setin Studio',
		es: 'Logo de Nesta — cliente de branding de Setin Studio',
		pl: 'Logo Nesta — klient brandingu Setin Studio',
	},
	'Pioneer Polska': {
		en: 'Pioneer Polska logo — branding client of Setin Studio',
		es: 'Logo de Pioneer Polska — cliente de branding de Setin Studio',
		pl: 'Logo Pioneer Polska — klient brandingu Setin Studio',
	},
	Hokofast: {
		en: 'Hokofast logo — branding client of Setin Studio',
		es: 'Logo de Hokofast — cliente de branding de Setin Studio',
		pl: 'Logo Hokofast — klient brandingu Setin Studio',
	},
	'Med Tracker IO': {
		en: 'Med Tracker IO logo — health-tech UI/UX and branding client of Setin Studio',
		es: 'Logo de Med Tracker IO — cliente de UI/UX y branding health-tech de Setin Studio',
		pl: 'Logo Med Tracker IO — klient UI/UX i brandingu health-tech Setin Studio',
	},
};

const GALLERY_SUFFIX: Record<Locale, (n: number) => string> = {
	en: (n) => ` — project visual ${n}`,
	es: (n) => ` — visual del proyecto ${n}`,
	pl: (n) => ` — wizual projektu ${n}`,
};

function pickAlt(alts: LocalizedAlt, locale: Locale = 'en'): string {
	return (alts[locale] || alts.en).trim();
}

function fallbackProjectAlt(
	project: { id: string; data: { title: string; client: string; industry?: string; service?: string; tags?: string[] } },
	locale: Locale,
): string {
	const { title, client, industry = '', service = '', tags = [] } = project.data;
	const focus = [service, tags.join(', ')].filter(Boolean).join(', ') || 'branding and UI/UX design';
	const vertical = industry || 'business';

	if (locale === 'es') {
		return `${client}: ${title} — branding, diseño UI/UX y plataforma digital para ${vertical}`;
	}
	if (locale === 'pl') {
		return `${client}: ${title} — branding, UI/UX i platforma cyfrowa dla branży ${vertical}`;
	}
	return `${client}: ${title} — branding, UI/UX design and digital platform for ${vertical}`;
}

export function getProjectImageAlts(project: {
	id: string;
	data: { title: string; client: string; industry?: string; service?: string; tags?: string[] };
}): LocalizedAlt {
	const custom = PROJECT_IMAGE_ALTS[project.id];
	if (custom) return custom;

	return {
		en: fallbackProjectAlt(project, 'en'),
		es: fallbackProjectAlt(project, 'es'),
		pl: fallbackProjectAlt(project, 'pl'),
	};
}

export function resolveProjectImageAlt(
	project: {
		id: string;
		data: { title: string; client: string; industry?: string; service?: string; tags?: string[] };
	},
	locale: Locale = 'en',
): string {
	return pickAlt(getProjectImageAlts(project), locale);
}

export function resolveGalleryImageAlt(
	project: {
		id: string;
		data: { title: string; client: string; industry?: string; service?: string; tags?: string[] };
	},
	index: number,
	locale: Locale = 'en',
): string {
	const base = resolveProjectImageAlt(project, locale);
	return `${base}${GALLERY_SUFFIX[locale](index + 1)}`;
}

export function getGalleryImageAlts(
	project: {
		id: string;
		data: { title: string; client: string; industry?: string; service?: string; tags?: string[] };
	},
	index: number,
): LocalizedAlt {
	return {
		en: resolveGalleryImageAlt(project, index, 'en'),
		es: resolveGalleryImageAlt(project, index, 'es'),
		pl: resolveGalleryImageAlt(project, index, 'pl'),
	};
}

export function getClientLogoAlts(name: string): LocalizedAlt {
	return (
		CLIENT_LOGO_ALTS[name] ?? {
			en: `${name} logo — branding and design client of Setin Studio`,
			es: `Logo de ${name} — cliente de branding y diseño de Setin Studio`,
			pl: `Logo ${name} — klient brandingu i designu Setin Studio`,
		}
	);
}

export function resolveClientLogoAlt(name: string, locale: Locale = 'en'): string {
	return pickAlt(getClientLogoAlts(name), locale);
}

export const STUDIO_LOGO_ALTS: LocalizedAlt = {
	en: 'Setin Studio logo — branding, UI/UX design and B2B digital platforms',
	es: 'Logo de Setin Studio — branding, diseño UI/UX y plataformas digitales B2B',
	pl: 'Logo Setin Studio — branding, UI/UX i platformy cyfrowe B2B',
};

export const FOUNDERS_PHOTO_ALTS: LocalizedAlt = {
	en: 'Krzysztof and Jakub Bartosik, founders of Setin Studio — branding and UI/UX design studio',
	es: 'Krzysztof y Jakub Bartosik, fundadores de Setin Studio — estudio de branding y diseño UI/UX',
	pl: 'Krzysztof i Jakub Bartosik, założyciele Setin Studio — studio brandingu i UI/UX',
};

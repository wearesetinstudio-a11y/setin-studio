import {
	animatePageTransitionCover,
	animatePageTransitionReveal,
} from './pageTransitionPanel.ts';
import {
	defaultLocale,
	dictionaries,
	isLocale,
	t,
	type Locale,
} from '../i18n/dictionaries.ts';
import {
	absoluteUrl,
	buildLocalePath,
	getLocaleFromPath,
	htmlLang,
	localeFromHtmlLang,
	stripLocalePrefix,
} from '../i18n/seo.ts';
import { applyProjectCopy } from './initProjectCopy.ts';

export const LANG_STORAGE_KEY = 'setin-lang';

type I18nWindow = Window &
	typeof globalThis & {
		__setinLangChanging?: boolean;
		__setinI18nReady?: boolean;
	};

function getWindow(): I18nWindow {
	return window as I18nWindow;
}

function rewrapRevealLine(element: HTMLElement) {
	const text = element.textContent ?? '';
	element.textContent = '';

	for (const char of text) {
		const span = document.createElement('span');
		span.className = 'reveal-char';
		span.textContent = char === ' ' ? ' ' : char;
		element.appendChild(span);
	}
}

function closeMobileNavIfOpen() {
	const toggle = document.getElementById('mobile-nav-toggle');
	const panel = document.getElementById('mobile-nav-panel');
	if (!toggle || !panel || !panel.classList.contains('is-open')) return;

	toggle.click();
}

function syncLocaleUrl(locale: Locale) {
	const nextPath = buildLocalePath(locale, window.location.pathname);
	const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
	const normalizedNext = nextPath.replace(/\/$/, '') || '/';
	if (currentPath === normalizedNext) return;

	const url = `${nextPath}${window.location.search}${window.location.hash}`;
	window.history.replaceState(window.history.state, '', url);
}

function syncCanonicalLink(locale: Locale) {
	const link = document.getElementById('canonical-url');
	if (!link) return;
	link.setAttribute('href', absoluteUrl(buildLocalePath(locale, window.location.pathname)));
}

const ES_OG_TITLE = 'Setin Studio | Estudio de Diseño Web y Branding en Panamá';

function upsertHeadMeta(attr: 'name' | 'property', key: string, content: string | null) {
	const selector = `meta[${attr}="${key}"]`;
	const existing = document.head.querySelector<HTMLMetaElement>(selector);
	if (!content) {
		existing?.remove();
		return;
	}
	const node = existing ?? document.createElement('meta');
	if (!existing) {
		node.setAttribute(attr, key);
		document.head.appendChild(node);
	}
	node.setAttribute('content', content);
}

/** Panama geo + Spanish Open Graph tags for /es/ (and client locale switch). */
function syncSpanishHeadMeta(locale: Locale) {
	const bare = stripLocalePrefix(window.location.pathname);
	const isHome = bare === '/' || bare === '';

	if (locale === 'es') {
		upsertHeadMeta('name', 'geo.region', 'PA');
		upsertHeadMeta('name', 'geo.placename', 'Panama City');
		upsertHeadMeta('property', 'og:locale', 'es_PA');
		upsertHeadMeta('property', 'og:title', isHome ? ES_OG_TITLE : document.title);
		return;
	}

	upsertHeadMeta('name', 'geo.region', null);
	upsertHeadMeta('name', 'geo.placename', null);
	upsertHeadMeta('property', 'og:locale', null);
	upsertHeadMeta('property', 'og:title', document.title);
}

/** Keep internal links on the active locale so View Transitions don't drop /es|/pl. */
function rewriteLocaleLinks(locale: Locale) {
	document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((anchor) => {
		if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

		const raw = anchor.getAttribute('href');
		if (!raw || raw.startsWith('//')) return;
		if (/\.(svg|png|jpe?g|webp|gif|mp4|webm|pdf|zip)(\?|#|$)/i.test(raw)) return;

		let url: URL;
		try {
			url = new URL(raw, window.location.origin);
		} catch {
			return;
		}

		const nextPath = buildLocalePath(locale, url.pathname);
		const nextHref = `${nextPath}${url.search}${url.hash}`;
		if (raw !== nextHref) {
			anchor.setAttribute('href', nextHref);
		}
	});
}

export function getCurrentLocale(): Locale {
	const path = window.location.pathname;
	if (/^\/(pl|es)(?=\/|$)/.test(path)) {
		return getLocaleFromPath(path);
	}

	try {
		const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
		if (isLocale(stored)) return stored;
	} catch {
		/* ignore */
	}

	const fromHtml = localeFromHtmlLang(document.documentElement.lang);
	if (fromHtml) return fromHtml;

	return defaultLocale;
}

export function applyTranslations(locale: Locale = getCurrentLocale()) {
	const dict = dictionaries[locale];

	document.documentElement.lang = htmlLang(locale);

	try {
		window.localStorage.setItem(LANG_STORAGE_KEY, locale);
	} catch {
		/* ignore */
	}

	syncLocaleUrl(locale);
	syncCanonicalLink(locale);
	rewriteLocaleLinks(locale);
	syncSpanishHeadMeta(locale);

	document.querySelectorAll<HTMLElement>('[data-project-titles]').forEach((card) => {
		let titles: Partial<Record<Locale, string>> = {};
		try {
			titles = JSON.parse(card.dataset.projectTitles || '{}') as Partial<Record<Locale, string>>;
		} catch {
			return;
		}

		const next = (titles[locale] || titles.en || '').trim();
		if (!next) return;

		const display = next.toUpperCase();
		card.querySelectorAll('[data-project-title-text]').forEach((node) => {
			node.textContent = display;
		});

		const mediaLabel = card.querySelector<HTMLElement>('img[alt], canvas[aria-label]');
		if (mediaLabel) {
			if (mediaLabel instanceof HTMLImageElement) mediaLabel.alt = next;
			else mediaLabel.setAttribute('aria-label', next);
		}

		if (card.dataset.comingSoon === 'true') {
			card.setAttribute('aria-label', `${next} — ${t(locale, 'projects.soon')}`);
		}
	});

	document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
		const key = element.dataset.i18n;
		if (!key) return;
		const value = dict[key] ?? dictionaries.en[key];
		if (value == null) return;

		if (element.dataset.i18nHtml === 'true') {
			if (element.innerHTML !== value) {
				element.innerHTML = value;
			}
			return;
		}

		const currentText = (element.textContent ?? '').replace(/\u00a0/g, ' ').trim();
		const nextText = value.trim();
		const alreadyWrapped =
			element.hasAttribute('data-reveal-line') && !!element.querySelector('.reveal-char');

		if (currentText === nextText && (!element.hasAttribute('data-reveal-line') || alreadyWrapped)) {
			return;
		}

		element.textContent = value;

		if (element.hasAttribute('data-reveal-line')) {
			rewrapRevealLine(element);
		}
	});

	document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((element) => {
		const key = element.dataset.i18nAria;
		if (!key) return;
		const value = dict[key] ?? dictionaries.en[key];
		if (value == null) return;
		element.setAttribute('aria-label', value);
	});

	document.querySelectorAll<HTMLElement>('[data-i18n-count]').forEach((element) => {
		const key = element.dataset.i18nCount;
		const count = element.dataset.count;
		if (!key || count == null) return;
		const label = dict[key] ?? dictionaries.en[key];
		if (label == null) return;
		element.textContent = `${label} [${count}]`;
	});

	document.querySelectorAll<HTMLElement>('[data-language-switcher]').forEach((switcher) => {
		switcher.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((button) => {
			const active = button.dataset.lang === locale;
			button.setAttribute('aria-pressed', active ? 'true' : 'false');
		});
	});

	document.querySelectorAll('.project-cursor__label').forEach((label) => {
		const line = label.querySelector('.project-cursor__line');
		const textSpan = label.querySelector<HTMLElement>('[data-project-cursor-label], [data-i18n]');
		if (textSpan) {
			const key = textSpan.dataset.i18n || 'projects.view';
			textSpan.textContent = t(locale, key);
			return;
		}

		const viewLabel = t(locale, 'projects.view');
		label.childNodes.forEach((node) => {
			if (node.nodeType === Node.TEXT_NODE) {
				node.textContent = ` ${viewLabel} `;
			}
		});
		if (line && !label.contains(line)) {
			label.appendChild(line);
		}
	});

	const toggle = document.getElementById('mobile-nav-toggle');
	if (toggle) {
		const open = toggle.classList.contains('is-open');
		const ariaKey = open ? 'nav.closeMenu' : 'nav.openMenu';
		const aria = dict[ariaKey] ?? dictionaries.en[ariaKey];
		if (aria) toggle.setAttribute('aria-label', aria);
	}

	applyProjectCopy(locale);

	window.dispatchEvent(new CustomEvent('setin:language-change', { detail: { lang: locale } }));
}

export async function changeLanguage(nextLocale: string) {
	if (!isLocale(nextLocale)) return;

	const current = getCurrentLocale();
	if (nextLocale === current) return;

	const win = getWindow();
	if (win.__setinLangChanging) return;
	win.__setinLangChanging = true;

	try {
		closeMobileNavIfOpen();
		await animatePageTransitionCover();

		try {
			window.localStorage.setItem(LANG_STORAGE_KEY, nextLocale);
		} catch {
			/* ignore */
		}

		applyTranslations(nextLocale);
		await new Promise((resolve) => window.setTimeout(resolve, 80));

		await animatePageTransitionReveal();
	} finally {
		win.__setinLangChanging = false;
	}
}

export function initI18n() {
	const win = getWindow();
	applyTranslations(getCurrentLocale());

	if (win.__setinI18nReady) return;
	win.__setinI18nReady = true;

	document.addEventListener('click', (event) => {
		const target = event.target as HTMLElement | null;
		const button = target?.closest<HTMLButtonElement>('[data-language-switcher] [data-lang]');
		if (!button?.dataset.lang) return;
		event.preventDefault();
		void changeLanguage(button.dataset.lang);
	});

	// Capture-phase: rewrite locale on click before Astro ClientRouter navigates.
	document.addEventListener(
		'click',
		(event) => {
			const target = event.target as HTMLElement | null;
			const anchor = target?.closest<HTMLAnchorElement>('a[href^="/"]');
			if (!anchor || anchor.target === '_blank' || event.defaultPrevented) return;
			if (anchor.closest('[data-language-switcher]')) return;

			const raw = anchor.getAttribute('href');
			if (!raw || raw.startsWith('//')) return;
			if (/\.(svg|png|jpe?g|webp|gif|mp4|webm|pdf|zip)(\?|#|$)/i.test(raw)) return;

			const locale = getCurrentLocale();
			let url: URL;
			try {
				url = new URL(raw, window.location.origin);
			} catch {
				return;
			}

			const nextPath = buildLocalePath(locale, url.pathname);
			const nextHref = `${nextPath}${url.search}${url.hash}`;
			if (raw !== nextHref) {
				anchor.setAttribute('href', nextHref);
			}
		},
		true,
	);

	// After Astro view transitions the new page ships with lang="en" — restore from URL/storage.
	document.addEventListener('astro:after-swap', () => {
		applyTranslations(getCurrentLocale());
	});

	// Prefer stored locale when the swapped URL has no /es|/pl prefix yet.
	document.addEventListener('astro:before-preparation', () => {
		try {
			const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
			if (isLocale(stored)) {
				document.documentElement.lang = htmlLang(stored);
			}
		} catch {
			/* ignore */
		}
	});

	window.addEventListener('popstate', () => {
		applyTranslations(getCurrentLocale());
	});
}

export { stripLocalePrefix, buildLocalePath };

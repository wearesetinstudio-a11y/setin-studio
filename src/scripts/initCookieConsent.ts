import { waitForPageReveal } from './lineSlideUpReveal.ts';

const GA_ID = 'G-9KWWVCQ97C';
export const COOKIE_CONSENT_KEY = 'setin-cookie-consent';

export type CookieConsent = 'analytics' | 'necessary';

type ConsentWindow = Window &
	typeof globalThis & {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
		__setinGaLoaded?: boolean;
	};

let showTimer = 0;

function getWindow(): ConsentWindow {
	return window as ConsentWindow;
}

export function getCookieConsent(): CookieConsent | null {
	try {
		const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
		if (value === 'analytics' || value === 'necessary') return value;
	} catch {
		/* ignore */
	}
	return null;
}

function setCookieConsent(value: CookieConsent) {
	try {
		window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
	} catch {
		/* ignore */
	}
}

export function loadGoogleAnalytics() {
	const win = getWindow();
	if (win.__setinGaLoaded) return;
	win.__setinGaLoaded = true;

	win.dataLayer = win.dataLayer || [];
	function gtag(..._args: unknown[]) {
		win.dataLayer?.push(arguments);
	}
	win.gtag = gtag;
	gtag('js', new Date());
	gtag('config', GA_ID, { anonymize_ip: true });

	if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`)) return;

	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
	document.head.appendChild(script);
}

function hideBanner(banner: HTMLElement) {
	window.clearTimeout(showTimer);
	banner.classList.remove('is-visible');
	banner.setAttribute('aria-hidden', 'true');
}

function showBanner(banner: HTMLElement) {
	if (getCookieConsent()) return;
	banner.setAttribute('aria-hidden', 'false');
	requestAnimationFrame(() => {
		banner.classList.add('is-visible');
	});
}

function cssVarNumber(element: HTMLElement, name: string): number {
	const raw = element.style.getPropertyValue(name) || getComputedStyle(element).getPropertyValue(name);
	const value = Number.parseFloat(raw);
	return Number.isFinite(value) ? value : 0;
}

function heroRevealDurationMs(): number {
	let max = 0;

	document.querySelectorAll<HTMLElement>('.hero-reveal-line').forEach((element) => {
		max = Math.max(max, 1200 + cssVarNumber(element, '--i') * 90);
	});

	document.querySelectorAll<HTMLElement>('.hero-reveal-desc-line').forEach((element) => {
		max = Math.max(max, 1480 + cssVarNumber(element, '--i') * 140);
	});

	document.querySelectorAll<HTMLElement>('.hero-service').forEach((element) => {
		max = Math.max(max, 1180 + cssVarNumber(element, '--i') * 100);
	});

	const client = document.querySelector<HTMLElement>('[data-project-hero-client]');
	if (client) {
		max = Math.max(max, 1180 + cssVarNumber(client, '--client-i') * 90);
	}

	const header = document.getElementById('site-header');
	if (header?.dataset.waitIntro === 'true') {
		const navCount = header.querySelectorAll('.site-header__nav > *').length;
		max = Math.max(max, 550 + navCount * 75);
	}

	return max > 0 ? max + 180 : 420;
}

function afterHeroHasAppeared(callback: () => void) {
	const start = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				window.clearTimeout(showTimer);
				showTimer = window.setTimeout(callback, heroRevealDurationMs());
			});
		});
	};

	if (document.documentElement.classList.contains('intro-pending')) {
		window.addEventListener('intro-complete', start, { once: true });
		return;
	}

	waitForPageReveal(start);
}

function bindBannerActions(banner: HTMLElement) {
	if (banner.dataset.cookieInit === 'true') return;
	banner.dataset.cookieInit = 'true';

	banner.querySelector<HTMLButtonElement>('[data-cookie-accept]')?.addEventListener('click', () => {
		setCookieConsent('analytics');
		loadGoogleAnalytics();
		hideBanner(banner);
	});

	banner.querySelector<HTMLButtonElement>('[data-cookie-necessary]')?.addEventListener('click', () => {
		setCookieConsent('necessary');
		hideBanner(banner);
	});
}

export function initCookieConsent() {
	const banner = document.getElementById('cookie-banner');
	if (!banner) return;

	const consent = getCookieConsent();
	if (consent === 'analytics') {
		loadGoogleAnalytics();
		hideBanner(banner);
		return;
	}
	if (consent === 'necessary') {
		hideBanner(banner);
		return;
	}

	bindBannerActions(banner);

	if (banner.classList.contains('is-visible')) return;

	afterHeroHasAppeared(() => showBanner(banner));
}

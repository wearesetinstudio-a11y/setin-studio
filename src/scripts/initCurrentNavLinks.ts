import { stripLocalePrefix } from '../i18n/seo.ts';
import { isActiveNavHref, normalizeNavPath } from '../utils/isActiveNavHref.ts';

function currentBarePath(): string {
	return normalizeNavPath(stripLocalePrefix(window.location.pathname));
}

export function syncCurrentNavLinks() {
	const barePath = currentBarePath();

	document.querySelectorAll<HTMLElement>('[data-nav-href]').forEach((el) => {
		const href = el.getAttribute('data-nav-href') ?? '';
		const exact = el.getAttribute('data-nav-exact') === 'true';
		const isCurrent = exact
			? normalizeNavPath(href) === barePath
			: isActiveNavHref(href, barePath);

		const isMobile = el.classList.contains('mobile-nav-link');
		el.classList.toggle(isMobile ? 'mobile-nav-link--current' : 'rolling-link--current', isCurrent);

		if (isCurrent) el.setAttribute('aria-current', 'page');
		else el.removeAttribute('aria-current');
	});
}

export function initCurrentNavLinks() {
	syncCurrentNavLinks();
}

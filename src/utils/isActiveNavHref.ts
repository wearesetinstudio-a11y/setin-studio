/** Normalize path for nav matching (no trailing slash, locale already stripped). */
export function normalizeNavPath(pathname: string): string {
	const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
	const trimmed = clean.replace(/\/$/, '') || '/';
	return trimmed;
}

/**
 * Whether a nav/footer href matches the current bare path.
 * Exact match only — `/projects` is active on `/projects`, not `/projects/slug`.
 */
export function isActiveNavHref(href: string, barePath: string): boolean {
	if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) {
		return false;
	}

	const path = normalizeNavPath(barePath);
	const target = normalizeNavPath(href);

	return path === target;
}

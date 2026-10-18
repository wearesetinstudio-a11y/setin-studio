import { DEFAULT_THEME_COLOR } from '../data/pitchThemes.ts';

type ThemeWindow = Window &
	typeof globalThis & {
		__setinThemeColors?: Record<string, string>;
	};

export function getThemeColorMap(): Record<string, string> {
	return (window as ThemeWindow).__setinThemeColors ?? {};
}

export function normalizeThemePath(pathname: string): string {
	return pathname.replace(/\/$/, '') || '/';
}

export function lookupThemeColor(pathname: string): string {
	const map = getThemeColorMap();
	const path = normalizeThemePath(pathname);
	return map[path] || DEFAULT_THEME_COLOR;
}

/** Paint page-transition bars with the destination (or current) theme color. */
export function applyTransitionThemeColor(color: string) {
	const overlay = document.getElementById('page-transition-overlay');
	if (!overlay) return;
	const value = color?.trim() || DEFAULT_THEME_COLOR;
	overlay.style.setProperty('--page-transition-bg', value);
	overlay.querySelectorAll<HTMLElement>('.page-transition-bar').forEach((bar) => {
		bar.style.backgroundColor = value;
	});
}

export function applyDocumentThemeColor(color: string) {
	const value = color?.trim() || DEFAULT_THEME_COLOR;
	document.documentElement.style.setProperty('--theme-color', value);
	document.body?.style.setProperty('--theme-color', value);
	applyTransitionThemeColor(value);
}

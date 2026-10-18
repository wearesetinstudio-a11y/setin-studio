import { getCollection } from 'astro:content';
import { DEFAULT_THEME_COLOR, pitchThemes } from '../data/pitchThemes.ts';

/** Pathname → leading chrome color (nav / footer / preloader). */
export async function buildThemeColorMap(): Promise<Record<string, string>> {
	const map: Record<string, string> = {
		'/': DEFAULT_THEME_COLOR,
		'/about': DEFAULT_THEME_COLOR,
		'/services': DEFAULT_THEME_COLOR,
		'/projects': DEFAULT_THEME_COLOR,
	};

	for (const [slug, color] of Object.entries(pitchThemes)) {
		map[`/pitches/${slug}`] = color;
	}

	const projects = await getCollection('projects');
	for (const project of projects) {
		if (project.data.comingSoon) continue;
		const color = project.data.themeColor?.trim() || DEFAULT_THEME_COLOR;
		map[`/projects/${project.id}`] = color;
		map[`/pl/projects/${project.id}`] = color;
		map[`/es/projects/${project.id}`] = color;
	}

	return map;
}

export function normalizeThemePath(pathname: string): string {
	const path = pathname.replace(/\/$/, '') || '/';
	return path;
}

export function lookupThemeColor(
	map: Record<string, string>,
	pathname: string,
): string {
	const path = normalizeThemePath(pathname);
	return map[path] || DEFAULT_THEME_COLOR;
}

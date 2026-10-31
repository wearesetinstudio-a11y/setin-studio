/** Leading chrome color per pitch (navbar / footer / preloader). */
export const pitchThemes = {
	'toros-dechiriqui': '#0b140f',
} as const;

export type PitchSlug = keyof typeof pitchThemes;

export const DEFAULT_THEME_COLOR = '#0A0A0B';

export function themeColorForPath(pathname: string): string {
	const path = pathname.replace(/\/$/, '') || '/';
	const pitch = path.match(/^\/pitches\/([^/]+)/);
	if (pitch) {
		const slug = pitch[1] as PitchSlug;
		if (slug in pitchThemes) return pitchThemes[slug];
	}
	const project = path.match(/^\/(?:pl\/|es\/)?projects\/([^/]+)/);
	if (project) {
		/* Filled at runtime from the build-time map when available. */
		return DEFAULT_THEME_COLOR;
	}
	return DEFAULT_THEME_COLOR;
}

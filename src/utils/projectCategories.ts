/** Fixed portfolio categories — alphabetical order for filters and labels. */
export const PROJECT_CATEGORIES = [
	'AI Direction',
	'Brand Design',
	'Engineering',
	'Motion',
	'Product Design',
	'Websites',
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export function isProjectCategory(value: string): value is ProjectCategory {
	return (PROJECT_CATEGORIES as readonly string[]).includes(value);
}

export function normalizeProjectCategories(tags: readonly string[]): ProjectCategory[] {
	return PROJECT_CATEGORIES.filter((category) =>
		tags.some((tag) => tag.trim().toLowerCase() === category.toLowerCase()),
	);
}

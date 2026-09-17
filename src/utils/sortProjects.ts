import type { CollectionEntry } from 'astro:content';

export function sortProjects(projects: CollectionEntry<'projects'>[]) {
	return [...projects].sort((a, b) => {
		const soon = Number(Boolean(a.data.comingSoon)) - Number(Boolean(b.data.comingSoon));
		if (soon !== 0) return soon;
		return a.data.order - b.data.order;
	});
}

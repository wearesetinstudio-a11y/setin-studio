import type { CollectionEntry } from 'astro:content';

export function sortProjects(projects: CollectionEntry<'projects'>[]) {
	return [...projects].sort((a, b) => {
		const isNew = Number(Boolean(b.data.isNew)) - Number(Boolean(a.data.isNew));
		if (isNew !== 0) return isNew;
		const soon = Number(Boolean(a.data.comingSoon)) - Number(Boolean(b.data.comingSoon));
		if (soon !== 0) return soon;
		return a.data.order - b.data.order;
	});
}

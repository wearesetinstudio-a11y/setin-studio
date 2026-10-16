import { getCollection } from 'astro:content';

export async function getSiteCounts() {
	const projects = await getCollection('projects');

	return {
		projectCount: projects.length,
	};
}

import { getCollection } from 'astro:content';

export async function projectPagePaths() {
	const projects = await getCollection('projects');

	return projects
		.filter((project) => !project.data.comingSoon)
		.map((project) => ({
			params: { slug: project.id },
			props: {
				project,
				projectCount: projects.length,
			},
		}));
}

import { getCollection } from 'astro:content';

/** Public path root for article-only media (separate from project `portfolio/`). */
export const ARTICLE_MEDIA_DIR = 'articles';

export function getArticleMediaPath(articleSlug: string, filename: string): string {
	return `/${ARTICLE_MEDIA_DIR}/${articleSlug}/${filename}`;
}

export async function getSortedArticles() {
	const articles = await getCollection('articles');
	return articles.sort((a, b) => a.data.order - b.data.order);
}

export function formatArticleDate(date: Date): string {
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = String(date.getFullYear()).slice(-2);
	return `${day}/${month}/${year}`;
}

export function formatArticleMonthYear(date: Date, locale = 'en-US'): string {
	return new Intl.DateTimeFormat(locale, {
		month: 'long',
		year: 'numeric',
	}).format(date);
}

export function resolveArticleProjectHref(
	relatedProject: string,
	projectSlugs: ReadonlySet<string>,
	categoryHref = '',
): string {
	if (relatedProject && projectSlugs.has(relatedProject)) {
		return `/projects/${relatedProject}`;
	}

	const legacyMatch = categoryHref.match(/^\/projects\/([^/]+)\/?$/);
	if (legacyMatch?.[1] && projectSlugs.has(legacyMatch[1])) {
		return `/projects/${legacyMatch[1]}`;
	}

	return '';
}

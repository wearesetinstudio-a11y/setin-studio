import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const MEDIA_EXTENSIONS = new Set(['.webp', '.mp4', '.webm']);
const DEFAULT_EXCLUDED = new Set(['bg.webp']);
const PROJECT_MEDIA_DIR = 'portfolio';

function isVideoExtension(extension: string): boolean {
	return extension === '.mp4' || extension === '.webm';
}

export type GalleryMediaItem =
	| { type: 'image'; src: string; filename: string }
	| { type: 'video'; src: string; filename: string };

export type GalleryLayoutBlock =
	| { kind: 'full'; item: GalleryMediaItem; group: number }
	| { kind: 'grid'; items: GalleryMediaItem[]; group: number; leadFull?: boolean };

type ParsedMediaFile = GalleryMediaItem & {
	group: number;
	part: number | null;
};

const FILE_PATTERN = /^(\d+)(?:\.(\d+))?\.(webp|mp4|webm)$/i;
const MAX_SECTION_PARTS = 4;

export function getCoverFilename(thumbnail: string): string {
	return thumbnail.split('/').pop() ?? 'cover.webp';
}

export function resolveProjectFolderName(project: {
	id: string;
	data: { folderName?: string };
}): string {
	return project.data.folderName ?? project.id;
}

function parseMediaFilename(filename: string): ParsedMediaFile | null {
	const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
	if (!MEDIA_EXTENSIONS.has(extension)) return null;

	const match = filename.match(FILE_PATTERN);
	if (!match) return null;

	const group = Number(match[1]);
	const part = match[2] ? Number(match[2]) : null;
	const mediaType = isVideoExtension(extension) ? 'video' : 'image';

	return {
		type: mediaType,
		src: '',
		filename,
		group,
		part,
	};
}

function toMediaItem(folderName: string, filename: string, type: 'image' | 'video'): GalleryMediaItem {
	return {
		type,
		filename,
		src: `/${PROJECT_MEDIA_DIR}/${folderName}/${filename}`,
	};
}

export function getProjectGalleryFiles(
	folderName: string,
	coverFilename = 'cover.webp',
	excludedFilenames: string[] = [],
): GalleryMediaItem[] {
	const portfolioDir = join(process.cwd(), 'public', PROJECT_MEDIA_DIR, folderName);
	const excluded = new Set([coverFilename, ...DEFAULT_EXCLUDED, ...excludedFilenames]);

	try {
		return readdirSync(portfolioDir)
			.filter((filename) => {
				if (excluded.has(filename)) return false;
				const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
				return MEDIA_EXTENSIONS.has(extension);
			})
			.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
			.map((filename) => {
				const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
				return toMediaItem(folderName, filename, isVideoExtension(extension) ? 'video' : 'image');
			});
	} catch {
		return [];
	}
}

export function buildGalleryLayout(
	folderName: string,
	coverFilename = 'cover.webp',
	excludedFilenames: string[] = [],
): GalleryLayoutBlock[] {
	const portfolioDir = join(process.cwd(), 'public', PROJECT_MEDIA_DIR, folderName);
	const excluded = new Set([coverFilename, ...DEFAULT_EXCLUDED, ...excludedFilenames]);

	try {
		const parsedFiles = readdirSync(portfolioDir)
			.map((filename) => {
				if (excluded.has(filename)) return null;
				const parsed = parseMediaFilename(filename);
				if (!parsed) return null;

				const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
				return {
					...parsed,
					src: `/${PROJECT_MEDIA_DIR}/${folderName}/${filename}`,
					type: isVideoExtension(extension) ? ('video' as const) : ('image' as const),
				};
			})
			.filter((file): file is ParsedMediaFile => file !== null)
			.sort((a, b) => {
				if (a.group !== b.group) return a.group - b.group;
				return (a.part ?? 0) - (b.part ?? 0);
			});

		const groups = new Map<number, ParsedMediaFile[]>();

		for (const file of parsedFiles) {
			const existing = groups.get(file.group) ?? [];
			existing.push(file);
			groups.set(file.group, existing);
		}

		const layout: GalleryLayoutBlock[] = [];

		for (const group of [...groups.keys()].sort((a, b) => a - b)) {
			const files = groups.get(group) ?? [];
			const parts = files.filter((file) => file.part !== null);
			const singles = files.filter((file) => file.part === null);

			if (parts.length > 0) {
				const items = [
					...singles.map((single) => toMediaItem(folderName, single.filename, single.type)),
					...parts.map((part) => toMediaItem(folderName, part.filename, part.type)),
				];

				layout.push({
					kind: 'grid',
					group,
					items,
					leadFull: singles.length > 0,
				});
				continue;
			}

			for (const single of singles) {
				layout.push({
					kind: 'full',
					group,
					item: toMediaItem(folderName, single.filename, single.type),
				});
			}
		}

		if (layout.length > 0) return layout;

		return getProjectGalleryFiles(folderName, coverFilename, excludedFilenames).map((item, index) => ({
			kind: 'full' as const,
			group: index + 1,
			item,
		}));
	} catch {
		return [];
	}
}

export function getOverviewGraphic(
	folderName: string,
	coverFilename = 'cover.webp',
	excludedFilenames: string[] = [],
): GalleryMediaItem | null {
	const sectionMedia = getSectionMedia(folderName, 1, coverFilename, excludedFilenames);
	return sectionMedia[0] ?? null;
}

/**
 * Media for one case-study section (group N).
 * Accepts `N.webp` / `N.mp4` and up to four parts: `N.1` … `N.4`.
 */
export function getSectionMedia(
	folderName: string,
	group: number,
	coverFilename = 'cover.webp',
	excludedFilenames: string[] = [],
): GalleryMediaItem[] {
	if (group < 1 || group > 10) return [];

	const portfolioDir = join(process.cwd(), 'public', PROJECT_MEDIA_DIR, folderName);
	const excluded = new Set([coverFilename, ...DEFAULT_EXCLUDED, ...excludedFilenames]);

	try {
		const parsed = readdirSync(portfolioDir)
			.map((filename) => {
				if (excluded.has(filename)) return null;
				const match = parseMediaFilename(filename);
				if (!match || match.group !== group) return null;
				if (match.part !== null && (match.part < 1 || match.part > MAX_SECTION_PARTS)) return null;

				const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
				return {
					...match,
					src: `/${PROJECT_MEDIA_DIR}/${folderName}/${filename}`,
					type: isVideoExtension(extension) ? ('video' as const) : ('image' as const),
				};
			})
			.filter((file): file is ParsedMediaFile => file !== null)
			.sort((a, b) => {
				const partA = a.part ?? 0;
				const partB = b.part ?? 0;
				return partA - partB;
			});

		const items: GalleryMediaItem[] = [];
		for (const file of parsed) {
			items.push(toMediaItem(folderName, file.filename, file.type));
			if (items.length >= MAX_SECTION_PARTS) break;
		}
		return items;
	} catch {
		return [];
	}
}

/** @deprecated Use buildGalleryLayout instead */
export function getProjectGallery(folderName: string, coverFilename = 'cover.webp'): GalleryMediaItem[] {
	return getProjectGalleryFiles(folderName, coverFilename);
}

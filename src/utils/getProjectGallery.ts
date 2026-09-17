import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const MEDIA_EXTENSIONS = new Set(['.webp', '.mp4', '.webm']);
const DEFAULT_EXCLUDED = new Set(['bg.webp', 'bg.opt.webp']);
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

const FILE_PATTERN = /^(\d+)(?:[._](\d+))?\.(webp|mp4|webm)$/i;
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

/** Prefer `1.2.webp` over `1_2.webp` when both exist. */
function uniqueMediaFilenames(filenames: string[]): string[] {
	const set = new Set(filenames);
	return filenames.filter((name) => {
		const underscored = name.match(/^(\d+)_(\d+)\.(webp|mp4|webm)$/i);
		if (!underscored) return true;
		const dotted = `${underscored[1]}.${underscored[2]}.${underscored[3]}`;
		return !set.has(dotted);
	});
}

function toBlockItem(file: ParsedMediaFile, folderName: string): GalleryMediaItem {
	return toMediaItem(folderName, file.filename, file.type);
}

/**
 * Right-column gallery rhythm:
 * X.webp / X.1 / X.4 → full width
 * X.2 + X.3 → side by side; if only one exists → full width
 */
function layoutGroup(
	folderName: string,
	group: number,
	files: ParsedMediaFile[],
): GalleryLayoutBlock[] {
	const blocks: GalleryLayoutBlock[] = [];
	const singles = files.filter((file) => file.part === null);
	const byPart = new Map<number, ParsedMediaFile>();

	for (const file of files) {
		if (file.part != null) byPart.set(file.part, file);
	}

	for (const single of singles) {
		blocks.push({ kind: 'full', group, item: toBlockItem(single, folderName) });
	}

	const part1 = byPart.get(1);
	const part2 = byPart.get(2);
	const part3 = byPart.get(3);
	const part4 = byPart.get(4);

	if (part1) {
		blocks.push({ kind: 'full', group, item: toBlockItem(part1, folderName) });
	}

	if (part2 && part3) {
		blocks.push({
			kind: 'grid',
			group,
			items: [toBlockItem(part2, folderName), toBlockItem(part3, folderName)],
		});
	} else if (part2) {
		blocks.push({ kind: 'full', group, item: toBlockItem(part2, folderName) });
	} else if (part3) {
		blocks.push({ kind: 'full', group, item: toBlockItem(part3, folderName) });
	}

	if (part4) {
		blocks.push({ kind: 'full', group, item: toBlockItem(part4, folderName) });
	}

	return blocks;
}

export function getProjectGalleryFiles(
	folderName: string,
	coverFilename = 'cover.webp',
	excludedFilenames: string[] = [],
): GalleryMediaItem[] {
	const portfolioDir = join(process.cwd(), 'public', PROJECT_MEDIA_DIR, folderName);
	const excluded = new Set([coverFilename, ...DEFAULT_EXCLUDED, ...excludedFilenames]);

	try {
		return uniqueMediaFilenames(readdirSync(portfolioDir))
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
		const parsedFiles = uniqueMediaFilenames(readdirSync(portfolioDir))
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
			layout.push(...layoutGroup(folderName, group, files));
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
 * Accepts `N.webp` / `N.mp4` and up to four parts: `N.1` / `N_1` … `N.4`.
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
		const parsed = uniqueMediaFilenames(readdirSync(portfolioDir))
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

import type { GalleryMediaItem } from './getProjectGallery';
import { getSectionMedia } from './getProjectGallery';

export type ProjectCaseBlock = {
	title: string;
	text: string;
};

export type ProjectCaseSectionInput = {
	label: string;
	title?: string;
	text?: string;
	blocks?: ProjectCaseBlock[];
};

export type ProjectCaseSection = {
	index: number;
	label: string;
	title: string;
	text: string;
	blocks: ProjectCaseBlock[];
	media: GalleryMediaItem[];
	isOverview: boolean;
	isResults: boolean;
};

type ProjectCaseData = {
	overviewLabel?: string;
	overviewTitle?: string;
	overviewText?: string;
	challengesLabel?: string;
	challengesText?: string;
	strategyLabel?: string;
	strategyTitle?: string;
	strategyText?: string;
	summaryLabel?: string;
	summaryTitle?: string;
	summaryText?: string;
	sections?: ProjectCaseSectionInput[];
};

const MAX_SECTIONS = 10;

function paragraphsFromText(text: string): string[] {
	return text
		.split(/\n\n+/)
		.map((part) => part.trim())
		.filter(Boolean);
}

function normalizeBlocks(section: ProjectCaseSectionInput): ProjectCaseBlock[] {
	if (section.blocks?.length) {
		return section.blocks
			.map((block) => ({
				title: block.title?.trim() ?? '',
				text: block.text?.trim() ?? '',
			}))
			.filter((block) => block.title || block.text);
	}

	const title = section.title?.trim() ?? '';
	const text = section.text?.trim() ?? '';
	if (!title && !text) return [];

	const paragraphs = paragraphsFromText(text);
	if (paragraphs.length <= 1) {
		return [{ title, text }];
	}

	return [
		{ title, text: paragraphs[0] ?? '' },
		...paragraphs.slice(1).map((paragraph) => ({ title: '', text: paragraph })),
	];
}

function legacySections(data: ProjectCaseData): ProjectCaseSectionInput[] {
	const sections: ProjectCaseSectionInput[] = [];

	if (data.overviewTitle || data.overviewText) {
		sections.push({
			label: data.overviewLabel || 'Overview',
			title: data.overviewTitle || '',
			text: data.overviewText || '',
		});
	}

	if (data.challengesText) {
		sections.push({
			label: data.challengesLabel || 'Challenges',
			text: data.challengesText,
		});
	}

	if (data.strategyText) {
		sections.push({
			label: data.strategyLabel || 'Strategy',
			title: data.strategyTitle || '',
			text: data.strategyText,
		});
	}

	if (data.summaryText) {
		sections.push({
			label: data.summaryLabel || 'Results',
			title: data.summaryTitle || '',
			text: data.summaryText,
		});
	}

	return sections;
}

/**
 * Builds up to 10 case sections.
 * Section N pulls media from `N.webp` / `N.1`–`N.4` (max 4 files) in the portfolio folder.
 */
export function buildProjectCaseSections(
	data: ProjectCaseData,
	folderName: string,
	coverFilename = 'cover.webp',
): ProjectCaseSection[] {
	const source = (data.sections?.length ? data.sections : legacySections(data)).slice(0, MAX_SECTIONS);

	return source.map((section, index) => {
		const blocks = normalizeBlocks(section);
		const label = section.label?.trim() || `Section ${index + 1}`;
		const displayIndex = index + 1;

		return {
			index: displayIndex,
			label,
			title: section.title?.trim() || blocks[0]?.title || '',
			text: section.text?.trim() || blocks.map((block) => block.text).filter(Boolean).join('\n\n'),
			blocks,
			media: getSectionMedia(folderName, displayIndex, coverFilename),
			isOverview: index === 0,
			isResults: index === source.length - 1,
		};
	});
}

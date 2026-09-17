export type ProjectSectionTheme = 'light' | 'dark' | 'muted';

export type ProjectSectionFields = {
	label?: string;
	title?: string;
	text?: string;
};

export type ProjectSection = ProjectSectionFields & {
	theme?: ProjectSectionTheme;
	/** Insert after this full gallery group (e.g. 2 → after 2.webp + 2.1/2.2). */
	afterGroup?: number;
};

export type ResolvedProjectSection = {
	index: number;
	label: string;
	title: string;
	text: string;
	theme: ProjectSectionTheme;
	afterGroup?: number;
};

type LegacySectionSource = {
	sections?: ProjectSection[];
	challengesLabel?: string;
	challengesTitle?: string;
	challengesText?: string;
	challengesAfterGroup?: number;
	strategyLabel?: string;
	strategyTitle?: string;
	strategyText?: string;
	strategyAfterGroup?: number;
	summaryLabel?: string;
	summaryTitle?: string;
	summaryText?: string;
};

/** Fixed rhythm after overview: dark → light → muted → dark → … */
const SECTION_THEME_CYCLE: ProjectSectionTheme[] = ['dark', 'light', 'muted'];

function themeForSectionIndex(index: number): ProjectSectionTheme {
	return SECTION_THEME_CYCLE[index % SECTION_THEME_CYCLE.length];
}

export function isSummaryLabel(label: string): boolean {
	return /summar|podsum|result|resumen/i.test(label);
}

function stripLabelBrackets(label: string): string {
	return label.replace(/^\[\s*/, '').replace(/\s*\]$/, '').replace(/\s*\}$/, '').trim();
}

/** Prefer explicit `sections` (max 10). Fall back to legacy challenge/strategy/summary fields. */
export function resolveProjectSections(data: LegacySectionSource): ResolvedProjectSection[] {
	let resolved: ResolvedProjectSection[] = [];

	if (data.sections && data.sections.length > 0) {
		resolved = data.sections
			.slice(0, 10)
			.map((section, index) => {
				const label = stripLabelBrackets(section.label?.trim() ?? '');
				const isSummary = isSummaryLabel(label);
				return {
					index,
					label,
					title: section.title?.trim() ?? '',
					text: section.text?.trim() ?? '',
					theme: themeForSectionIndex(index),
					// Default: section 0 comes after group 1 (under overview), section 1 after group 2, etc.
					afterGroup: section.afterGroup ?? (isSummary ? undefined : index + 1),
				};
			})
			.filter((section) => section.label || section.title || section.text);
	} else {
		const legacy: ResolvedProjectSection[] = [];

		if (data.challengesTitle || data.challengesText) {
			legacy.push({
				index: 0,
				label: stripLabelBrackets(data.challengesLabel?.trim() || 'Challenges'),
				title: data.challengesTitle?.trim() ?? '',
				text: data.challengesText?.trim() ?? '',
				theme: themeForSectionIndex(0),
				afterGroup: data.challengesAfterGroup ?? 2,
			});
		}

		if (data.strategyTitle || data.strategyText) {
			legacy.push({
				index: legacy.length,
				label: stripLabelBrackets(data.strategyLabel?.trim() || 'Strategy'),
				title: data.strategyTitle?.trim() ?? '',
				text: data.strategyText?.trim() ?? '',
				theme: themeForSectionIndex(legacy.length),
				afterGroup: data.strategyAfterGroup ?? 8,
			});
		}

		if (data.summaryTitle || data.summaryText) {
			legacy.push({
				index: legacy.length,
				label: stripLabelBrackets(data.summaryLabel?.trim() || 'Summary'),
				title: data.summaryTitle?.trim() ?? '',
				text: data.summaryText?.trim() ?? '',
				theme: themeForSectionIndex(legacy.length),
			});
		}

		resolved = legacy.slice(0, 10);
	}

	// Re-index + re-theme after filter; keep Summary sections last (trailing).
	// Default rhythm without explicit afterGroup:
	// group 1 → section 0 → group 2 → section 1 → … → remaining gallery → Summary
	const content = resolved.filter((section) => !isSummaryLabel(section.label));
	const summaries = resolved.filter((section) => isSummaryLabel(section.label));
	const ordered = [...content, ...summaries].slice(0, 10);

	return ordered.map((section, index) => ({
		...section,
		index,
		theme: isSummaryLabel(section.label) ? 'light' : themeForSectionIndex(index),
		afterGroup:
			section.afterGroup !== undefined
				? section.afterGroup
				: isSummaryLabel(section.label)
					? undefined
					: (section.index != null ? section.index + 1 : index + 1),
	}));
}

export function mergeSectionCopy(
	base: ProjectSectionFields[],
	override?: ProjectSectionFields[],
): ProjectSectionFields[] {
	if (!override?.length) return base;

	const length = Math.max(base.length, override.length);
	return Array.from({ length }, (_, index) => ({
		...base[index],
		...override[index],
	}));
}

export type ProjectPageSegment =
	| { type: 'gallery'; blocks: import('./getProjectGallery.ts').GalleryLayoutBlock[] }
	| { type: 'section'; section: ResolvedProjectSection };

export function buildProjectPageSegments(
	gallery: import('./getProjectGallery.ts').GalleryLayoutBlock[],
	sections: ResolvedProjectSection[],
	splitAfterLead: (
		blocks: import('./getProjectGallery.ts').GalleryLayoutBlock[],
		afterGroup: number,
	) => {
		before: import('./getProjectGallery.ts').GalleryLayoutBlock[];
		after: import('./getProjectGallery.ts').GalleryLayoutBlock[];
	},
): ProjectPageSegment[] {
	const activeSections = sections.filter(
		(section) => Boolean(section.label || section.title || section.text),
	);

	const placed = activeSections
		.filter((section) => typeof section.afterGroup === 'number')
		.sort((a, b) => (a.afterGroup ?? 0) - (b.afterGroup ?? 0));
	const trailing = activeSections.filter((section) => typeof section.afterGroup !== 'number');

	const rawSegments: ProjectPageSegment[] = [];
	let remaining = gallery;

	for (const section of placed) {
		const { before, after } = splitAfterLead(remaining, section.afterGroup as number);
		if (before.length > 0) rawSegments.push({ type: 'gallery', blocks: before });
		rawSegments.push({ type: 'section', section });
		remaining = after;
	}

	if (remaining.length > 0) rawSegments.push({ type: 'gallery', blocks: remaining });

	for (const section of trailing) {
		rawSegments.push({ type: 'section', section });
	}

	// Merge adjacent gallery segments so they form a continuous gallery stack with standard gap
	const mergedSegments: ProjectPageSegment[] = [];
	for (const segment of rawSegments) {
		const prev = mergedSegments[mergedSegments.length - 1];
		if (segment.type === 'gallery' && prev && prev.type === 'gallery') {
			prev.blocks.push(...segment.blocks);
		} else {
			mergedSegments.push(segment);
		}
	}

	return mergedSegments;
}

export function localeSectionCopy(
	sections: ResolvedProjectSection[],
	localeSections?: ProjectSectionFields[],
): ProjectSectionFields[] {
	return sections.map((section, index) => ({
		label: localeSections?.[index]?.label ?? section.label,
		title: localeSections?.[index]?.title ?? section.title,
		text: localeSections?.[index]?.text ?? section.text,
	}));
}

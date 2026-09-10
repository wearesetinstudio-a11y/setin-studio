import type { Locale } from '../i18n/dictionaries.ts';
import {
	localeSectionCopy,
	resolveProjectSections,
	type ProjectSectionFields,
} from './getProjectSections.ts';

export type ProjectCopyFields = {
	title?: string;
	client?: string;
	clientLabel?: string;
	heroSubtitle?: string;
	service?: string;
	industry?: string;
	market?: string;
	overviewLabel?: string;
	overviewTitle?: string;
	overviewText?: string;
	sections?: ProjectSectionFields[];
};

type ProjectCopySource = {
	title: string;
	client: string;
	heroSubtitle?: string;
	service?: string;
	industry?: string;
	market?: string;
	overviewLabel?: string;
	overviewTitle?: string;
	overviewText?: string;
	sections?: {
		label?: string;
		title?: string;
		text?: string;
		afterGroup?: number;
	}[];
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
	i18n?: {
		pl?: ProjectCopyFields;
		es?: ProjectCopyFields;
	};
};

export type ProjectCopyBundle = Record<Locale, ProjectCopyFields>;

export function buildProjectCopyBundle(data: ProjectCopySource): ProjectCopyBundle {
	const resolved = resolveProjectSections(data);

	const en: ProjectCopyFields = {
		title: data.title,
		client: data.client,
		clientLabel: '',
		heroSubtitle: data.heroSubtitle ?? '',
		service: data.service ?? '',
		industry: data.industry ?? '',
		market: data.market ?? '',
		overviewLabel: data.overviewLabel ?? '',
		overviewTitle: data.overviewTitle ?? '',
		overviewText: data.overviewText ?? '',
		sections: localeSectionCopy(resolved),
	};

	const withLocale = (localeCopy?: ProjectCopyFields): ProjectCopyFields => {
		const merged = { ...en, ...localeCopy };
		merged.sections = localeSectionCopy(resolved, localeCopy?.sections);
		return merged;
	};

	return {
		en,
		pl: withLocale(data.i18n?.pl),
		es: withLocale(data.i18n?.es),
	};
}

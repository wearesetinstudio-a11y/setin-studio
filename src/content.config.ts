import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projectSectionSchema = z.object({
	label: z.string().optional().default(''),
	title: z.string().optional().default(''),
	text: z.string().optional().default(''),
	/** Insert this section after gallery group N (e.g. 1 → after 1.webp / 1.1–1.4). */
	afterGroup: z.number().optional(),
});

const projectCopyFields = z
	.object({
		title: z.string().optional(),
		client: z.string().optional(),
		clientLabel: z.string().optional(),
		heroSubtitle: z.string().optional(),
		service: z.string().optional(),
		industry: z.string().optional(),
		market: z.string().optional(),
		overviewLabel: z.string().optional(),
		overviewTitle: z.string().optional(),
		overviewText: z.string().optional(),
		sections: z
			.array(
				z.object({
					label: z.string().optional(),
					title: z.string().optional(),
					text: z.string().optional(),
				}),
			)
			.max(10)
			.optional(),
	})
	.partial();

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		client: z.string(),
		tags: z.array(z.string()),
		thumbnail: z.string(),
		folderName: z.string().optional(),
		video: z.string().optional(),
		order: z.number(),
		/** Listed in projects grid, but not clickable / no case page yet. */
		comingSoon: z.boolean().optional().default(false),
		/** Show a NEW badge on the card and pin toward the front of the list. */
		isNew: z.boolean().optional().default(false),
		heroSubtitle: z.string().optional().default(''),
		service: z.string().optional().default(''),
		industry: z.string().optional().default(''),
		market: z.string().optional().default(''),
		liveUrl: z.string().optional().default(''),
		/** Optional display text for Live link (href still uses liveUrl). */
		liveLabel: z.string().optional().default(''),
		logo: z.string().optional().default(''),
		heroImage: z.string().optional().default(''),
		heroBackground: z.string().optional().default(''),
		overviewLabel: z.string().optional().default('Overview'),
		overviewTitle: z.string().optional().default(''),
		overviewText: z.string().optional().default(''),
		overviewGraphic: z.string().optional().default(''),
		overviewYoutube: z.string().optional().default(''),
		year: z.number().optional(),
		/** Flexible content sections under overview (max 10). */
		sections: z.array(projectSectionSchema).max(10).optional().default([]),
		/** Localized overrides keyed by locale (pl / es). EN is the base frontmatter. */
		i18n: z
			.object({
				pl: projectCopyFields.optional(),
				es: projectCopyFields.optional(),
			})
			.optional(),
		/** @deprecated Prefer `sections` */
		challengesLabel: z.string().optional().default('Challenges'),
		challengesText: z.string().optional().default(''),
		challengesAfterGroup: z.number().optional().default(2),
		/** @deprecated Prefer `sections` */
		strategyLabel: z.string().optional().default('Strategy'),
		strategyTitle: z.string().optional().default(''),
		strategyText: z.string().optional().default(''),
		strategyAfterGroup: z.number().optional().default(8),
		/** @deprecated Prefer `sections` */
		summaryLabel: z.string().optional().default('Results'),
		summaryTitle: z.string().optional().default(''),
		summaryText: z.string().optional().default(''),
	}),
});

export const collections = { projects };

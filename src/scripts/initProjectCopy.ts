import type { Locale } from '../i18n/dictionaries.ts';
import { wrapRevealLetters } from './initScrollLetterReveal.ts';

type CopyMap = Record<string, string> & {
	sections?: { label?: string; title?: string; text?: string }[];
};
type Bundle = Partial<Record<Locale, CopyMap>> & { en?: CopyMap };

function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function renderParagraphs(value: string, paragraphClass: string) {
	return value
		.split(/\n\n+/)
		.map((part) => part.trim())
		.filter(Boolean)
		.map((paragraph) => `<p class="${paragraphClass}">${escapeHtml(paragraph)}</p>`)
		.join('');
}

function clearWindowCopy() {
	delete (globalThis as { __projectCopy?: Bundle }).__projectCopy;
}

function readBundleFromNode(node: HTMLElement): Bundle | null {
	const raw =
		node instanceof HTMLTemplateElement
			? node.content.textContent || node.innerHTML
			: node.textContent || node.innerHTML;

	if (!raw?.trim()) return null;

	try {
		return JSON.parse(raw) as Bundle;
	} catch {
		return null;
	}
}

function readBundle(): Bundle | null {
	const node = document.getElementById('project-copy-data');

	if (!node) {
		clearWindowCopy();
		return null;
	}

	const fromDom = readBundleFromNode(node);
	if (fromDom?.en) {
		(globalThis as { __projectCopy?: Bundle }).__projectCopy = fromDom;
		return fromDom;
	}

	const fromWindow = (globalThis as { __projectCopy?: Bundle }).__projectCopy;
	return fromWindow?.en ? fromWindow : null;
}

function applySectionCopy(copy: CopyMap) {
	document.querySelectorAll<HTMLElement>('[data-project-section]').forEach((section) => {
		const index = Number(section.dataset.projectSection);
		if (!Number.isFinite(index)) return;

		const sectionCopy = copy.sections?.[index];
		if (!sectionCopy) return;

		section.querySelectorAll<HTMLElement>('[data-project-section-field]').forEach((element) => {
			const field = element.dataset.projectSectionField;
			if (!field) return;

			const value = sectionCopy[field as 'label' | 'title' | 'text'];
			if (value == null) return;

			if (field === 'text') {
				const className = element.dataset.paragraphClass || 'body-txt-1 project-content-block__text';
				element.innerHTML = value.trim() ? renderParagraphs(value, className) : '';
				return;
			}

			const revealLine = element.hasAttribute('data-reveal-line')
				? element
				: element.querySelector<HTMLElement>('[data-reveal-line]');

			if (revealLine) {
				revealLine.textContent = value;
				wrapRevealLetters(revealLine);
				return;
			}

			element.textContent = field === 'label' ? value.toUpperCase() : value;
		});
	});
}

export function applyProjectCopy(locale: Locale) {
	const bundle = readBundle();
	if (!bundle?.en) return;

	const copy = { ...bundle.en, ...(bundle[locale] ?? {}) } as CopyMap;
	if (bundle[locale]?.sections || bundle.en?.sections) {
		copy.sections = bundle[locale]?.sections ?? bundle.en?.sections;
	}

	const hero = document.querySelector<HTMLElement>('[data-project-hero-headline]');
	if (hero && typeof copy.heroSubtitle === 'string') {
		hero.dataset.rawText = copy.heroSubtitle;
		delete hero.dataset.prepared;
		delete hero.dataset.revealed;
		// ProjectHero resize/prepare will rebuild lines on next language event listeners;
		// set plain text as fallback for immediate display.
		hero.textContent = copy.heroSubtitle;
	}

	const clientName = document.querySelector<HTMLElement>('[data-project-field="client"]');
	if (clientName && typeof copy.client === 'string' && copy.client) {
		clientName.textContent = copy.client.toUpperCase();
	}

	document.querySelectorAll<HTMLElement>('[data-project-field]').forEach((element) => {
		const key = element.dataset.projectField;
		if (!key || key === 'client') return;

		const value = copy[key];
		if (typeof value !== 'string') return;

		if (key === 'overviewLabel') {
			element.textContent = value.toUpperCase();
			return;
		}

		const revealLine = element.hasAttribute('data-reveal-line')
			? element
			: element.querySelector<HTMLElement>('[data-reveal-line]');

		if (revealLine) {
			revealLine.textContent = value;
			wrapRevealLetters(revealLine);
			return;
		}

		if (element.dataset.projectParagraphs === 'true') {
			const className = element.dataset.paragraphClass || 'body-txt-1 project-overview__text';
			element.innerHTML = renderParagraphs(value, className);
			return;
		}

		element.textContent = value;
	});

	applySectionCopy(copy);

	// Rebuild hero line reveal after copy swap.
	window.dispatchEvent(new CustomEvent('setin:project-copy-applied', { detail: { locale } }));
}

import type { Locale } from '../i18n/dictionaries.ts';
import { getCurrentLocale } from './i18n.ts';

const IDLE_BY_LOCALE: Record<Locale, string> = {
	pl: 'Wróć w mrok',
	en: 'Back to the dark',
	es: 'Vuelve a la oscuridad',
};

const DOT_INTERVAL_MS = 450;

let started = false;
let originalTitle = '';
let dotCount = 1;
let direction: 1 | -1 = 1;
let intervalId = 0;
let idleBase = IDLE_BY_LOCALE.en;

function stopIdleTitle() {
	if (intervalId) {
		window.clearInterval(intervalId);
		intervalId = 0;
	}
	dotCount = 1;
	direction = 1;
}

function renderIdleTitle() {
	document.title = idleBase + '.'.repeat(dotCount);
}

function startIdleTitle() {
	stopIdleTitle();
	originalTitle = document.title;
	idleBase = IDLE_BY_LOCALE[getCurrentLocale()] ?? IDLE_BY_LOCALE.en;
	dotCount = 1;
	direction = 1;
	renderIdleTitle();

	intervalId = window.setInterval(() => {
		dotCount += direction;
		if (dotCount >= 3) {
			dotCount = 3;
			direction = -1;
		} else if (dotCount <= 1) {
			dotCount = 1;
			direction = 1;
		}
		renderIdleTitle();
	}, DOT_INTERVAL_MS);
}

function onVisibilityChange() {
	if (document.hidden) {
		startIdleTitle();
		return;
	}
	stopIdleTitle();
	if (originalTitle) document.title = originalTitle;
}

/** Keep the restored title in sync after client navigations / i18n title updates. */
function syncOriginalTitle() {
	if (document.hidden) return;
	originalTitle = document.title;
}

export function initTabTitleIdle() {
	if (started) return;
	started = true;
	originalTitle = document.title;
	document.addEventListener('visibilitychange', onVisibilityChange);
	document.addEventListener('astro:page-load', syncOriginalTitle);
}

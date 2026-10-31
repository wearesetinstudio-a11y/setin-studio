const IDLE_BASE = 'We wait here';
const DOT_INTERVAL_MS = 450;

let started = false;
let originalTitle = '';
let dotCount = 0;
let direction: 1 | -1 = 1;
let intervalId = 0;

function stopIdleTitle() {
	if (intervalId) {
		window.clearInterval(intervalId);
		intervalId = 0;
	}
	dotCount = 0;
	direction = 1;
}

function startIdleTitle() {
	stopIdleTitle();
	originalTitle = document.title;
	dotCount = 0;
	direction = 1;
	document.title = IDLE_BASE;

	intervalId = window.setInterval(() => {
		dotCount += direction;
		if (dotCount >= 3) {
			dotCount = 3;
			direction = -1;
		} else if (dotCount <= 0) {
			dotCount = 0;
			direction = 1;
		}
		document.title = IDLE_BASE + '.'.repeat(dotCount);
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

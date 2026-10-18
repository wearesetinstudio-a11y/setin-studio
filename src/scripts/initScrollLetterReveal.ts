import { getLenis } from './initSmoothScroll.ts';

const boundListenerKeys = new Set<string>();

export function wrapRevealLetters(element: HTMLElement) {
	if (element.querySelector('.reveal-char')) return;

	const text = element.textContent ?? '';
	if (!text) return;

	element.textContent = '';

	for (const char of text) {
		const span = document.createElement('span');
		span.className = 'reveal-char';
		span.textContent = char === ' ' ? ' ' : char;
		element.appendChild(span);
	}
}

export function initScrollLetterReveal(
	headingId: string,
	options: { startLine?: number; endLine?: number } = {},
): void {
	initScrollLetterReveals([headingId], options);
}

export function initScrollLetterReveals(
	headingIds: string[],
	options: { startLine?: number; endLine?: number } = {},
): void {
	const startLineRatio = options.startLine ?? 0.88;
	const endLineRatio = options.endLine ?? 0.45;
	const readyKey = headingIds.join(',');

	let scrollTicking = false;
	let rafId = 0;
	let watching = false;

	function updateReveal() {
		const viewportHeight = window.innerHeight;
		const startLine = viewportHeight * startLineRatio;
		const endLine = viewportHeight * endLineRatio;
		const range = startLine - endLine;

		for (const headingId of headingIds) {
			const heading = document.getElementById(headingId);
			if (!heading) continue;

			const chars = heading.querySelectorAll('.reveal-char');
			if (!chars.length) continue;

			const rect = heading.getBoundingClientRect();
			const progress = Math.min(1, Math.max(0, (startLine - rect.top) / range));
			const activeCount = Math.ceil(progress * chars.length);

			chars.forEach((char, index) => {
				char.classList.toggle('active', index < activeCount);
			});
		}
	}

	function onScroll() {
		if (scrollTicking) return;
		scrollTicking = true;
		requestAnimationFrame(() => {
			updateReveal();
			syncWatching();
			scrollTicking = false;
		});
	}

	function tickWhileVisible() {
		if (!watching) return;
		updateReveal();
		rafId = requestAnimationFrame(tickWhileVisible);
	}

	function syncWatching() {
		const anyVisible = headingIds.some((headingId) => {
			const heading = document.getElementById(headingId);
			if (!heading) return false;
			const rect = heading.getBoundingClientRect();
			/* Keep ticking a bit above/below so the reveal finishes smoothly. */
			return rect.bottom > -80 && rect.top < window.innerHeight + 80;
		});

		if (anyVisible && !watching) {
			watching = true;
			rafId = requestAnimationFrame(tickWhileVisible);
			return;
		}

		if (!anyVisible && watching) {
			watching = false;
			cancelAnimationFrame(rafId);
			rafId = 0;
			updateReveal();
		}
	}

	function bindLenis() {
		const lenis = getLenis();
		if (!lenis) return false;
		lenis.on('scroll', onScroll);
		return true;
	}

	function init() {
		for (const headingId of headingIds) {
			const heading = document.getElementById(headingId);
			if (!heading) continue;

			heading.querySelectorAll('[data-reveal-line]').forEach((line) => {
				if (!line.querySelector('.reveal-char')) {
					wrapRevealLetters(line as HTMLElement);
				}
			});
		}

		updateReveal();
		syncWatching();

		if (boundListenerKeys.has(readyKey)) return;
		boundListenerKeys.add(readyKey);

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		if (!bindLenis()) {
			window.setTimeout(bindLenis, 0);
			window.setTimeout(bindLenis, 250);
		}

		for (const headingId of headingIds) {
			const heading = document.getElementById(headingId);
			if (!heading) continue;
			const observer = new IntersectionObserver(
				() => {
					syncWatching();
					updateReveal();
				},
				{ threshold: [0, 0.15, 0.35, 0.55, 0.75, 1] },
			);
			observer.observe(heading);
		}
	}

	init();
}

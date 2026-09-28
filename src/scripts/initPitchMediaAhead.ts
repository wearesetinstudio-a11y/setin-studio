import { pitchReady } from './pitchReady.ts';

/**
 * Loads lazy pitch media well before it scrolls into view, so images and videos are ready
 * when the section appears. Starts after the preloader so the hero keeps full bandwidth.
 * Videos opt in with `preload="none"`; `data-pitch-preload` overrides the level (e.g. metadata).
 */
export function initPitchMediaAhead() {
	const targets = Array.from(
		document.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
			'.pitch-main img[loading="lazy"], .pitch-main video[preload="none"]',
		),
	);
	if (!targets.length) return;

	const load = (el: HTMLImageElement | HTMLVideoElement) => {
		if (el instanceof HTMLImageElement) {
			el.loading = 'eager';
			return;
		}
		el.preload = el.dataset.pitchPreload || 'auto';
		if (el.readyState === 0 && el.networkState !== HTMLMediaElement.NETWORK_LOADING) el.load();
	};

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				load(entry.target as HTMLImageElement | HTMLVideoElement);
				observer.unobserve(entry.target);
			}
		},
		{ root: null, rootMargin: '100% 0px 250% 0px', threshold: 0 },
	);

	pitchReady.then(() => targets.forEach((el) => observer.observe(el)));
}

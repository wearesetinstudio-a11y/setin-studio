import { pitchReady } from './pitchReady.ts';

/**
 * Prefetch pitch media ahead of the viewport so images/videos are warm when the
 * section appears. Starts after the preloader (hero keeps bandwidth first).
 *
 * Keep the ahead window and concurrency modest so on-screen video can buffer
 * without fighting a stack of upcoming WebPs / WebMs for bandwidth.
 */
const ROOT_MARGIN = '40% 0px 90% 0px';
const MAX_CONCURRENT = 1;

export function initPitchMediaAhead() {
	const targets = Array.from(
		document.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
			'.pitch-main img[loading="lazy"], .pitch-main video[preload="none"]',
		),
	);
	if (!targets.length) return;

	const queue: Array<HTMLImageElement | HTMLVideoElement> = [];
	const queued = new WeakSet<HTMLImageElement | HTMLVideoElement>();
	let active = 0;

	const pump = () => {
		while (active < MAX_CONCURRENT && queue.length) {
			const el = queue.shift();
			if (!el) break;
			active += 1;
			void warm(el).finally(() => {
				active -= 1;
				pump();
			});
		}
	};

	const enqueue = (el: HTMLImageElement | HTMLVideoElement) => {
		if (queued.has(el)) return;
		queued.add(el);
		queue.push(el);
		pump();
	};

	const warm = (el: HTMLImageElement | HTMLVideoElement) => {
		if (el instanceof HTMLImageElement) {
			el.loading = 'eager';
			if (el.decode) {
				return el.decode().catch(() => undefined);
			}
			if (el.complete) return Promise.resolve();
			return new Promise<void>((resolve) => {
				el.addEventListener('load', () => resolve(), { once: true });
				el.addEventListener('error', () => resolve(), { once: true });
			});
		}

		el.preload = el.dataset.pitchPreload || 'auto';
		if (el.readyState === 0 && el.networkState !== HTMLMediaElement.NETWORK_LOADING) {
			el.load();
		}
		if (el.readyState >= 2) return Promise.resolve();
		return new Promise<void>((resolve) => {
			el.addEventListener('loadeddata', () => resolve(), { once: true });
			el.addEventListener('error', () => resolve(), { once: true });
		});
	};

	const observer = new IntersectionObserver(
		(entries) => {
			/* Document order: closer sections first when several enter the margin together. */
			const hit = entries
				.filter((entry) => entry.isIntersecting)
				.map((entry) => entry.target as HTMLImageElement | HTMLVideoElement)
				.sort((a, b) => {
					const aTop = a.getBoundingClientRect().top;
					const bTop = b.getBoundingClientRect().top;
					return aTop - bTop;
				});

			for (const el of hit) {
				enqueue(el);
				observer.unobserve(el);
			}
		},
		{ root: null, rootMargin: ROOT_MARGIN, threshold: 0 },
	);

	pitchReady.then(() => targets.forEach((el) => observer.observe(el)));
}

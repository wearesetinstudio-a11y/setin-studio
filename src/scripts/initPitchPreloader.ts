import { markPitchReady } from './pitchReady.ts';
import {
	clearIntroPending,
	dispatchIntroComplete,
	setIntroPending,
	setIntroRevealing,
} from './introState.ts';
import {
	animatePageTransitionReveal,
	applyOverlayCover,
	getPageTransitionOverlay,
	resetPageTransitionOverlay,
} from './pageTransitionPanel.ts';
import { findSygnetFlip, playSygnetFlip, wait } from './sygnetFlipAnimation.ts';

const MAX_WAIT_MS = 10000;
/** Setin intro flips once when the page is ready; keep flipping if media is still loading after this. */
const FLIP_LOOP_AFTER_MS = 1200;

/**
 * Pitch preloader — same overlay + sygnet flip + bar reveal as the Setin intro,
 * but it also waits for fonts and every image/video in the first viewport (hero stage included).
 */
export function initPitchPreloader() {
	const overlay = getPageTransitionOverlay();
	if (!overlay?.hasAttribute('data-pitch-preloader')) {
		clearIntroPending();
		markPitchReady();
		return;
	}

	setIntroPending();
	applyOverlayCover(overlay);
	if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
	window.scrollTo(0, 0);

	const inFirstViewport = (el: Element) => {
		const rect = el.getBoundingClientRect();
		if (rect.width === 0 && rect.height === 0) return false;
		return rect.top < window.innerHeight && rect.bottom > 0;
	};

	const media = Array.from(
		document.querySelectorAll<HTMLImageElement | HTMLVideoElement>('.pitch-main img, .pitch-main video'),
	).filter(inFirstViewport);

	const waitForImage = (img: HTMLImageElement) =>
		new Promise<void>((resolve) => {
			img.loading = 'eager';
			if (img.complete) return resolve();
			img.addEventListener('load', () => resolve(), { once: true });
			img.addEventListener('error', () => resolve(), { once: true });
		});

	const waitForVideo = (video: HTMLVideoElement) =>
		new Promise<void>((resolve) => {
			if (video.readyState >= 3) return resolve();
			if (video.preload === 'none') {
				video.preload = 'auto';
				video.load();
			}
			video.addEventListener('canplay', () => resolve(), { once: true });
			video.addEventListener('error', () => resolve(), { once: true });
		});

	const assetsReady = Promise.race([
		Promise.all([
			(document.fonts?.ready ?? Promise.resolve()).catch(() => undefined),
			...media.map((el) => (el instanceof HTMLVideoElement ? waitForVideo(el) : waitForImage(el))),
		]).then(() => wait(180)),
		wait(MAX_WAIT_MS),
	]);

	const run = async () => {
		let ready = false;
		void assetsReady.then(() => {
			ready = true;
		});

		try {
			await Promise.race([assetsReady, wait(FLIP_LOOP_AFTER_MS)]);
			const sygnet = findSygnetFlip(overlay);
			do {
				if (sygnet) await playSygnetFlip(sygnet);
				else await assetsReady;
			} while (!ready);

			setIntroRevealing();
			markPitchReady();
			await animatePageTransitionReveal();
		} catch {
			resetPageTransitionOverlay(overlay);
			markPitchReady();
		} finally {
			clearIntroPending();
			dispatchIntroComplete();
		}
	};

	void run();
}

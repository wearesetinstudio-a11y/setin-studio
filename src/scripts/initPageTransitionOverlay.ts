import { hasCompletedIntro, isIntroSequenceRunning } from './introState.ts';
import {
	animatePageTransitionCover,
	animatePageTransitionReveal,
	getPageTransitionOverlay,
	holdOverlayCover,
	invalidateOverlayMotion,
	resetPageTransitionOverlay,
} from './pageTransitionPanel.ts';
import { wait } from './sygnetFlipAnimation.ts';
import { applyDocumentThemeColor, applyTransitionThemeColor, lookupThemeColor } from './themeColor.ts';
import { waitForCriticalPageMedia } from './waitForCriticalPageMedia.ts';

type TransitionPhase = 'idle' | 'covering' | 'covered' | 'revealing';

type TransitionWindow = Window &
	typeof globalThis & {
		__setinPageTransitionsReady?: boolean;
		__setinPageTransitionPhase?: TransitionPhase;
	};

const transitionWindow = window as TransitionWindow;

function getPhase(): TransitionPhase {
	return transitionWindow.__setinPageTransitionPhase ?? 'idle';
}

function setPhase(phase: TransitionPhase) {
	transitionWindow.__setinPageTransitionPhase = phase;
}

function cleanupIntroState() {
	if (!hasCompletedIntro()) return;
	document.body.classList.remove('intro-active');
}

export function isPageTransitionActive(): boolean {
	const phase = getPhase();
	return phase === 'covering' || phase === 'covered' || phase === 'revealing';
}

let revealGeneration = 0;

/**
 * The persisted overlay is snapshotted by the view transition. Starting the
 * bar exit inside that snapshot makes the panel jump or get stuck when the
 * snapshot is removed — most visibly when scroll is restored on the homepage.
 *
 * Prefer a short timeout over rAF: background tabs throttle/pause rAF and can
 * leave the overlay locked forever.
 */
async function waitForViewTransitionRelease(): Promise<void> {
	const root = document.documentElement;
	if (!root.hasAttribute('data-astro-transition')) {
		await wait(32);
		return;
	}

	await Promise.race([
		wait(800),
		new Promise<void>((resolve) => {
			const finish = () => {
				observer.disconnect();
				resolve();
			};
			const observer = new MutationObserver(() => {
				if (!root.hasAttribute('data-astro-transition')) finish();
			});
			observer.observe(root, {
				attributes: true,
				attributeFilter: ['data-astro-transition'],
			});
			if (!root.hasAttribute('data-astro-transition')) finish();
		}),
	]);

	await wait(32);
}

async function finishReveal(navToken: number): Promise<void> {
	if (navToken !== revealGeneration) return;

	try {
		await animatePageTransitionReveal();
	} finally {
		if (navToken !== revealGeneration) return;
		setPhase('idle');
		window.dispatchEvent(new CustomEvent('page-transition-reveal-complete'));
	}
}

export function initPageTransitionOverlay() {
	if (transitionWindow.__setinPageTransitionsReady) return;
	transitionWindow.__setinPageTransitionsReady = true;
	setPhase('idle');

	document.addEventListener('astro:before-preparation', (event) => {
		const defaultLoader = event.loader;

		cleanupIntroState();

		/* Preloader color = page we navigate TO, not the page we leave. */
		const dest = (event as Event & { to?: URL }).to;
		if (dest?.pathname) applyTransitionThemeColor(lookupThemeColor(dest.pathname));

		const phase = getPhase();
		if (isIntroSequenceRunning() || phase === 'covering' || phase === 'covered') {
			event.loader = defaultLoader;
			return;
		}

		const navToken = ++revealGeneration;
		invalidateOverlayMotion();
		setPhase('covering');

		event.loader = async () => {
			try {
				await animatePageTransitionCover();
				if (navToken !== revealGeneration) return;
				setPhase('covered');
				await defaultLoader();
			} catch (error) {
				if (navToken !== revealGeneration) throw error;
				const overlay = getPageTransitionOverlay();
				if (overlay) resetPageTransitionOverlay(overlay);
				setPhase('idle');
				throw error;
			}
		};
	});

	document.addEventListener('astro:after-swap', () => {
		cleanupIntroState();
		applyDocumentThemeColor(lookupThemeColor(window.location.pathname));

		if (getPhase() !== 'covered') return;

		const navToken = revealGeneration;
		const overlay = getPageTransitionOverlay();
		if (overlay) holdOverlayCover(overlay);
		setPhase('revealing');

		void (async () => {
			await waitForViewTransitionRelease();
			if (navToken !== revealGeneration) return;
			await waitForCriticalPageMedia();
			if (navToken !== revealGeneration) return;
			await finishReveal(navToken);
		})();
	});

	document.addEventListener('astro:page-load', () => {
		applyDocumentThemeColor(lookupThemeColor(window.location.pathname));
	});
}

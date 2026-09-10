import { hasCompletedIntro, isIntroSequenceRunning } from './introState.ts';
import {
	animatePageTransitionCover,
	animatePageTransitionReveal,
	getPageTransitionOverlay,
	resetPageTransitionOverlay,
} from './pageTransitionPanel.ts';

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

export function initPageTransitionOverlay() {
	if (transitionWindow.__setinPageTransitionsReady) return;
	transitionWindow.__setinPageTransitionsReady = true;
	setPhase('idle');

	document.addEventListener('astro:before-preparation', (event) => {
		const defaultLoader = event.loader;

		cleanupIntroState();

		if (getPhase() !== 'idle' || isIntroSequenceRunning()) {
			event.loader = defaultLoader;
			return;
		}

		event.loader = async () => {
			try {
				setPhase('covering');
				await animatePageTransitionCover();
				setPhase('covered');
				await defaultLoader();
			} catch (error) {
				const overlay = getPageTransitionOverlay();
				if (overlay) resetPageTransitionOverlay(overlay);
				setPhase('idle');
				throw error;
			}
		};
	});

	document.addEventListener('astro:after-swap', () => {
		cleanupIntroState();

		if (getPhase() !== 'covered') return;

		setPhase('revealing');
		void animatePageTransitionReveal().finally(() => {
			setPhase('idle');
			window.dispatchEvent(new CustomEvent('page-transition-reveal-complete'));
		});
	});
}

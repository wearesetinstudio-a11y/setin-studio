import { isPageTransitionActive } from './initPageTransitionOverlay.ts';
import {
	clearIntroPending,
	dispatchIntroComplete,
	hasCompletedIntro,
	isIntroSequenceRunning,
	markIntroComplete,
	setIntroPending,
	setIntroRevealing,
	setIntroSequenceRunning,
} from './introState.ts';
import {
	animateIntroCover,
	animatePageTransitionReveal,
	applyOverlayCover,
	getPageTransitionOverlay,
	resetPageTransitionOverlay,
} from './pageTransitionPanel.ts';

function pinHomepageToTop() {
	if (window.location.hash) return;
	if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
	window.scrollTo(0, 0);
}

function lockIntroCover(): HTMLElement | null {
	const overlay = getPageTransitionOverlay();
	setIntroPending();
	document.body.classList.add('intro-active');
	pinHomepageToTop();

	if (overlay) {
		applyOverlayCover(overlay);
	}

	return overlay;
}

async function runIntroSequence() {
	const overlay = getPageTransitionOverlay();
	if (!overlay) {
		markIntroComplete();
		clearIntroPending();
		document.body.classList.remove('intro-active');
		pinHomepageToTop();
		dispatchIntroComplete();
		return;
	}

	try {
		await animateIntroCover();
		markIntroComplete();
		setIntroRevealing();
		pinHomepageToTop();
		await animatePageTransitionReveal();
	} catch {
		clearIntroPending();
		resetPageTransitionOverlay(overlay);
		markIntroComplete();
	} finally {
		clearIntroPending();
		document.body.classList.remove('intro-active');
		setIntroSequenceRunning(false);
		pinHomepageToTop();
		dispatchIntroComplete();
	}
}

export function initGlobalPreloader() {
	if (!document.getElementById('hero-section')) {
		clearIntroPending();
		return;
	}

	if (hasCompletedIntro()) {
		clearIntroPending();
		dispatchIntroComplete();
		return;
	}

	// Navigating onto the homepage: the page transition already owns the overlay.
	// Re-running the intro here snaps the bars shut mid-exit.
	if (isPageTransitionActive()) {
		clearIntroPending();
		const finishSkippedIntro = () => {
			if (hasCompletedIntro()) return;
			markIntroComplete();
			dispatchIntroComplete();
		};
		window.addEventListener('page-transition-reveal-complete', finishSkippedIntro, { once: true });
		window.setTimeout(finishSkippedIntro, 2600);
		return;
	}

	if (isIntroSequenceRunning()) return;

	setIntroSequenceRunning(true);
	lockIntroCover();
	void runIntroSequence();
}

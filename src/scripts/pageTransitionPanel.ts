import {
	findSygnetFlip,
	PANEL_SLIDE_MS,
	playSygnetFlip,
	prefersReducedMotion,
	resetSygnetFlip,
	wait,
	waitForAnimation,
} from './sygnetFlipAnimation.ts';

export const PAGE_TRANSITION_OVERLAY_ID = 'page-transition-overlay';
const BAR_STAGGER_MS = 75;

export function getPageTransitionOverlay(): HTMLElement | null {
	return document.getElementById(PAGE_TRANSITION_OVERLAY_ID);
}

function getBars(overlay: HTMLElement): HTMLElement[] {
	return Array.from(overlay.querySelectorAll<HTMLElement>('.page-transition-bar'));
}

function clearBarAnimations(overlay: HTMLElement) {
	const bars = getBars(overlay);
	for (const bar of bars) {
		bar.style.animation = 'none';
	}
	void overlay.offsetWidth;
	for (const bar of bars) {
		bar.style.animation = '';
	}
}

async function waitForBars(
	overlay: HTMLElement,
	animationName: string,
	baseMs: number,
): Promise<void> {
	const bars = getBars(overlay);
	if (!bars.length) {
		await wait(baseMs);
		return;
	}

	await Promise.all(
		bars.map((bar, index) =>
			waitForAnimation(bar, animationName, baseMs + index * BAR_STAGGER_MS),
		),
	);
}

export function resetPageTransitionOverlay(overlay: HTMLElement) {
	overlay.classList.remove('is-covering', 'is-revealing', 'is-covered', 'is-active');
	overlay.style.pointerEvents = 'none';
	clearBarAnimations(overlay);

	const sygnet = findSygnetFlip(overlay);
	if (sygnet) resetSygnetFlip(sygnet);
}

export async function slidePanelIn(overlay: HTMLElement): Promise<void> {
	if (prefersReducedMotion()) {
		overlay.classList.add('is-active', 'is-covered');
		overlay.style.pointerEvents = 'auto';
		await wait(120);
		return;
	}

	overlay.classList.remove('is-revealing', 'is-covered');
	overlay.classList.add('is-active');
	overlay.style.pointerEvents = 'auto';

	const sygnet = findSygnetFlip(overlay);
	if (sygnet) resetSygnetFlip(sygnet);

	clearBarAnimations(overlay);
	void overlay.offsetWidth;
	overlay.classList.add('is-covering');
	await waitForBars(overlay, 'preloader-bar-cover', PANEL_SLIDE_MS);
	overlay.classList.remove('is-covering');
	overlay.classList.add('is-covered');
}

export async function slidePanelOut(overlay: HTMLElement): Promise<void> {
	if (prefersReducedMotion()) {
		resetPageTransitionOverlay(overlay);
		return;
	}

	overlay.classList.remove('is-covering');
	clearBarAnimations(overlay);
	void overlay.offsetWidth;
	overlay.classList.add('is-revealing');
	await waitForBars(overlay, 'preloader-bar-reveal', PANEL_SLIDE_MS);
	resetPageTransitionOverlay(overlay);
}

export async function showOverlayCover(overlay: HTMLElement): Promise<void> {
	applyOverlayCover(overlay);

	if (prefersReducedMotion()) {
		await wait(120);
	}
}

export function applyOverlayCover(overlay: HTMLElement): void {
	const sygnet = findSygnetFlip(overlay);
	if (sygnet) resetSygnetFlip(sygnet);

	overlay.classList.remove('is-covering', 'is-revealing');
	overlay.classList.add('is-active', 'is-covered');
	overlay.style.pointerEvents = 'auto';
	clearBarAnimations(overlay);
}

async function playOverlaySygnetFlip(overlay: HTMLElement): Promise<void> {
	const sygnet = findSygnetFlip(overlay);
	if (sygnet) await playSygnetFlip(sygnet);
}

export async function animateIntroCover(): Promise<void> {
	const overlay = getPageTransitionOverlay();
	if (!overlay) return;

	// First visit: cover is already on screen — no slide-in
	await showOverlayCover(overlay);
	await waitForPageReady();
	await playOverlaySygnetFlip(overlay);
}

async function waitForPageReady(): Promise<void> {
	const fontsReady =
		'document' in globalThis && 'fonts' in document
			? document.fonts.ready.catch(() => undefined)
			: Promise.resolve();

	if (document.readyState === 'loading') {
		await new Promise<void>((resolve) => {
			document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
		});
	}

	await fontsReady;
	await wait(180);
}

export async function animatePageTransitionCover(): Promise<void> {
	const overlay = getPageTransitionOverlay();
	if (!overlay) return;

	await slidePanelIn(overlay);
	await playOverlaySygnetFlip(overlay);
}

export async function animatePageTransitionReveal(): Promise<boolean> {
	const overlay = getPageTransitionOverlay();
	if (!overlay?.classList.contains('is-active')) return false;

	await slidePanelOut(overlay);
	return true;
}

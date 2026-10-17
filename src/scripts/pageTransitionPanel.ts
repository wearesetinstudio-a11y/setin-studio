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

let motionGeneration = 0;

function beginOverlayMotion(): number {
	motionGeneration += 1;
	return motionGeneration;
}

function isCurrentOverlayMotion(token: number): boolean {
	return token === motionGeneration;
}

/** Drop an in-flight cover or reveal so it cannot reset the overlay later. */
export function invalidateOverlayMotion(): void {
	motionGeneration += 1;
}

function lockBarsClosed(overlay: HTMLElement) {
	for (const bar of getBars(overlay)) {
		bar.style.animation = 'none';
		bar.style.transform = 'translateY(0)';
	}
}

function releaseBarStyles(overlay: HTMLElement) {
	for (const bar of getBars(overlay)) {
		bar.style.animation = '';
		bar.style.transform = '';
	}
}

function clearBarAnimations(overlay: HTMLElement) {
	const bars = getBars(overlay);
	for (const bar of bars) {
		bar.style.animation = 'none';
		bar.style.transform = '';
	}
	void overlay.offsetWidth;
	for (const bar of bars) {
		bar.style.animation = '';
	}
}

/**
 * Pin the bars fully shut. Inline transform survives the view-transition
 * snapshot, so the panel cannot jump when scroll is restored on the way home.
 */
export function holdOverlayCover(overlay: HTMLElement) {
	overlay.classList.remove('is-covering', 'is-revealing');
	overlay.classList.add('is-active', 'is-covered');
	overlay.style.pointerEvents = 'auto';
	lockBarsClosed(overlay);
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
	releaseBarStyles(overlay);
	void overlay.offsetWidth;

	const sygnet = findSygnetFlip(overlay);
	if (sygnet) resetSygnetFlip(sygnet);
}

export async function slidePanelIn(overlay: HTMLElement): Promise<void> {
	const token = beginOverlayMotion();

	if (prefersReducedMotion()) {
		overlay.classList.add('is-active', 'is-covered');
		overlay.style.pointerEvents = 'auto';
		lockBarsClosed(overlay);
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
	if (!isCurrentOverlayMotion(token)) return;
	overlay.classList.remove('is-covering');
	overlay.classList.add('is-covered');
	lockBarsClosed(overlay);
}

export async function slidePanelOut(overlay: HTMLElement): Promise<void> {
	const token = beginOverlayMotion();

	if (prefersReducedMotion()) {
		if (!isCurrentOverlayMotion(token)) return;
		resetPageTransitionOverlay(overlay);
		return;
	}

	// Keep the covered transform until the exit animation is actually applied,
	// otherwise the bars snap to translateY(-100%) and the panel jumps.
	overlay.classList.remove('is-covering');
	overlay.classList.add('is-active', 'is-covered');
	lockBarsClosed(overlay);
	void overlay.offsetWidth;
	if (!isCurrentOverlayMotion(token)) return;

	releaseBarStyles(overlay);
	overlay.classList.add('is-revealing');
	await waitForBars(overlay, 'preloader-bar-reveal', PANEL_SLIDE_MS);
	if (!isCurrentOverlayMotion(token)) return;
	resetPageTransitionOverlay(overlay);
}

export async function showOverlayCover(overlay: HTMLElement): Promise<void> {
	applyOverlayCover(overlay);

	if (prefersReducedMotion()) {
		await wait(120);
	}
}

export function applyOverlayCover(overlay: HTMLElement): void {
	beginOverlayMotion();

	const sygnet = findSygnetFlip(overlay);
	if (sygnet) resetSygnetFlip(sygnet);

	overlay.classList.remove('is-covering', 'is-revealing');
	overlay.classList.add('is-active', 'is-covered');
	overlay.style.pointerEvents = 'auto';
	lockBarsClosed(overlay);
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

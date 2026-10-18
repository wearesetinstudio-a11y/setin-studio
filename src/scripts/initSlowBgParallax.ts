import { getLenis } from './initSmoothScroll.ts';

/** Desktop: subtle drift inside a fixed frame. */
export const PARALLAX_SPEED_DESKTOP = 0.32;
/** Mobile absolute-in-section lag (JS fallback only). */
export const PARALLAX_SPEED_MOBILE = 0.45;

export function isParallaxMobile() {
	return window.matchMedia('(max-width: 767px)').matches;
}

export function getParallaxSpeed() {
	return isParallaxMobile() ? PARALLAX_SPEED_MOBILE : PARALLAX_SPEED_DESKTOP;
}

/** Fixed viewport stage: image drifts slowly inside a pinned frame. */
export function fixedStageOffset(heroTop: number, speed: number) {
	return speed * Math.min(0, heroTop);
}

/** Absolute stage inside a scrolling section: image lags behind the section. */
export function absoluteStageOffset(heroTop: number, speed: number) {
	return (speed - 1) * Math.min(0, heroTop);
}

export function supportsViewTimeline(): boolean {
	return typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: view()') === true;
}

/**
 * Coalesced scroll sync for JS parallax fallbacks.
 * No touchmove — pairing touchmove + scroll causes mobile jitter.
 */
export function onParallaxScroll(handler: () => void) {
	let ticking = false;

	const run = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			handler();
			ticking = false;
		});
	};

	window.addEventListener('scroll', run, { passive: true });
	getLenis()?.on('scroll', run);

	return run;
}

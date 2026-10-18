import { getLenis } from './initSmoothScroll.ts';

/** Desktop: subtle drift inside a fixed frame. */
export const PARALLAX_SPEED_DESKTOP = 0.32;
/**
 * Mobile: stronger lag. Fixed layers often look frozen on iOS during scroll,
 * so mobile uses absolute-in-section motion with a clearer rate.
 */
export const PARALLAX_SPEED_MOBILE = 0.55;

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

/** Scroll + touch + Lenis, coalesced to one rAF. */
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
	window.addEventListener('touchmove', run, { passive: true });
	window.addEventListener('resize', run, { passive: true });
	getLenis()?.on('scroll', run);

	return run;
}

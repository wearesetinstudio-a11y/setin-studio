import {
	absoluteStageOffset,
	fixedStageOffset,
	getParallaxSpeed,
	isParallaxMobile,
	onParallaxScroll,
} from './initSlowBgParallax.ts';

/**
 * Slow-scroll parallax for pitch hero stages.
 * Expects: `[data-pitch-hero]` → `[data-pitch-hero-stage]` → `[data-pitch-hero-shift]`.
 * Mobile uses absolute-in-section lag (iOS-friendly); desktop keeps the fixed frame.
 */
export function initPitchHeroParallax() {
	const hero = document.querySelector<HTMLElement>('[data-pitch-hero]');
	const stage = hero?.querySelector<HTMLElement>('[data-pitch-hero-stage]');
	if (!hero || !stage || hero.dataset.pitchHeroParallaxInit === 'true') return;

	hero.dataset.pitchHeroParallaxInit = 'true';

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const shift = stage.querySelector<HTMLElement>('[data-pitch-hero-shift]');

	const sync = () => {
		const rect = hero.getBoundingClientRect();
		const mobile = isParallaxMobile();
		stage.classList.toggle('is-mobile-parallax', mobile);
		if (!mobile) {
			stage.classList.toggle('is-hidden', rect.bottom <= 0);
		} else {
			stage.classList.remove('is-hidden');
		}
		if (!shift || reduceMotion) return;
		const speed = getParallaxSpeed();
		const offset = mobile
			? absoluteStageOffset(rect.top, speed)
			: fixedStageOffset(rect.top, speed);
		shift.style.transform = `translate3d(0, ${offset}px, 0)`;
	};

	onParallaxScroll(sync)();
}

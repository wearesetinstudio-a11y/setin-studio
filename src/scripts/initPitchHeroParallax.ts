import { getLenis } from './initSmoothScroll.ts';

/** Same rate as About / project heroes: media travels at ~⅓ of page speed. */
const SPEED = 0.32;

/**
 * Slow-scroll parallax for fixed pitch hero stages.
 * Expects: `[data-pitch-hero]` → `[data-pitch-hero-stage]` → `[data-pitch-hero-shift]`.
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
		stage.classList.toggle('is-hidden', rect.bottom <= 0);
		if (!shift || reduceMotion) return;
		const offset = SPEED * Math.min(0, rect.top);
		shift.style.transform = `translate3d(0, ${offset}px, 0)`;
	};

	sync();
	window.addEventListener('scroll', sync, { passive: true });
	getLenis()?.on('scroll', sync);
}

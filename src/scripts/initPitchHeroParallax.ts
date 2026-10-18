import { initBgParallax } from './initBgParallax.ts';

/**
 * Pitch hero backgrounds — same About Us parallax system
 * (CSS scroll-driven on mobile when supported, Lenis/JS fallback, travel 0.08).
 *
 * Expects: `[data-pitch-hero]` → `[data-pitch-hero-stage].bg-parallax` → `[data-pitch-hero-shift].bg-parallax__shift`.
 */
export function initPitchHeroParallax() {
	const hero = document.querySelector<HTMLElement>('[data-pitch-hero]');
	const stage = hero?.querySelector<HTMLElement>('[data-pitch-hero-stage]');
	const shift = stage?.querySelector<HTMLElement>('[data-pitch-hero-shift]');
	if (!hero || !stage || !shift || hero.dataset.pitchHeroParallaxInit === 'true') return;

	hero.dataset.pitchHeroParallaxInit = 'true';
	initBgParallax({ root: hero, visual: stage, shift });
}

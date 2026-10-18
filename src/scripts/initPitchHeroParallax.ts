import { getLenis } from './initSmoothScroll.ts';

/**
 * Pitch hero backgrounds:
 * - Desktop: slow parallax (same strength as About / projects)
 * - Mobile: fixed in place, no parallax motion
 *
 * Expects: `[data-pitch-hero]` → `[data-pitch-hero-stage]` → `[data-pitch-hero-shift]`.
 */
export function initPitchHeroParallax() {
	const hero = document.querySelector<HTMLElement>('[data-pitch-hero]');
	const stage = hero?.querySelector<HTMLElement>('[data-pitch-hero-stage]');
	if (!hero || !stage || hero.dataset.pitchHeroParallaxInit === 'true') return;

	hero.dataset.pitchHeroParallaxInit = 'true';

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const mobileQuery = window.matchMedia('(max-width: 767px)');
	const shift = stage.querySelector<HTMLElement>('[data-pitch-hero-shift]');

	let target = 0;
	let current = 0;
	let rafId = 0;
	let parallaxRunning = false;
	const TRAVEL = 0.12;
	const LERP = 0.22;

	const syncVisibility = () => {
		stage.classList.toggle('is-hidden', hero.getBoundingClientRect().bottom <= 0);
	};

	const readTarget = () => {
		const rect = hero.getBoundingClientRect();
		const vh = window.innerHeight;
		const start = vh;
		const end = -rect.height;
		const range = start - end;
		const progress =
			range === 0 ? 0 : Math.min(1, Math.max(0, (start - rect.top) / range));
		const max = rect.height * TRAVEL;
		target = -max + progress * (2 * max);
	};

	const tick = () => {
		if (!parallaxRunning || !shift) return;
		current += (target - current) * LERP;
		if (Math.abs(target - current) < 0.05) current = target;
		shift.style.transform = `translate3d(0, ${current}px, 0)`;
		rafId = requestAnimationFrame(tick);
	};

	const stopParallax = () => {
		parallaxRunning = false;
		cancelAnimationFrame(rafId);
		rafId = 0;
		stage.classList.remove('is-parallax-active');
		if (shift) shift.style.transform = 'translate3d(0, 0, 0)';
	};

	const startParallax = () => {
		if (!shift || reduceMotion || parallaxRunning) return;
		parallaxRunning = true;
		stage.classList.add('is-parallax-active');
		readTarget();
		current = target;
		rafId = requestAnimationFrame(tick);
	};

	const onScroll = () => {
		if (mobileQuery.matches) {
			syncVisibility();
			return;
		}
		readTarget();
		syncVisibility();
	};

	const applyMode = () => {
		if (mobileQuery.matches) {
			stopParallax();
			syncVisibility();
			return;
		}
		stage.classList.remove('is-hidden');
		startParallax();
	};

	applyMode();
	window.addEventListener('scroll', onScroll, { passive: true });
	getLenis()?.on('scroll', onScroll);
	mobileQuery.addEventListener('change', applyMode);
	window.addEventListener('resize', applyMode, { passive: true });

	document.addEventListener(
		'astro:before-preparation',
		() => {
			stopParallax();
		},
		{ once: true },
	);
}

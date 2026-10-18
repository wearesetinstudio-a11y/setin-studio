import { getLenis } from './initSmoothScroll.ts';

/**
 * Slow-scroll parallax for pitch hero stages — same strength as About / project heroes.
 * Expects: `[data-pitch-hero]` → `[data-pitch-hero-stage]` → `[data-pitch-hero-shift]`.
 */
export function initPitchHeroParallax() {
	const hero = document.querySelector<HTMLElement>('[data-pitch-hero]');
	const stage = hero?.querySelector<HTMLElement>('[data-pitch-hero-stage]');
	if (!hero || !stage || hero.dataset.pitchHeroParallaxInit === 'true') return;

	hero.dataset.pitchHeroParallaxInit = 'true';

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const shift = stage.querySelector<HTMLElement>('[data-pitch-hero-shift]');
	if (!shift || reduceMotion) return;

	const isMobile = window.matchMedia('(max-width: 767px)').matches;
	const TRAVEL = 0.12;
	const LERP = isMobile ? 0.14 : 0.22;

	let target = 0;
	let current = 0;
	let rafId = 0;

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
		current += (target - current) * LERP;
		if (Math.abs(target - current) < 0.05) current = target;
		shift.style.transform = `translate3d(0, ${current}px, 0)`;
		rafId = requestAnimationFrame(tick);
	};

	stage.classList.add('is-parallax-active');
	readTarget();
	current = target;
	rafId = requestAnimationFrame(tick);

	const onScroll = () => {
		readTarget();
		stage.classList.toggle('is-hidden', hero.getBoundingClientRect().bottom <= 0 && !isMobile);
	};

	window.addEventListener('scroll', onScroll, { passive: true });
	getLenis()?.on('scroll', onScroll);
	window.addEventListener(
		'resize',
		() => {
			readTarget();
			current = target;
		},
		{ passive: true },
	);

	document.addEventListener(
		'astro:before-preparation',
		() => {
			cancelAnimationFrame(rafId);
		},
		{ once: true },
	);
}

import { getLenis } from './initSmoothScroll.ts';

/**
 * Toros pitch nav: background fades in gently over the hero height,
 * reaching full opacity as the hero bottom clears the nav.
 */
export function initTorosNav() {
	const nav = document.getElementById('pitch-nav');
	const hero = document.getElementById('toros-hero');
	if (!nav || !hero) return;

	const update = () => {
		const navH = nav.offsetHeight;
		document.documentElement.style.setProperty('--pitch-nav-offset', `${navH}px`);

		const heroBottom = hero.getBoundingClientRect().bottom;
		// 0 at top of page (hero fully covering viewport under nav)
		// 1 when hero bottom has cleared the nav
		const range = Math.max(hero.offsetHeight - navH, 1);
		const scrolled = Math.min(Math.max(hero.offsetHeight - heroBottom, 0), range);
		const progress = Math.min(1, Math.max(0, scrolled / range));

		nav.style.setProperty('--toros-nav-bg', String(progress));
		nav.classList.toggle('is-scrolled', progress > 0.02);
	};

	update();
	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update);

	const bindLenis = () => {
		const lenis = getLenis();
		if (!lenis) return false;
		lenis.on('scroll', update);
		return true;
	};

	if (!bindLenis()) {
		let tries = 0;
		const timer = window.setInterval(() => {
			tries += 1;
			if (bindLenis() || tries > 40) window.clearInterval(timer);
		}, 50);
	}
}

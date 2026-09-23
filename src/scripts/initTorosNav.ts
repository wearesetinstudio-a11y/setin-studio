import { getLenis } from './initSmoothScroll.ts';

/**
 * Toros pitch nav:
 * - solid bar after leaving the hero
 * - active section link at 50% opacity
 * - links stay fixed in place (no horizontal shifting)
 */
export function initTorosNav() {
	const nav = document.getElementById('pitch-nav');
	const hero = document.getElementById('toros-hero');
	const links = nav
		? Array.from(nav.querySelectorAll<HTMLAnchorElement>('.toros-nav__link[data-section]'))
		: [];

	if (!nav || !hero || !links.length) return;

	const sections = links
		.map((link) => {
			const id = link.dataset.section;
			if (!id) return null;
			const el = document.getElementById(id);
			return el ? { id, el, link } : null;
		})
		.filter((item): item is { id: string; el: HTMLElement; link: HTMLAnchorElement } => !!item);

	let activeId = '';

	const update = () => {
		const navH = nav.offsetHeight;
		const heroBottom = hero.getBoundingClientRect().bottom;
		nav.classList.toggle('is-scrolled', heroBottom <= navH + 8);

		const probe = navH + 48;
		let nextActive = '';

		// Only highlight once a linked section has reached the probe — never default on hero
		for (const section of sections) {
			const top = section.el.getBoundingClientRect().top;
			if (top <= probe) nextActive = section.id;
		}

		if (heroBottom > navH + 8) {
			nextActive = '';
		}

		if (nextActive !== activeId) {
			activeId = nextActive;
			for (const section of sections) {
				section.link.classList.toggle('is-active', section.id === activeId);
			}
		}
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

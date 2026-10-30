import { getLenis } from './initSmoothScroll.ts';

/** Desktop travel factor. */
export const BG_PARALLAX_TRAVEL_DESKTOP = 0.2;
/** Mobile travel factor. */
export const BG_PARALLAX_TRAVEL_MOBILE = 0.12;
export const BG_PARALLAX_LERP_DESKTOP = 0.22;

export type BgParallaxOptions = {
	/** Element whose viewport progress drives the offset (usually the section). */
	root: HTMLElement;
	/**
	 * Clip host — should carry `.bg-parallax`
	 * (and `.bg-parallax--hero` for page-top heroes).
	 */
	visual: HTMLElement;
	/** Layer that receives `translate3d(0, y, 0)`. */
	shift: HTMLElement;
	/** Override travel factor. */
	travel?: number;
};

/**
 * Universal JS parallax (mobile + desktop).
 * Only mutates `transform: translate3d` — never width/height/scale.
 * Mobile uses rAF-coalesced scroll (Lenis when available); no resize thrash.
 */
export function initBgParallax(options: BgParallaxOptions): void {
	const { root, visual, shift, travel: travelOverride } = options;
	if (visual.dataset.parallaxInit === 'true') return;

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduceMotion) return;

	visual.dataset.parallaxInit = 'true';

	const mobileQuery = window.matchMedia('(max-width: 767px)');
	const isHero = visual.classList.contains('bg-parallax--hero');

	let target = 0;
	let current = 0;
	let rafId = 0;
	let desktopRunning = false;
	let mobileTickScheduled = false;
	const unsubscribers: Array<() => void> = [];

	const clearBindings = () => {
		while (unsubscribers.length) unsubscribers.pop()?.();
	};

	const travel = () => {
		if (travelOverride != null) return travelOverride;
		return mobileQuery.matches ? BG_PARALLAX_TRAVEL_MOBILE : BG_PARALLAX_TRAVEL_DESKTOP;
	};

	const readTarget = () => {
		const rect = root.getBoundingClientRect();
		const factor = travel();

		/*
		 * Heroes on mobile: start at 0 when scrollY ≈ 0, then lag gently
		 * as the section moves up. Clamped to the CSS bleed buffer (~10%).
		 */
		if (isHero && mobileQuery.matches) {
			const scrolled = Math.max(0, -rect.top);
			/* Stay inside the mobile CSS bleed buffer. */
			const max = rect.height * 0.12;
			target = Math.max(-max, -scrolled * factor);
			return;
		}

		const viewportH = root.ownerDocument.documentElement.clientHeight;
		const start = viewportH;
		const end = -rect.height;
		const range = start - end;
		const progress =
			range === 0 ? 0 : Math.min(1, Math.max(0, (start - rect.top) / range));
		const max = rect.height * factor;
		target = -max + progress * (2 * max);
	};

	const applyTransform = (y: number) => {
		shift.style.transform = `translate3d(0, ${y}px, 0)`;
	};

	const stopDesktop = () => {
		desktopRunning = false;
		cancelAnimationFrame(rafId);
		rafId = 0;
	};

	const tickDesktop = () => {
		if (!desktopRunning) return;
		current += (target - current) * BG_PARALLAX_LERP_DESKTOP;
		if (Math.abs(target - current) < 0.05) current = target;
		applyTransform(current);
		rafId = requestAnimationFrame(tickDesktop);
	};

	/** Mobile: one rAF per scroll burst — direct transform, no lerp. */
	const syncMobile = () => {
		mobileTickScheduled = false;
		readTarget();
		current = target;
		applyTransform(current);
	};

	const scheduleMobile = () => {
		if (mobileTickScheduled) return;
		mobileTickScheduled = true;
		requestAnimationFrame(syncMobile);
	};

	const startMobile = () => {
		const onScroll = () => {
			scheduleMobile();
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		unsubscribers.push(() => window.removeEventListener('scroll', onScroll));

		const lenis = getLenis();
		if (lenis) {
			unsubscribers.push(lenis.on('scroll', onScroll));
		}

		syncMobile();
	};

	const startDesktop = () => {
		if (desktopRunning) return;
		desktopRunning = true;
		readTarget();
		current = target;
		rafId = requestAnimationFrame(tickDesktop);

		const onScroll = () => {
			readTarget();
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		unsubscribers.push(() => window.removeEventListener('scroll', onScroll));

		const lenis = getLenis();
		if (lenis) {
			unsubscribers.push(lenis.on('scroll', onScroll));
		}
	};

	const applyMode = () => {
		stopDesktop();
		clearBindings();
		mobileTickScheduled = false;
		shift.style.removeProperty('transform');

		if (mobileQuery.matches) {
			startMobile();
			return;
		}
		startDesktop();
	};

	applyMode();
	mobileQuery.addEventListener('change', applyMode);

	/* Desktop resize only — mobile address-bar resize causes layout thrash. */
	window.addEventListener(
		'resize',
		() => {
			if (mobileQuery.matches) return;
			readTarget();
			current = target;
		},
		{ passive: true },
	);

	document.addEventListener(
		'astro:before-preparation',
		() => {
			stopDesktop();
			clearBindings();
		},
		{ once: true },
	);
}

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

type SmoothScrollWindow = Window &
	typeof globalThis & {
		__setinLenis?: Lenis | null;
		__setinSmoothScrollClicksReady?: boolean;
	};

let lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
	return lenis ?? (window as SmoothScrollWindow).__setinLenis ?? null;
}

export function stopSmoothScroll() {
	getLenis()?.stop();
}

export function startSmoothScroll() {
	getLenis()?.start();
}

export function scrollToImmediate(y: number) {
	const instance = getLenis();
	if (instance) {
		instance.scrollTo(y, { immediate: true, force: true });
		return;
	}
	window.scrollTo(0, y);
}

function getScrollOffset() {
	const header = document.getElementById('site-header');
	return -(header?.offsetHeight ?? 0) - 12;
}

export function scrollToId(id: string, options?: { immediate?: boolean }) {
	const target = document.getElementById(id);
	if (!target) return;

	const instance = getLenis();
	const offset = getScrollOffset();

	if (instance) {
		instance.start();
		instance.resize();

		const distance = Math.abs(
			target.getBoundingClientRect().top + instance.scroll + offset - instance.scroll,
		);
		// Smooth but snappier than a long ease — still softer than default lerp.
		const duration = Math.min(1.55, Math.max(0.85, distance / 3200));

		instance.scrollTo(`#${id}`, {
			offset,
			force: true,
			immediate: options?.immediate ?? false,
			...(options?.immediate
				? {}
				: {
						duration,
						easing: (t: number) => 1 - Math.pow(1 - t, 2.6),
					}),
		});
		return;
	}

	const top = target.getBoundingClientRect().top + window.scrollY + offset;
	window.scrollTo({ top, behavior: options?.immediate ? 'auto' : 'smooth' });
}

function waitForMobileNavClosed(timeoutMs = 2200): Promise<void> {
	if (!document.body.classList.contains('mobile-nav-open')) {
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		const started = performance.now();

		const tick = () => {
			if (
				!document.body.classList.contains('mobile-nav-open') ||
				performance.now() - started > timeoutMs
			) {
				resolve();
				return;
			}
			requestAnimationFrame(tick);
		};

		tick();
	});
}

function initAnchorScrollClicks() {
	const scrollWindow = window as SmoothScrollWindow;
	if (scrollWindow.__setinSmoothScrollClicksReady) return;
	scrollWindow.__setinSmoothScrollClicksReady = true;

	document.addEventListener(
		'click',
		(event) => {
			if (event.defaultPrevented) return;
			if (event.button !== 0) return;
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

			const target = event.target;
			if (!(target instanceof Element)) return;

			const anchor = target.closest('a');
			if (!(anchor instanceof HTMLAnchorElement)) return;

			const hrefAttr = anchor.getAttribute('href');
			if (!hrefAttr || !hrefAttr.includes('#contact')) return;

			let url: URL;
			try {
				url = new URL(anchor.href, window.location.href);
			} catch {
				return;
			}

			if (url.origin !== window.location.origin) return;
			if (url.pathname !== window.location.pathname) return;
			if (url.hash !== '#contact') return;

			event.preventDefault();
			event.stopPropagation();

			void (async () => {
				const menuWasOpen = document.body.classList.contains('mobile-nav-open');
				if (menuWasOpen) {
					const toggle = document.getElementById('mobile-nav-toggle');
					if (toggle?.classList.contains('is-open')) {
						toggle.click();
					}
					await waitForMobileNavClosed();
					// Body unlock restores scroll; Lenis still has a stale limit until resize.
					await new Promise<void>((resolve) => {
						requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
					});
				}

				scrollToId('contact');
				if (window.location.hash !== '#contact') {
					window.history.pushState(
						window.history.state,
						'',
						`${window.location.pathname}${window.location.search}#contact`,
					);
				}
			})();
		},
		true,
	);
}

export function initSmoothScroll() {
	const scrollWindow = window as SmoothScrollWindow;

	initAnchorScrollClicks();

	if (lenis) {
		lenis.resize();
		return;
	}

	lenis = new Lenis({
		autoRaf: true,
		lerp: 0.075,
		smoothWheel: true,
		anchors: {
			offset: getScrollOffset(),
			duration: 1.15,
			easing: (t: number) => 1 - Math.pow(1 - t, 2.6),
		},
		respectReducedMotion: true,
		wheelMultiplier: 0.9,
	});

	scrollWindow.__setinLenis = lenis;

	if (document.documentElement.classList.contains('intro-pending')) {
		lenis.stop();
		window.addEventListener(
			'intro-complete',
			() => {
				lenis?.start();
			},
			{ once: true },
		);
	}
}

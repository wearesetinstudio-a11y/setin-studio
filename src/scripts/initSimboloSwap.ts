/**
 * Sticky símbolo showcase:
 * - Desktop: swap mark when each copy block crosses the sticky stage
 * - Mobile: pin logo + copy in viewport; scroll progress swaps both in place
 */
export function initSimboloSwap() {
	const root = document.getElementById('simbolo');
	if (!root) return;

	const scroller = root.querySelector<HTMLElement>('[data-simbolo-scroller]');
	const stage = root.querySelector<HTMLElement>('.toros-simbolo__stage');
	const visuals = Array.from(root.querySelectorAll<HTMLElement>('[data-simbolo-visual]'));
	const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-simbolo-step]'));
	if (!visuals.length || !steps.length) return;

	const mobileMq = window.matchMedia('(max-width: 1023px)');
	let active = -1;

	const setActive = (index: number) => {
		if (index === active || index < 0 || index >= visuals.length) return;
		active = index;
		visuals.forEach((el, i) => {
			el.classList.toggle('is-active', i === index);
			el.setAttribute('aria-hidden', i === index ? 'false' : 'true');
		});
		steps.forEach((el, i) => {
			el.classList.toggle('is-active', i === index);
		});
	};

	setActive(0);

	const probeY = () => {
		if (stage) {
			const r = stage.getBoundingClientRect();
			return r.top + r.height * 0.5;
		}
		return window.innerHeight * 0.45;
	};

	const updateMobile = () => {
		if (!scroller) {
			setActive(0);
			return;
		}
		const rect = scroller.getBoundingClientRect();
		const total = Math.max(1, scroller.offsetHeight - window.innerHeight);
		const scrolled = Math.max(0, Math.min(total, -rect.top));
		const progress = scrolled / total;
		const next = Math.min(
			steps.length - 1,
			Math.max(0, Math.floor(progress * steps.length + 0.001)),
		);
		setActive(next);
	};

	const updateDesktop = () => {
		const probe = probeY();
		let next = 0;
		for (let i = 0; i < steps.length; i++) {
			const top = steps[i].getBoundingClientRect().top;
			const nextTop =
				i < steps.length - 1 ? steps[i + 1].getBoundingClientRect().top : Number.POSITIVE_INFINITY;
			if (probe >= top && probe < nextTop) {
				next = i;
				break;
			}
			if (top <= probe) next = i;
		}
		setActive(next);
	};

	const update = () => {
		if (mobileMq.matches) updateMobile();
		else updateDesktop();
	};

	update();
	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update);
	mobileMq.addEventListener('change', update);

	type LenisLike = { on: (e: string, cb: () => void) => void };
	const win = window as Window & { __setinLenis?: LenisLike };
	const bindLenis = () => {
		if (!win.__setinLenis) return false;
		win.__setinLenis.on('scroll', update);
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

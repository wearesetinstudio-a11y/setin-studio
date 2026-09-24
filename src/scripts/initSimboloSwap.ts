/**
 * Sticky símbolo showcase:
 * Pin mark + copy in the viewport; scroll progress swaps both in place
 * (blur crossfade on copy, opacity on mark) — no stacked text scroll.
 */
export function initSimboloSwap() {
	const root = document.getElementById('simbolo');
	if (!root) return;

	const scroller = root.querySelector<HTMLElement>('[data-simbolo-scroller]');
	const visuals = Array.from(root.querySelectorAll<HTMLElement>('[data-simbolo-visual]'));
	const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-simbolo-step]'));
	if (!visuals.length || !steps.length) return;

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

	const update = () => {
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

	update();
	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update);

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

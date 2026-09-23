/**
 * Sticky símbolo showcase: swap left graphic when each copy block enters view.
 */
export function initSimboloSwap() {
	const root = document.getElementById('simbolo');
	if (!root) return;

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

	const probeY = () => window.innerHeight * 0.42;

	const update = () => {
		let next = 0;
		const probe = probeY();
		for (let i = 0; i < steps.length; i++) {
			const top = steps[i].getBoundingClientRect().top;
			if (top <= probe) next = i;
		}
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

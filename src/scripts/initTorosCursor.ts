const ASSET = '/pitches/toros-dechiriqui';

type CursorWindow = Window &
	typeof globalThis & {
		__torosCursorReady?: boolean;
	};

/**
 * Custom Toros cursor: crisp SVG arrow, snaps to pointer (no lag shake),
 * rotation is lightly smoothed.
 */
export function initTorosCursor() {
	const win = window as CursorWindow;
	if (win.__torosCursorReady) return;
	if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

	win.__torosCursorReady = true;

	const root = document.createElement('div');
	root.className = 'toros-cursor';
	root.setAttribute('aria-hidden', 'true');
	root.innerHTML = `
		<img class="toros-cursor__arrow" src="${ASSET}/cursor-arrow.svg" alt="" width="32" height="32" draggable="false" />
	`;
	document.body.appendChild(root);
	document.documentElement.classList.add('toros-cursor-active');

	const arrow = root.querySelector<HTMLElement>('.toros-cursor__arrow');
	if (!arrow) return;

	let pointerX = -100;
	let pointerY = -100;
	let angle = 0;
	let renderedAngle = 0;
	let lastMoveX = 0;
	let lastMoveY = 0;
	let visible = false;
	let raf = 0;

	const show = () => {
		if (visible) return;
		visible = true;
		root.classList.add('is-visible');
	};

	const hide = () => {
		visible = false;
		root.classList.remove('is-visible');
	};

	const render = () => {
		raf = 0;
		// Smooth rotation only — position tracks the pointer 1:1 (no positional jitter)
		const delta = ((angle - renderedAngle + 540) % 360) - 180;
		renderedAngle += delta * 0.28;
		arrow.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%) rotate(${renderedAngle}deg)`;
	};

	const schedule = () => {
		if (!raf) raf = requestAnimationFrame(render);
	};

	window.addEventListener(
		'pointermove',
		(event) => {
			if (event.pointerType !== 'mouse') return;
			pointerX = event.clientX;
			pointerY = event.clientY;
			show();

			const dx = pointerX - lastMoveX;
			const dy = pointerY - lastMoveY;
			if (dx * dx + dy * dy > 1.5) {
				angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
				lastMoveX = pointerX;
				lastMoveY = pointerY;
			}
			schedule();
		},
		{ passive: true },
	);

	window.addEventListener('pointerleave', hide);
	document.addEventListener('mouseleave', hide);
	window.addEventListener('blur', hide);
}

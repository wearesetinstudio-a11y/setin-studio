import { Alignment, Fit, Layout, Rive } from '@rive-app/canvas';

export function initRiveCovers() {
	document.querySelectorAll<HTMLCanvasElement>('[data-rive-cover]').forEach((canvas) => {
		if (canvas.dataset.riveInitialized === 'true') return;
		const src = canvas.dataset.riveCover;
		if (!src) return;

		canvas.dataset.riveInitialized = 'true';
		let restarting = false;
		let rive: Rive;
		const fit = canvas.dataset.riveFit === 'contain' ? Fit.Contain : Fit.Cover;

		const loopCover = () => {
			if (restarting || !rive) return;
			restarting = true;

			const animations = rive.animationNames;
			if (animations.length > 0) {
				rive.play(animations);
			} else {
				const stateMachine = rive.stateMachineNames[0];
				if (stateMachine) rive.play(stateMachine);
			}

			requestAnimationFrame(() => {
				restarting = false;
			});
		};

		const resizeCanvas = () => {
			const rect = canvas.getBoundingClientRect();
			const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
			if (!rect.width || !rect.height) return;

			canvas.width = Math.round(rect.width * pixelRatio);
			canvas.height = Math.round(rect.height * pixelRatio);
			rive.resizeDrawingSurfaceToCanvas();
		};

		rive = new Rive({
			src,
			canvas,
			autoplay: false,
			layout: Layout.new({ fit, alignment: Alignment.Center }),
			onLoad: () => {
				const bounds = rive.bounds;
				if (bounds && canvas.dataset.riveFit === 'contain') {
					const width = bounds.maxX - bounds.minX;
					const height = bounds.maxY - bounds.minY;
					if (width > 0 && height > 0) {
						canvas.style.aspectRatio = `${width} / ${height}`;
					}
				}
				loopCover();
				resizeCanvas();
			},
			onLoadError: () => {
				delete canvas.dataset.riveInitialized;
			},
			onStop: loopCover,
		});

		resizeCanvas();
		new ResizeObserver(resizeCanvas).observe(canvas);
	});
}

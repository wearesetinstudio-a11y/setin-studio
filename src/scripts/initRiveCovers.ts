import { Alignment, EventType, Fit, Layout, Rive } from '@rive-app/canvas';

type RiveCoverWindow = Window &
	typeof globalThis & {
		__setinRiveCoverObserver?: IntersectionObserver;
	};

type CoverState = {
	rive: Rive;
	play: () => void;
	pause: () => void;
};

const covers = new WeakMap<HTMLCanvasElement, CoverState>();

function getObserver(): IntersectionObserver {
	const coverWindow = window as RiveCoverWindow;
	if (coverWindow.__setinRiveCoverObserver) return coverWindow.__setinRiveCoverObserver;

	coverWindow.__setinRiveCoverObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const canvas = entry.target as HTMLCanvasElement;
				const state = covers.get(canvas);
				if (!state) continue;
				if (entry.isIntersecting) state.play();
				else state.pause();
			}
		},
		{ rootMargin: '120px 0px', threshold: 0.05 },
	);

	return coverWindow.__setinRiveCoverObserver;
}

function startPlayback(rive: Rive) {
	// Cover timelines are often the looping art; state machines may idle waiting for input.
	const animations = rive.animationNames;
	if (animations.length > 0) {
		rive.play(animations);
		return;
	}

	const stateMachine = rive.stateMachineNames[0];
	if (stateMachine) rive.play(stateMachine);
}

export function initRiveCovers() {
	const observer = getObserver();

	document.querySelectorAll<HTMLCanvasElement>('[data-rive-cover]').forEach((canvas) => {
		if (covers.has(canvas) || canvas.dataset.riveInitialized === 'true') {
			observer.observe(canvas);
			return;
		}

		const src = canvas.dataset.riveCover;
		if (!src) return;

		canvas.dataset.riveInitialized = 'true';
		let rive: Rive;
		let shouldPlay = false;
		let watchdogId: ReturnType<typeof setInterval> | null = null;
		const fit = canvas.dataset.riveFit === 'contain' ? Fit.Contain : Fit.Cover;

		const clearWatchdog = () => {
			if (!watchdogId) return;
			window.clearInterval(watchdogId);
			watchdogId = null;
		};

		const ensurePlaying = () => {
			if (!shouldPlay || !rive) return;
			startPlayback(rive);
		};

		const play = () => {
			shouldPlay = true;
			startPlayback(rive);
			clearWatchdog();
			// Some .riv files end without a reliable stop event — nudge them while visible.
			watchdogId = window.setInterval(ensurePlaying, 2000);
		};

		const pause = () => {
			shouldPlay = false;
			clearWatchdog();
			try {
				rive?.pause();
			} catch {
				/* ignore */
			}
		};

		const resizeCanvas = () => {
			const rect = canvas.getBoundingClientRect();
			const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
			if (!rect.width || !rect.height) return;

			const nextW = Math.round(rect.width * pixelRatio);
			const nextH = Math.round(rect.height * pixelRatio);
			if (canvas.width === nextW && canvas.height === nextH) return;

			canvas.width = nextW;
			canvas.height = nextH;
			rive?.resizeDrawingSurfaceToCanvas();
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
				resizeCanvas();
				covers.set(canvas, { rive, play, pause });
				rive.on(EventType.Stop, () => {
					if (shouldPlay) startPlayback(rive);
				});
				observer.observe(canvas);
				const rect = canvas.getBoundingClientRect();
				const inView =
					rect.bottom > 0 &&
					rect.top < window.innerHeight &&
					rect.right > 0 &&
					rect.left < window.innerWidth;
				if (inView) play();
			},
			onLoadError: () => {
				delete canvas.dataset.riveInitialized;
				covers.delete(canvas);
				clearWatchdog();
				observer.unobserve(canvas);
			},
			onStop: () => {
				if (shouldPlay) startPlayback(rive);
			},
		});

		resizeCanvas();
		new ResizeObserver(resizeCanvas).observe(canvas);
	});
}

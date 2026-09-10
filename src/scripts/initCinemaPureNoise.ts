type NoiseController = {
	restart: () => void;
	stop: () => void;
};

const controllers = new WeakMap<HTMLCanvasElement, NoiseController>();

export function initCinemaPureNoise(
	canvasId: string,
	options: {
		observeElementId?: string;
		density?: number;
		grainSize?: number;
		baseOpacity?: number;
	} = {},
): NoiseController | null {
	const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
	if (!canvas) return null;

	const existing = controllers.get(canvas);
	if (existing) {
		existing.restart();
		return existing;
	}

	const ctx = canvas.getContext('2d');
	const container = canvas.parentElement;
	if (!ctx || !container) return null;

	const isMobile = window.matchMedia('(max-width: 767px)').matches;
	const NOISE_DENSITY = options.density ?? (isMobile ? 0.034 : 0.052);
	const GRAIN_SIZE = options.grainSize ?? (isMobile ? 0.65 : 0.75);
	const BASE_OPACITY = options.baseOpacity ?? (isMobile ? 0.2 : 0.17);
	const MAX_NOISE_WIDTH = isMobile ? 640 : 1100;
	const MAX_NOISE_HEIGHT = isMobile ? 420 : 700;
	const TOTAL_BUFFERS = isMobile ? 4 : 6;
	const FRAME_INTERVAL = isMobile ? 180 : 140;

	let dpr = window.devicePixelRatio || 1;
	let noiseBuffers: HTMLCanvasElement[] = [];
	let currentBufferFrame = 0;
	let noiseWidth = 0;
	let noiseHeight = 0;
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let pendingBufferIndex = 0;
	let isObservedVisible = true;
	let lastLayoutWidth = 0;
	let lastLayoutHeight = 0;

	function getNoiseDimensions(w: number, h: number) {
		const scale = Math.min(1, MAX_NOISE_WIDTH / w, MAX_NOISE_HEIGHT / h);
		return {
			w: Math.max(1, Math.floor(w * scale)),
			h: Math.max(1, Math.floor(h * scale)),
		};
	}

	function renderNoiseBuffer(w: number, h: number, bufferIndex: number) {
		const grainCount = Math.floor(w * h * NOISE_DENSITY);
		const bufferCanvas = document.createElement('canvas');
		bufferCanvas.width = w;
		bufferCanvas.height = h;
		const bCtx = bufferCanvas.getContext('2d');
		if (!bCtx) return null;

		bCtx.fillStyle = `rgba(255, 255, 255, ${BASE_OPACITY})`;

		for (let i = 0; i < grainCount; i++) {
			bCtx.fillRect(Math.random() * w, Math.random() * h, GRAIN_SIZE, GRAIN_SIZE);
		}

		bCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
		const scratchCount = Math.floor(Math.random() * 2) + 1;
		for (let s = 0; s < scratchCount; s++) {
			bCtx.fillRect(
				Math.random() * w,
				Math.random() * (h * 0.2),
				0.75,
				Math.random() * (h * 0.5) + h * 0.1,
			);
		}

		noiseBuffers[bufferIndex] = bufferCanvas;
		return bufferCanvas;
	}

	function preRenderNoiseAsync(w: number, h: number) {
		const previousBuffers = noiseBuffers.filter(Boolean);
		noiseBuffers = new Array(TOTAL_BUFFERS);
		pendingBufferIndex = 0;

		const firstBuffer = renderNoiseBuffer(w, h, 0);
		if (!firstBuffer && previousBuffers.length > 0) {
			noiseBuffers = previousBuffers.slice(0, TOTAL_BUFFERS);
			return;
		}

		drawFrame();

		function renderNextBuffer() {
			pendingBufferIndex += 1;
			if (pendingBufferIndex >= TOTAL_BUFFERS) return;

			renderNoiseBuffer(w, h, pendingBufferIndex);

			if (pendingBufferIndex < TOTAL_BUFFERS - 1) {
				window.requestAnimationFrame(renderNextBuffer);
			}
		}

		if (TOTAL_BUFFERS > 1) {
			window.requestAnimationFrame(renderNextBuffer);
		}
	}

	function resizeCanvas() {
		const rect = container.getBoundingClientRect();
		if (rect.width < 2 || rect.height < 2) {
			window.requestAnimationFrame(resizeCanvas);
			return;
		}

		const nextWidth = Math.round(rect.width);
		const nextHeight = Math.round(rect.height);
		if (
			nextWidth === lastLayoutWidth &&
			nextHeight === lastLayoutHeight &&
			noiseBuffers.some(Boolean)
		) {
			return;
		}

		lastLayoutWidth = nextWidth;
		lastLayoutHeight = nextHeight;
		dpr = window.devicePixelRatio || 1;

		canvas.width = Math.max(1, Math.floor(rect.width * dpr));
		canvas.height = Math.max(1, Math.floor(rect.height * dpr));
		canvas.style.width = `${rect.width}px`;
		canvas.style.height = `${rect.height}px`;

		const noiseSize = getNoiseDimensions(rect.width, rect.height);
		noiseWidth = noiseSize.w;
		noiseHeight = noiseSize.h;

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		preRenderNoiseAsync(noiseWidth, noiseHeight);
	}

	function drawFrame() {
		const width = canvas.width / dpr;
		const height = canvas.height / dpr;
		const availableFrames = noiseBuffers.filter(Boolean).length;
		if (!availableFrames) return;

		const frame = noiseBuffers[currentBufferFrame % availableFrames];

		ctx.clearRect(0, 0, width, height);
		if (frame) {
			ctx.drawImage(frame, 0, 0, width, height);
		}

		currentBufferFrame = (currentBufferFrame + 1) % Math.max(availableFrames, 1);
	}

	function startNoise() {
		if (intervalId) return;
		drawFrame();
		intervalId = window.setInterval(drawFrame, FRAME_INTERVAL);
	}

	function stopNoise() {
		if (!intervalId) return;
		window.clearInterval(intervalId);
		intervalId = null;
	}

	function restart() {
		resizeCanvas();
		if (isObservedVisible) startNoise();
	}

	function initCanvas() {
		resizeCanvas();
		if (isObservedVisible) startNoise();
	}

	const onResize = () => {
		window.requestAnimationFrame(resizeCanvas);
	};

	window.addEventListener('resize', onResize, { passive: true });

	const observeElementId = options.observeElementId;
	if (observeElementId) {
		const observedElement = document.getElementById(observeElementId);
		if (observedElement) {
			const visibilityObserver = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						isObservedVisible = entry.isIntersecting;
						if (entry.isIntersecting) startNoise();
						else stopNoise();
					}
				},
				{ threshold: 0, rootMargin: '120px 0px 120px 0px' },
			);
			visibilityObserver.observe(observedElement);
		} else {
			startNoise();
		}
	} else {
		startNoise();
	}

	if (isMobile) {
		window.requestAnimationFrame(initCanvas);
	} else {
		initCanvas();
	}

	const controller: NoiseController = {
		restart,
		stop: stopNoise,
	};

	controllers.set(canvas, controller);
	return controller;
}

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

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const isMobile = window.matchMedia('(max-width: 767px)').matches;

	const NOISE_DENSITY = options.density ?? (isMobile ? 0.07 : 0.09);
	const GRAIN_SIZE = options.grainSize ?? 0.6;
	const BASE_OPACITY = options.baseOpacity ?? (isMobile ? 0.14 : 0.12);
	const MAX_NOISE_WIDTH = isMobile ? 720 : 1440;
	const MAX_NOISE_HEIGHT = isMobile ? 480 : 900;
	/** More noise animation frames for filmic grain cycling */
	const TOTAL_BUFFERS = prefersReducedMotion ? 2 : isMobile ? 4 : 6;
	const FRAME_INTERVAL = prefersReducedMotion ? 240 : isMobile ? 160 : 130;

	const ROLL_BAND_HEIGHT = isMobile ? 0.24 : 0.3;
	const ROLL_CYCLE_MS = isMobile ? 5200 : 6400;
	const ROLL_OPACITY = isMobile ? 0.012 : 0.015;
	const ROLL_BAND_COUNT = 2;

	/** CRT corner darkening */
	const VIGNETTE_OPACITY = isMobile ? 0.32 : 0.4;
	const SCANLINE_OPACITY = isMobile ? 0.07 : 0.1;
	const SCANLINE_GAP = isMobile ? 3 : 2;

	let noiseBuffers: HTMLCanvasElement[] = [];
	let scanlinePattern: CanvasPattern | null = null;
	let currentBufferFrame = 0;
	let noiseWidth = 0;
	let noiseHeight = 0;
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let pendingBufferIndex = 0;
	let isObservedVisible = true;
	let lastLayoutWidth = 0;
	let lastLayoutHeight = 0;
	let rollStartedAt = performance.now();
	let rollHoldUntil = 0;
	let rollFrozenT = 0;
	/** Occasional CRT tube dip */
	let tubeDipUntil = 0;
	let tubeDipStrength = 0;

	/** Horizontal tear / interference lines — continuous bottom→top scroll */
	const TEAR_LINE_COUNT = 3;
	const TEAR_BAND_HEIGHT = isMobile ? 0.0022 : 0.0025;
	const TEAR_CYCLE_MS = isMobile ? 7800 : 9000;
	const tearOffsets = Array.from({ length: TEAR_LINE_COUNT }, () =>
		(Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 12),
	);
	const tearSkews = Array.from({ length: TEAR_LINE_COUNT }, () => (Math.random() - 0.5) * 6);
	const tearInverts = Array.from({ length: TEAR_LINE_COUNT }, () => Math.random() < 0.25);
	/** Per-line visibility 0→1; some fade out while others fade in */
	const tearOpacities = Array.from({ length: TEAR_LINE_COUNT }, () => 0.25 + Math.random() * 0.25);
	const tearOpacityTargets = Array.from({ length: TEAR_LINE_COUNT }, () => 0.45);
	/** Spread phases with wider gaps (~1/3 screen apart) */
	const tearPhaseOffsets = Array.from({ length: TEAR_LINE_COUNT }, (_, i) => i / TEAR_LINE_COUNT);
	let tearFadeNextAt = performance.now() + 800;
	let cachedMedia: HTMLVideoElement | HTMLImageElement | null | undefined;
	let cachedCrop: { sx: number; sy: number; sw: number; sh: number } | null = null;
	let cachedCropKey = '';

	canvas.style.contain = 'strict';
	canvas.style.maxWidth = '100%';
	canvas.style.pointerEvents = 'none';

	function getSourceMedia(): HTMLVideoElement | HTMLImageElement | null {
		if (cachedMedia !== undefined) {
			const media = cachedMedia;
			if (media instanceof HTMLVideoElement && media.readyState >= 2) return media;
			if (media instanceof HTMLImageElement && media.complete && media.naturalWidth > 0) {
				return media;
			}
		}

		const video = container.querySelector('video');
		if (video && video.readyState >= 2) {
			cachedMedia = video;
			return video;
		}
		const img = container.querySelector('img');
		if (img && img.complete && img.naturalWidth > 0) {
			cachedMedia = img;
			return img;
		}
		cachedMedia = video ?? img ?? null;
		return cachedMedia;
	}

	function getCoverCrop(
		mediaW: number,
		mediaH: number,
		destW: number,
		destH: number,
	) {
		const scale = Math.max(destW / mediaW, destH / mediaH);
		const sw = destW / scale;
		const sh = destH / scale;
		return {
			sx: (mediaW - sw) * 0.5,
			sy: (mediaH - sh) * 0.5,
			sw,
			sh,
		};
	}

	function getNoiseDimensions(w: number, h: number) {
		const scale = Math.min(1, MAX_NOISE_WIDTH / w, MAX_NOISE_HEIGHT / h);
		return {
			w: Math.max(1, Math.floor(w * scale)),
			h: Math.max(1, Math.floor(h * scale)),
		};
	}

	function buildScanlinePattern() {
		const tile = document.createElement('canvas');
		tile.width = 1;
		tile.height = SCANLINE_GAP + 1;
		const tCtx = tile.getContext('2d');
		if (!tCtx) {
			scanlinePattern = null;
			return;
		}
		tCtx.fillStyle = `rgba(0, 0, 0, ${SCANLINE_OPACITY})`;
		tCtx.fillRect(0, 0, 1, 1);
		scanlinePattern = ctx.createPattern(tile, 'repeat');
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

		bCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
		const scratchCount = Math.floor(Math.random() * 5) + 6;
		for (let s = 0; s < scratchCount; s++) {
			const scratchW = Math.random() < 0.7 ? 0.35 : 0.55;
			bCtx.fillRect(
				Math.random() * w,
				Math.random() * (h * 0.35),
				scratchW,
				Math.random() * (h * 0.55) + h * 0.12,
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

		const noiseSize = getNoiseDimensions(rect.width, rect.height);
		noiseWidth = noiseSize.w;
		noiseHeight = noiseSize.h;

		canvas.width = Math.max(1, nextWidth);
		canvas.height = Math.max(1, nextHeight);
		canvas.style.width = `${rect.width}px`;
		canvas.style.height = `${rect.height}px`;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		buildScanlinePattern();
		preRenderNoiseAsync(noiseWidth, noiseHeight);
	}

	function drawSoftBand(y: number, bandH: number, w: number) {
		const gradient = ctx.createLinearGradient(0, y, 0, y + bandH);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
		gradient.addColorStop(0.3, `rgba(255, 255, 255, ${ROLL_OPACITY * 0.5})`);
		gradient.addColorStop(0.5, `rgba(255, 255, 255, ${ROLL_OPACITY})`);
		gradient.addColorStop(0.7, `rgba(255, 255, 255, ${ROLL_OPACITY * 0.5})`);
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, y, w, bandH);
	}

	/** CRT kinescope vignette — darker corners / tube edges */
	function drawVignette() {
		const h = canvas.height;
		const w = canvas.width;
		const cx = w * 0.5;
		const cy = h * 0.5;
		const radius = Math.hypot(cx, cy);

		const vignette = ctx.createRadialGradient(cx, cy, radius * 0.28, cx, cy, radius * 1.02);
		vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
		vignette.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
		vignette.addColorStop(0.78, `rgba(0, 0, 0, ${VIGNETTE_OPACITY * 0.35})`);
		vignette.addColorStop(1, `rgba(0, 0, 0, ${VIGNETTE_OPACITY})`);
		ctx.fillStyle = vignette;
		ctx.fillRect(0, 0, w, h);
	}

	function drawScanlines() {
		if (!scanlinePattern) return;
		ctx.fillStyle = scanlinePattern;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	function drawRollBand() {
		const h = canvas.height;
		const w = canvas.width;
		if (h < 2 || w < 2) return;

		const bandH = Math.max(8, h * ROLL_BAND_HEIGHT);
		const now = performance.now();
		const elapsed = now - rollStartedAt;
		let t = (elapsed % ROLL_CYCLE_MS) / ROLL_CYCLE_MS;

		if (now < rollHoldUntil) {
			t = rollFrozenT;
		} else if (Math.random() < 0.06) {
			rollFrozenT = t;
			rollHoldUntil = now + 70 + Math.random() * 140;
		}

		for (let i = 0; i < ROLL_BAND_COUNT; i++) {
			const phase = (t + i / ROLL_BAND_COUNT) % 1;
			const y = h - phase * h - bandH * 0.5;
			drawSoftBand(y, bandH, w);
		}
	}

	/** Single tear strip at y — skew + horizontal offset of underlying media */
	function drawTearStrip(
		y: number,
		bandH: number,
		skew: number,
		offset: number,
		invert: boolean,
		opacity: number,
		media: HTMLVideoElement | HTMLImageElement | null,
		crop: { sx: number; sy: number; sw: number; sh: number } | null,
	) {
		if (opacity < 0.02) return;

		const w = canvas.width;
		const h = canvas.height;

		ctx.save();
		ctx.globalAlpha = opacity * 0.55;
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(w, y + skew);
		ctx.lineTo(w, y + bandH + skew);
		ctx.lineTo(0, y + bandH);
		ctx.closePath();
		ctx.clip();

		const toneFilter = invert
			? 'invert(0.06) contrast(1.18) brightness(1.1)'
			: 'contrast(1.12) brightness(1.06)';

		if (media && crop) {
			const mediaW =
				media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
			const mediaH =
				media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;

			if (mediaW > 0 && mediaH > 0) {
				const srcY = crop.sy + (y / h) * crop.sh;
				const srcH = Math.max(1, (bandH / h) * crop.sh);
				const mediaFilter = media.classList.contains('grayscale')
					? `grayscale(1) brightness(0.85) contrast(1.15) ${toneFilter}`
					: toneFilter;

				ctx.filter = mediaFilter;
				ctx.drawImage(media, crop.sx, srcY, crop.sw, srcH, offset, y, w, bandH);
				ctx.globalAlpha = opacity * 0.15;
				ctx.drawImage(
					media,
					crop.sx,
					srcY,
					crop.sw,
					srcH,
					-offset * 0.4,
					y + skew * 0.15,
					w,
					bandH,
				);
				ctx.globalAlpha = opacity * 0.55;
				ctx.filter = 'none';
			}
		}

		ctx.globalCompositeOperation = 'difference';
		ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
		ctx.fillRect(0, y, w, bandH + Math.abs(skew));

		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
		ctx.fillRect(0, y + bandH * 0.35 + skew * 0.2, w, 1);
		ctx.restore();
	}

	function reshuffleTearLine(index: number) {
		tearOffsets[index] = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 12);
		tearSkews[index] = (Math.random() - 0.5) * 6;
		tearInverts[index] = Math.random() < 0.25;
		tearPhaseOffsets[index] = Math.random();
	}

	function updateTearFades(now: number) {
		// Occasionally pick a visible line to fade out and a hidden/faded one to fade in
		if (now >= tearFadeNextAt) {
			const visible = tearOpacities
				.map((o, i) => ({ o, i }))
				.filter((x) => x.o > 0.3);
			const fading = tearOpacities
				.map((o, i) => ({ o, i }))
				.filter((x) => x.o < 0.2);

			if (visible.length > 0 && Math.random() < 0.7) {
				const pick = visible[Math.floor(Math.random() * visible.length)]!;
				tearOpacityTargets[pick.i] = 0;
			}
			if (fading.length > 0 || visible.length < TEAR_LINE_COUNT) {
				const candidates = tearOpacities
					.map((o, i) => ({ o, i }))
					.filter((x) => (tearOpacityTargets[x.i] ?? 0) < 0.25);
				if (candidates.length > 0) {
					const pick = candidates[Math.floor(Math.random() * candidates.length)]!;
					reshuffleTearLine(pick.i);
					tearOpacityTargets[pick.i] = 0.45;
				}
			}

			tearFadeNextAt = now + 700 + Math.random() * 1600;
		}

		const speed = 0.045;
		for (let i = 0; i < TEAR_LINE_COUNT; i++) {
			const target = tearOpacityTargets[i] ?? 1;
			const current = tearOpacities[i] ?? 0;
			if (current < target) {
				tearOpacities[i] = Math.min(target, current + speed);
			} else if (current > target) {
				tearOpacities[i] = Math.max(target, current - speed);
				// When fully faded, reshuffle so next appear feels like a new line
				if ((tearOpacities[i] ?? 0) <= 0.02) {
					reshuffleTearLine(i);
				}
			}
		}
	}

	/** Tear lines scrolling bottom → top; some fade out while others fade in */
	function drawTearLines(now: number) {
		if (prefersReducedMotion) return;

		const w = canvas.width;
		const h = canvas.height;
		if (h < 2 || w < 2) return;

		updateTearFades(now);

		const bandH = Math.max(1, h * TEAR_BAND_HEIGHT);
		const t = (now % TEAR_CYCLE_MS) / TEAR_CYCLE_MS;
		const media = getSourceMedia();
		let crop: { sx: number; sy: number; sw: number; sh: number } | null = null;

		if (media) {
			const mediaW =
				media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
			const mediaH =
				media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;
			if (mediaW > 0 && mediaH > 0) {
				const key = `${mediaW}x${mediaH}:${w}x${h}`;
				if (cachedCrop && cachedCropKey === key) {
					crop = cachedCrop;
				} else {
					crop = getCoverCrop(mediaW, mediaH, w, h);
					cachedCrop = crop;
					cachedCropKey = key;
				}
			}
		}

		if (Math.random() < 0.03) {
			const idx = Math.floor(Math.random() * TEAR_LINE_COUNT);
			tearOffsets[idx] =
				(Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 12);
			tearSkews[idx] = (Math.random() - 0.5) * 6;
		}

		for (let i = 0; i < TEAR_LINE_COUNT; i++) {
			const phase = (t + (tearPhaseOffsets[i] ?? i / TEAR_LINE_COUNT)) % 1;
			const y = h - phase * h - bandH * 0.5;
			drawTearStrip(
				y,
				bandH,
				tearSkews[i] ?? 0,
				tearOffsets[i] ?? 0,
				tearInverts[i] ?? false,
				tearOpacities[i] ?? 0,
				media,
				crop,
			);
		}
	}

	/** Subtle filmic screen flicker + rare CRT tube dip */
	function getFlickerAlpha(now: number) {
		if (prefersReducedMotion) return 1;

		const filmPulse = 0.97 + Math.sin(now * 0.011) * 0.018 + Math.sin(now * 0.029) * 0.01;
		const micro = 1 - Math.random() * 0.025;

		if (now > tubeDipUntil && Math.random() < 0.025) {
			tubeDipStrength = 0.04 + Math.random() * 0.06;
			tubeDipUntil = now + 40 + Math.random() * 90;
		}

		const dip = now < tubeDipUntil ? 1 - tubeDipStrength : 1;
		return Math.min(1, Math.max(0.88, filmPulse * micro * dip));
	}

	function drawFrame() {
		const availableFrames = noiseBuffers.filter(Boolean).length;
		if (!availableFrames) return;

		const now = performance.now();
		const frame = noiseBuffers[currentBufferFrame % availableFrames];
		const flicker = getFlickerAlpha(now);

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = flicker;

		if (frame) {
			ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
		}

		drawRollBand();
		ctx.globalAlpha = 1;
		drawTearLines(now);
		ctx.globalAlpha = flicker;
		drawScanlines();
		drawVignette();

		ctx.globalAlpha = 1;
		currentBufferFrame = (currentBufferFrame + 1) % Math.max(availableFrames, 1);
	}

	function canRunNoise() {
		return isObservedVisible && document.visibilityState === 'visible';
	}

	function stopNoise() {
		if (!intervalId) return;
		window.clearInterval(intervalId);
		intervalId = null;
	}

	function startNoise() {
		if (intervalId || !canRunNoise()) return;
		rollStartedAt = performance.now();
		drawFrame();
		intervalId = window.setInterval(drawFrame, FRAME_INTERVAL);
	}

	function restart() {
		resizeCanvas();
		if (canRunNoise()) startNoise();
	}

	function initCanvas() {
		resizeCanvas();
		if (canRunNoise()) startNoise();
	}

	const onResize = () => {
		window.requestAnimationFrame(resizeCanvas);
	};

	window.addEventListener('resize', onResize, { passive: true });
	document.addEventListener('visibilitychange', () => {
		if (canRunNoise()) startNoise();
		else stopNoise();
	});

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
				{ threshold: 0, rootMargin: '0px' },
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

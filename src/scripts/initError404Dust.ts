type Error404DustWindow = Window &
	typeof globalThis & {
		__setinError404DustReady?: boolean;
	};

type Mote = {
	/** Rest position in 0–1 mark space. */
	hx: number;
	hy: number;
	/** Current offset from rest (normalized). */
	ox: number;
	oy: number;
	vx: number;
	vy: number;
	size: number;
	opacity: number;
	phase: number;
	spin: number;
	canBlink: boolean;
	blinkCd: number;
	blinkDur: number;
	blinkT: number;
};

const SAMPLE_CAP = 3800;
const SIZE_MIN = 0.95;
const SIZE_MAX = 1.65;
const BLINK_CHANCE = 0.04;
const FLEE_RADIUS = 110;
const FLEE_FORCE = 980;
const SPRING = 28;
const FRICTION = 5.5;
/** Small inset so dots can float/scatter without clipping the silhouette hard. */
const PAD_RATIO = 0.06;

let canvasEl: HTMLCanvasElement | null = null;
let fallbackEl: HTMLElement | null = null;
let wrapEl: HTMLElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let motes: Mote[] = [];
let rafId = 0;
let running = false;
let dpr = 1;
let width = 0;
let height = 0;
let lastTs = 0;
let pointerX = 0;
let pointerY = 0;
let pointerActive = false;
let seeded = false;

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function rand(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

function blinkMultiplier(mote: Mote, dt: number): number {
	if (!mote.canBlink) return 1;

	if (mote.blinkT > 0) {
		mote.blinkT += dt / mote.blinkDur;
		if (mote.blinkT >= 1) {
			mote.blinkT = 0;
			mote.blinkCd = rand(6, 16);
			mote.blinkDur = rand(0.55, 1.05);
			return 1;
		}
		return 1 - Math.sin(Math.PI * mote.blinkT) * 0.7;
	}

	mote.blinkCd -= dt;
	if (mote.blinkCd <= 0) mote.blinkT = 0.0001;
	return 1;
}

async function loadSvgImage(src: string): Promise<HTMLImageElement> {
	const img = new Image();
	img.decoding = 'async';
	img.src = src;
	if (typeof img.decode === 'function') {
		await img.decode();
	} else {
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error(`Failed to load ${src}`));
		});
	}
	return img;
}

function sampleShapePoints(img: HTMLImageElement): Array<{ x: number; y: number }> {
	const sw = img.naturalWidth || 510;
	const sh = img.naturalHeight || 192;
	const off = document.createElement('canvas');
	off.width = sw;
	off.height = sh;
	const offCtx = off.getContext('2d', { willReadFrequently: true });
	if (!offCtx) return [];

	offCtx.clearRect(0, 0, sw, sh);
	offCtx.drawImage(img, 0, 0, sw, sh);
	const { data } = offCtx.getImageData(0, 0, sw, sh);

	const hits: Array<{ x: number; y: number }> = [];
	const step = 1;
	for (let y = 0; y < sh; y += step) {
		for (let x = 0; x < sw; x += step) {
			const i = (y * sw + x) * 4;
			const a = data[i + 3] ?? 0;
			const lum = ((data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0)) / 3;
			if (a > 28 && lum > 28) {
				// Jitter inside the pixel so the fill looks denser, not grid-locked.
				hits.push({
					x: (x + Math.random()) / sw,
					y: (y + Math.random()) / sh,
				});
			}
		}
	}

	if (hits.length <= SAMPLE_CAP) return hits;

	const picked: Array<{ x: number; y: number }> = [];
	const stride = hits.length / SAMPLE_CAP;
	for (let i = 0; i < SAMPLE_CAP; i++) {
		const idx = Math.min(hits.length - 1, Math.floor(i * stride + Math.random() * stride));
		const point = hits[idx];
		if (point) picked.push(point);
	}
	return picked;
}

function createMote(hx: number, hy: number): Mote {
	const canBlink = Math.random() < BLINK_CHANCE;
	return {
		hx,
		hy,
		ox: 0,
		oy: 0,
		vx: 0,
		vy: 0,
		size: rand(SIZE_MIN, SIZE_MAX),
		opacity: rand(0.7, 1),
		phase: rand(0, Math.PI * 2),
		spin: rand(0.55, 1.15),
		canBlink,
		blinkCd: canBlink ? rand(1.5, 9) : 0,
		blinkDur: rand(0.55, 1.05),
		blinkT: 0,
	};
}

function markToCanvas(nx: number, ny: number) {
	const padX = width * PAD_RATIO;
	const padY = height * PAD_RATIO;
	const innerW = Math.max(1, width - padX * 2);
	const innerH = Math.max(1, height - padY * 2);
	return {
		x: padX + nx * innerW,
		y: padY + ny * innerH,
	};
}

function resize() {
	if (!canvasEl || !ctx) return;
	const rect = canvasEl.getBoundingClientRect();
	dpr = Math.min(2, window.devicePixelRatio || 1);
	width = Math.max(1, Math.round(rect.width));
	height = Math.max(1, Math.round(rect.height));
	canvasEl.width = Math.round(width * dpr);
	canvasEl.height = Math.round(height * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function paint(ts: number) {
	if (!ctx || !canvasEl || !running) {
		rafId = 0;
		return;
	}

	const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
	lastTs = ts;
	ctx.clearRect(0, 0, width, height);

	for (const mote of motes) {
		mote.phase += dt * mote.spin;
		// Perpetual drift — always on; kept modest so the silhouette stays readable.
		const floatX =
			(Math.sin(mote.phase) * 0.01 + Math.sin(mote.phase * 0.45) * 0.005) * width;
		const floatY =
			(Math.cos(mote.phase * 0.9) * 0.014 + Math.sin(mote.phase * 1.35) * 0.005) * height;

		const home = markToCanvas(mote.hx, mote.hy);
		const x = home.x + mote.ox + floatX;
		const y = home.y + mote.oy + floatY;

		if (pointerActive) {
			const dx = x - pointerX;
			const dy = y - pointerY;
			const dist = Math.hypot(dx, dy);
			if (dist < FLEE_RADIUS && dist > 0.001) {
				const falloff = 1 - dist / FLEE_RADIUS;
				const push = falloff * falloff * FLEE_FORCE * dt;
				mote.vx += (dx / dist) * push;
				mote.vy += (dy / dist) * push;
			}
		}

		// Damped spring back to the glyph silhouette (pixel space).
		mote.vx += (-mote.ox * SPRING - mote.vx * FRICTION) * dt;
		mote.vy += (-mote.oy * SPRING - mote.vy * FRICTION) * dt;
		mote.ox += mote.vx * dt;
		mote.oy += mote.vy * dt;

		const drawX = home.x + mote.ox + floatX;
		const drawY = home.y + mote.oy + floatY;
		const blinkMul = blinkMultiplier(mote, dt);
		const core = clamp(mote.opacity * blinkMul, 0, 0.98);
		if (core < 0.03) continue;

		const r = Math.max(0.55, mote.size);
		const softR = r * 1.35;
		const glow = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, softR);
		glow.addColorStop(0, `rgba(255, 252, 242, ${core})`);
		glow.addColorStop(0.28, `rgba(255, 248, 230, ${core * 0.65})`);
		glow.addColorStop(0.62, `rgba(255, 242, 215, ${core * 0.28})`);
		glow.addColorStop(1, 'rgba(255, 242, 215, 0)');

		ctx.beginPath();
		ctx.fillStyle = glow;
		ctx.arc(drawX, drawY, softR, 0, Math.PI * 2);
		ctx.fill();
	}

	rafId = requestAnimationFrame(paint);
}

function startLoop() {
	if (running || prefersReducedMotion()) return;
	running = true;
	lastTs = 0;
	if (!rafId) rafId = requestAnimationFrame(paint);
}

function stopLoop() {
	running = false;
	if (rafId) {
		cancelAnimationFrame(rafId);
		rafId = 0;
	}
	lastTs = 0;
	ctx?.clearRect(0, 0, width, height);
}

function updatePointerFromEvent(event: PointerEvent | MouseEvent) {
	if (!canvasEl) return;
	const rect = canvasEl.getBoundingClientRect();
	pointerX = event.clientX - rect.left;
	pointerY = event.clientY - rect.top;
	pointerActive =
		pointerX >= -48 &&
		pointerX <= rect.width + 48 &&
		pointerY >= -48 &&
		pointerY <= rect.height + 48;
}

function onPointerMove(event: PointerEvent) {
	updatePointerFromEvent(event);
}

function onPointerLeave() {
	pointerActive = false;
}

function showFallback(show: boolean) {
	if (!fallbackEl || !canvasEl) return;
	fallbackEl.hidden = !show;
	canvasEl.hidden = show;
	fallbackEl.style.opacity = show ? '1' : '0';
	canvasEl.style.opacity = show ? '0' : '1';
}

export async function initError404Dust() {
	const wrap = document.querySelector<HTMLElement>('[data-error404-mark]');
	const canvas = document.querySelector<HTMLCanvasElement>('#error404-dust');
	const fallback = document.querySelector<HTMLElement>('[data-error404-fallback]');
	if (!wrap || !canvas) return;

	wrapEl = wrap;
	canvasEl = canvas;
	fallbackEl = fallback;
	ctx = canvas.getContext('2d');
	if (!ctx) return;

	if (prefersReducedMotion()) {
		showFallback(true);
		stopLoop();
		return;
	}

	try {
		const img = await loadSvgImage('/404.svg');
		const points = sampleShapePoints(img);
		if (!points.length) {
			showFallback(true);
			return;
		}
		motes = points.map((p) => createMote(p.x, p.y));
		seeded = true;
	} catch {
		showFallback(true);
		return;
	}

	resize();
	showFallback(false);
	startLoop();

	const dustWindow = window as Error404DustWindow;
	if (!dustWindow.__setinError404DustReady) {
		dustWindow.__setinError404DustReady = true;
		window.addEventListener(
			'resize',
			() => {
				resize();
			},
			{ passive: true },
		);
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerleave', onPointerLeave, { passive: true });
		document.addEventListener('mouseleave', onPointerLeave, { passive: true });
		document.addEventListener('astro:after-swap', () => {
			void initError404Dust();
		});
	}
}

import { getLenis } from './initSmoothScroll.ts';

type DustWindow = Window &
	typeof globalThis & {
		__setinHeroDustReady?: boolean;
	};

type Mote = {
	/** Base position in 0–1 space (pre-zoom). */
	bx: number;
	by: number;
	/** Depth: 0 = far (near monument plane), 1 = close to camera. */
	z: number;
	size: number;
	opacity: number;
	phase: number;
	spin: number;
	driftX: number;
	driftY: number;
	/** Flee impulse from cursor (normalized space). */
	vx: number;
	vy: number;
	/** Sparse soft twinkle — only a few motes. */
	canBlink: boolean;
	blinkCd: number;
	blinkT: number;
	blinkDur: number;
};

const POOL = 499;
/** Share of motes allowed to twinkle. */
const BLINK_CHANCE = 0.07;
/** Dust mote size (~1.0–1.8px). */
const SIZE_MIN = 1.0;
const SIZE_MAX = 1.8;
const ORIGIN_X = 0.5;
const ORIGIN_Y = 0.46;
/** How strongly near motes rush past the lens on zoom. */
const PARALLAX = 1.55;
/** Mild growth on zoom — powder stays small near camera. */
const SIZE_GROWTH = 0.35;
/** Cursor scare radius (px) and push strength. */
const FLEE_RADIUS = 128;
const FLEE_FORCE = 1.85;

let canvasEl: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let heroEl: HTMLElement | null = null;
let motes: Mote[] = [];
let rafId = 0;
let progress = 0;
let targetProgress = 0;
let dpr = 1;
let width = 0;
let height = 0;
let lastTs = 0;
let running = false;
let lenisUnsub: (() => void) | null = null;
let pointerX = 0;
let pointerY = 0;
let pointerActive = false;

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function rand(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getScrollProgress(): number {
	if (!heroEl) return 0;
	const rect = heroEl.getBoundingClientRect();
	const scrollable = Math.max(1, heroEl.offsetHeight - window.innerHeight);
	const scrolled = clamp(-rect.top, 0, scrollable);
	return easeInOutCubic(scrolled / scrollable);
}

function createMote(): Mote {
	const z = Math.pow(Math.random(), 0.72);
	const canBlink = Math.random() < BLINK_CHANCE;
	return {
		bx: Math.random(),
		by: Math.random(),
		z,
		size: rand(SIZE_MIN, SIZE_MAX) * (0.8 + z * 0.2),
		opacity: rand(0.4, 0.9) * (0.65 + z * 0.55),
		phase: rand(0, Math.PI * 2),
		spin: rand(0.35, 1.1),
		driftX: rand(-0.012, 0.012),
		driftY: rand(-0.018, -0.002),
		vx: 0,
		vy: 0,
		canBlink,
		blinkCd: canBlink ? rand(1.5, 9) : 0,
		blinkT: 0,
		blinkDur: rand(0.55, 1.05),
	};
}

function blinkMultiplier(mote: Mote, dt: number): number {
	if (!mote.canBlink) return 1;

	if (mote.blinkT > 0) {
		mote.blinkT += dt / mote.blinkDur;
		if (mote.blinkT >= 1) {
			mote.blinkT = 0;
			// Rare: long quiet gap before the next soft dip
			mote.blinkCd = rand(6, 16);
			mote.blinkDur = rand(0.55, 1.05);
			return 1;
		}
		// Gentle fade out and back — not a hard flash
		return 1 - Math.sin(Math.PI * mote.blinkT) * 0.7;
	}

	mote.blinkCd -= dt;
	if (mote.blinkCd <= 0) {
		mote.blinkT = 0.0001;
	}
	return 1;
}

function seedMotes() {
	motes = Array.from({ length: POOL }, createMote);
}

function resize() {
	if (!canvasEl || !ctx) return;
	const stack = canvasEl.parentElement;
	if (!stack) return;

	const rect = stack.getBoundingClientRect();
	dpr = Math.min(2, window.devicePixelRatio || 1);
	width = Math.max(1, Math.round(rect.width));
	height = Math.max(1, Math.round(rect.height));
	canvasEl.width = Math.round(width * dpr);
	canvasEl.height = Math.round(height * dpr);
	canvasEl.style.width = `${width}px`;
	canvasEl.style.height = `${height}px`;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function project(mote: Mote, floatX: number, floatY: number, p: number) {
	const x = mote.bx + floatX;
	const y = mote.by + floatY;
	const expand = 1 + p * mote.z * PARALLAX;
	const px = ORIGIN_X + (x - ORIGIN_X) * expand;
	const py = ORIGIN_Y + (y - ORIGIN_Y) * expand;
	const size = mote.size * (1 + p * mote.z * SIZE_GROWTH);
	const alpha = mote.opacity * (0.65 + mote.z * 0.5) * (0.85 + p * mote.z * 0.4);
	return { px, py, size, alpha };
}

function wrapBase(mote: Mote) {
	if (mote.bx < -0.08) mote.bx += 1.16;
	if (mote.bx > 1.08) mote.bx -= 1.16;
	if (mote.by < -0.08) mote.by += 1.16;
	if (mote.by > 1.08) mote.by -= 1.16;
}

function paint(ts: number) {
	if (!ctx || !canvasEl || !running) {
		rafId = 0;
		return;
	}

	const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
	lastTs = ts;

	const alpha = 1 - Math.exp(-6 * dt);
	progress += (targetProgress - progress) * alpha;

	ctx.clearRect(0, 0, width, height);

	const invW = width > 0 ? 1 / width : 0;
	const invH = height > 0 ? 1 / height : 0;
	const damp = Math.exp(-3.2 * dt);

	for (const mote of motes) {
		mote.phase += dt * mote.spin;
		const floatX = Math.sin(mote.phase) * 0.008 + Math.sin(mote.phase * 0.37) * 0.004;
		const floatY = Math.cos(mote.phase * 0.85) * 0.01 + Math.sin(mote.phase * 1.4) * 0.003;

		// Predict screen position for cursor repulsion
		const projected = project(mote, floatX, floatY, progress);
		const screenX = projected.px * width;
		const screenY = projected.py * height;

		if (pointerActive && width > 0 && height > 0) {
			const dx = screenX - pointerX;
			const dy = screenY - pointerY;
			const dist = Math.hypot(dx, dy);
			if (dist < FLEE_RADIUS && dist > 0.001) {
				const falloff = 1 - dist / FLEE_RADIUS;
				const push = falloff * falloff * (0.55 + mote.z * 1.05) * FLEE_FORCE * dt;
				const expand = 1 + progress * mote.z * PARALLAX;
				mote.vx += ((dx / dist) * push * invW) / expand;
				mote.vy += ((dy / dist) * push * invH) / expand;
			}
		}

		mote.bx += mote.driftX * dt + mote.vx;
		mote.by += mote.driftY * dt + mote.vy;
		mote.vx *= damp;
		mote.vy *= damp;
		wrapBase(mote);

		const blinkMul = blinkMultiplier(mote, dt);
		const { px, py, size, alpha: a } = project(mote, floatX, floatY, progress);
		if (px < -0.05 || px > 1.05 || py < -0.05 || py > 1.05) continue;
		if (a * blinkMul < 0.02) continue;

		const x = px * width;
		const y = py * height;
		const r = Math.max(0.55, size);
		// Tight halo — visible mote stays small
		const blurBoost = 1 + progress * mote.z * 0.12;
		const softR = r * (1.25 + mote.z * 0.2) * blurBoost;
		const core = clamp(a * blinkMul * (0.78 + mote.z * 0.3), 0, 0.98);

		const glow = ctx.createRadialGradient(x, y, 0, x, y, softR);
		glow.addColorStop(0, `rgba(255, 252, 242, ${core})`);
		glow.addColorStop(0.28, `rgba(255, 248, 230, ${core * 0.65})`);
		glow.addColorStop(0.62, `rgba(255, 242, 215, ${core * 0.28})`);
		glow.addColorStop(1, 'rgba(255, 242, 215, 0)');

		ctx.beginPath();
		ctx.fillStyle = glow;
		ctx.arc(x, y, softR, 0, Math.PI * 2);
		ctx.fill();
	}

	rafId = requestAnimationFrame(paint);
}

function syncProgress() {
	targetProgress = getScrollProgress();
}

function onScrollOrResize() {
	syncProgress();
}

function updatePointerFromEvent(event: PointerEvent | MouseEvent) {
	if (!canvasEl) return;
	const rect = canvasEl.getBoundingClientRect();
	pointerX = event.clientX - rect.left;
	pointerY = event.clientY - rect.top;
	pointerActive =
		pointerX >= -40 &&
		pointerX <= rect.width + 40 &&
		pointerY >= -40 &&
		pointerY <= rect.height + 40;
}

function onPointerMove(event: PointerEvent) {
	updatePointerFromEvent(event);
}

function onPointerLeave() {
	pointerActive = false;
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

export function initHeroDust() {
	const canvas = document.querySelector<HTMLCanvasElement>('#hero-dust-layer');
	const hero = document.getElementById('hero-section');
	if (!canvas || !hero) return;

	canvasEl = canvas;
	heroEl = hero;
	ctx = canvas.getContext('2d');
	if (!ctx) return;

	if (prefersReducedMotion()) {
		stopLoop();
		return;
	}

	if (motes.length !== POOL) seedMotes();
	resize();
	syncProgress();
	startLoop();

	const dustWindow = window as DustWindow;
	if (!dustWindow.__setinHeroDustReady) {
		dustWindow.__setinHeroDustReady = true;
		window.addEventListener('scroll', onScrollOrResize, { passive: true });
		window.addEventListener(
			'resize',
			() => {
				resize();
				onScrollOrResize();
			},
			{ passive: true },
		);
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerleave', onPointerLeave, { passive: true });
		document.addEventListener('mouseleave', onPointerLeave, { passive: true });
	}

	lenisUnsub?.();
	lenisUnsub = null;
	const lenis = getLenis();
	if (lenis) {
		lenisUnsub = lenis.on('scroll', onScrollOrResize);
	}

	// Pause when hero stack is hidden
	const stack = document.getElementById('hero-background-stack');
	if (stack) {
		const hidden = stack.classList.contains('is-hidden');
		if (hidden) stopLoop();
		else startLoop();
	}
}

export function setHeroDustActive(active: boolean) {
	if (active) {
		resize();
		syncProgress();
		startLoop();
	} else {
		stopLoop();
	}
}

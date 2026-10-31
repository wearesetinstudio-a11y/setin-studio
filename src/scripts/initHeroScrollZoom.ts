import { getLenis } from './initSmoothScroll.ts';

type ScrollZoomWindow = Window &
	typeof globalThis & {
		__setinHeroScrollZoomReady?: boolean;
	};

let mediaEl: HTMLElement | null = null;
let tintEl: HTMLElement | null = null;
let heroEl: HTMLElement | null = null;
let targetScale = 1;
let displayScale = 1;
let targetBrightness = 1;
let displayBrightness = 1;
let rafId = 0;
let ticking = false;
let lastFrameTs = 0;
let lenisUnsub: (() => void) | null = null;

/** Soft follow — lower = gentler */
const FOLLOW_SMOOTHING = 7.5;
const VISUAL_EPSILON = 0.0008;
/** Start slightly oversized so edges never letterbox while zooming. */
const SCALE_START = 1.08;
/** How close we push into the monument by end of hero scroll. */
const SCALE_END = 1.85;
/** Dawn: darker on entry → soft open at the end of hero scroll. */
const BRIGHTNESS_START = 0.72;
const BRIGHTNESS_END = 0.9;
/** Tint overlay opacity — a touch more veil at peak so dawn stays moody. */
const TINT_START = 0.46;
const TINT_END = 0.26;
/** Transform origin aimed at monument center / light shaft. */
const ORIGIN_X = '50%';
const ORIGIN_Y = '46%';

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Soft dawn curve — stays a bit darker longer, then opens up. */
function easeDawn(t: number): number {
	const c = clamp(t, 0, 1);
	return c * c * (3 - 2 * c);
}

function getProgress(): number {
	if (!heroEl) return 0;
	const rect = heroEl.getBoundingClientRect();
	const scrollable = Math.max(1, heroEl.offsetHeight - window.innerHeight);
	const scrolled = clamp(-rect.top, 0, scrollable);
	return easeInOutCubic(scrolled / scrollable);
}

function applyVisual(scale: number, brightness: number) {
	if (!mediaEl) return;
	displayScale = scale;
	displayBrightness = brightness;
	mediaEl.style.transform = `scale(${scale}) translateZ(0)`;
	mediaEl.style.filter = `brightness(${brightness}) contrast(${0.94 + brightness * 0.06})`;

	if (tintEl) {
		const span = Math.max(0.0001, BRIGHTNESS_END - BRIGHTNESS_START);
		const t = clamp((brightness - BRIGHTNESS_START) / span, 0, 1);
		const tintOpacity = TINT_START + (TINT_END - TINT_START) * t;
		tintEl.style.opacity = String(tintOpacity);
	}
}

function tick(ts: number) {
	if (!mediaEl) {
		rafId = 0;
		lastFrameTs = 0;
		return;
	}

	const dt = lastFrameTs ? Math.min(0.05, (ts - lastFrameTs) / 1000) : 0.016;
	lastFrameTs = ts;

	const scaleDelta = targetScale - displayScale;
	const brightDelta = targetBrightness - displayBrightness;
	if (Math.abs(scaleDelta) < VISUAL_EPSILON && Math.abs(brightDelta) < VISUAL_EPSILON) {
		applyVisual(targetScale, targetBrightness);
		rafId = 0;
		lastFrameTs = 0;
		return;
	}

	const alpha = 1 - Math.exp(-FOLLOW_SMOOTHING * dt);
	applyVisual(displayScale + scaleDelta * alpha, displayBrightness + brightDelta * alpha);
	rafId = requestAnimationFrame(tick);
}

function applyProgress() {
	if (!mediaEl) return;
	const progress = getProgress();
	const dawn = easeDawn(progress);
	targetScale = SCALE_START + (SCALE_END - SCALE_START) * progress;
	targetBrightness = BRIGHTNESS_START + (BRIGHTNESS_END - BRIGHTNESS_START) * dawn;
	if (!rafId) {
		lastFrameTs = 0;
		rafId = requestAnimationFrame(tick);
	}
}

function onScrollOrResize() {
	if (ticking) return;
	ticking = true;
	requestAnimationFrame(() => {
		applyProgress();
		ticking = false;
	});
}

export function initHeroScrollZoom() {
	const media = document.querySelector<HTMLElement>('.hero-background-media');
	const tint = document.querySelector<HTMLElement>('.hero-background-stack__tint');
	const hero = document.getElementById('hero-section');
	if (!media || !hero) return;

	mediaEl = media;
	tintEl = tint;
	heroEl = hero;

	media.style.transformOrigin = `${ORIGIN_X} ${ORIGIN_Y}`;
	media.style.willChange = 'transform, filter';

	if (prefersReducedMotion()) {
		applyVisual(SCALE_START, BRIGHTNESS_END);
		return;
	}

	const scrollWindow = window as ScrollZoomWindow;
	if (!scrollWindow.__setinHeroScrollZoomReady) {
		scrollWindow.__setinHeroScrollZoomReady = true;
		window.addEventListener('scroll', onScrollOrResize, { passive: true });
		window.addEventListener('resize', onScrollOrResize, { passive: true });
	}

	lenisUnsub?.();
	lenisUnsub = null;
	const lenis = getLenis();
	if (lenis) {
		lenisUnsub = lenis.on('scroll', onScrollOrResize);
	}

	applyProgress();
}

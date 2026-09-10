type ScrollVideoWindow = Window &
	typeof globalThis & {
		__setinHeroScrollVideoReady?: boolean;
	};

let videoEl: HTMLVideoElement | null = null;
let heroEl: HTMLElement | null = null;
let duration = 0;
let targetTime = 0;
let displayTime = 0;
let rafId = 0;
let ticking = false;
let isSeeking = false;
let pendingSeek = false;
let lastFrameTs = 0;

/** Soft follow speed — lower = gentler */
const FOLLOW_SMOOTHING = 3.2;
const SEEK_EPSILON = 0.02;

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getProgress(): number {
	if (!heroEl) return 0;
	const rect = heroEl.getBoundingClientRect();
	const scrollable = Math.max(1, heroEl.offsetHeight - window.innerHeight);
	const scrolled = clamp(-rect.top, 0, scrollable);
	return easeInOutCubic(scrolled / scrollable);
}

function seekTo(time: number) {
	if (!videoEl || !duration) return;

	const next = clamp(time, 0, Math.max(0, duration - 0.04));
	if (Math.abs(videoEl.currentTime - next) < SEEK_EPSILON) {
		displayTime = videoEl.currentTime;
		return;
	}

	if (isSeeking) {
		pendingSeek = true;
		displayTime = next;
		return;
	}

	isSeeking = true;
	displayTime = next;
	try {
		videoEl.currentTime = next;
	} catch {
		isSeeking = false;
	}
}

function onSeeked() {
	isSeeking = false;
	if (!videoEl) return;

	displayTime = videoEl.currentTime;

	if (pendingSeek || Math.abs(targetTime - displayTime) > SEEK_EPSILON) {
		pendingSeek = false;
		seekTo(targetTime);
		if (!rafId) rafId = requestAnimationFrame(tick);
	}
}

function tick(ts: number) {
	if (!videoEl || !duration) {
		rafId = 0;
		lastFrameTs = 0;
		return;
	}

	const dt = lastFrameTs ? Math.min(0.05, (ts - lastFrameTs) / 1000) : 0.016;
	lastFrameTs = ts;

	const delta = targetTime - displayTime;
	if (Math.abs(delta) < SEEK_EPSILON && !isSeeking) {
		rafId = 0;
		lastFrameTs = 0;
		return;
	}

	const alpha = 1 - Math.exp(-FOLLOW_SMOOTHING * dt);
	const nextDisplay = displayTime + delta * alpha;
	seekTo(nextDisplay);

	rafId = requestAnimationFrame(tick);
}

function applyProgress() {
	if (!videoEl || !duration) return;
	targetTime = getProgress() * Math.max(0, duration - 0.04);
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

export function initHeroScrollVideo() {
	const video = document.querySelector<HTMLVideoElement>('.hero-background-video');
	const hero = document.getElementById('hero-section');
	if (!video || !hero) return;

	if (videoEl && videoEl !== video) {
		videoEl.removeEventListener('seeked', onSeeked);
	}

	videoEl = video;
	heroEl = hero;

	video.pause();
	video.muted = true;
	video.playsInline = true;
	video.loop = false;
	video.preload = 'auto';
	video.removeAttribute('autoplay');
	video.addEventListener('seeked', onSeeked);

	if (prefersReducedMotion()) {
		video.currentTime = 0;
		displayTime = 0;
		targetTime = 0;
		return;
	}

	function onReady() {
		if (!videoEl) return;
		duration = videoEl.duration;
		if (!Number.isFinite(duration) || duration <= 0) return;
		displayTime = videoEl.currentTime || 0;
		applyProgress();
	}

	if (video.readyState >= 1) onReady();
	else video.addEventListener('loadedmetadata', onReady, { once: true });

	// Warm decode buffer for smoother first seeks
	if (video.readyState >= 2) {
		void video.play().then(() => {
			video.pause();
		}).catch(() => {});
	}

	const scrollWindow = window as ScrollVideoWindow;
	if (!scrollWindow.__setinHeroScrollVideoReady) {
		scrollWindow.__setinHeroScrollVideoReady = true;
		window.addEventListener('scroll', onScrollOrResize, { passive: true });
		window.addEventListener('resize', onScrollOrResize, { passive: true });
	}

	onScrollOrResize();
}

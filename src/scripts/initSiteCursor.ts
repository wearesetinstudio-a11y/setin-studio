const TRAIL_LAG_MOVE = 0.22;
const TRAIL_LAG_SETTLE = 0.48;
const CORE_LAG = 0.48;
const VELOCITY_SMOOTH = 0.28;
const MIN_SPEED = 0.15;
const MAX_SPEED = 42;

const SPARK_POOL = 14;
const SPARK_SPAWN_MIN_MS = 42;
const SPARK_SPAWN_MAX_MS = 95;
const SPARK_MIN_INTENSITY = 0.1;

type CursorWindow = Window &
	typeof globalThis & {
		__setinSiteCursorReady?: boolean;
	};

type Spark = {
	el: HTMLElement;
	alive: boolean;
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	size: number;
	spin: number;
	wobble: number;
};

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function canUseSiteCursor(): boolean {
	return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function rand(min: number, max: number) {
	return min + Math.random() * (max - min);
}

export function initSiteCursor() {
	const cursorWindow = window as CursorWindow;
	const root = document.documentElement;

	if (!canUseSiteCursor() || prefersReducedMotion()) {
		root.classList.remove('has-site-cursor');
		return;
	}

	const cursor = document.getElementById('site-cursor');
	const core = cursor?.querySelector<HTMLElement>('.site-cursor__core');
	const trail = cursor?.querySelector<HTMLElement>('.site-cursor__trail');
	const flash = cursor?.querySelector<HTMLElement>('.site-cursor__flash');
	const sparksLayer = document.getElementById('site-cursor-sparks');

	if (!cursor || !core || !trail || !flash || !sparksLayer) return;

	root.classList.add('has-site-cursor');

	if (cursorWindow.__setinSiteCursorReady) return;
	cursorWindow.__setinSiteCursorReady = true;

	let visible = false;
	let rafId = 0;
	let targetX = window.innerWidth / 2;
	let targetY = window.innerHeight / 2;
	let coreX = targetX;
	let coreY = targetY;
	let trailX = targetX;
	let trailY = targetY;
	let velX = 0;
	let velY = 0;
	let lastX = targetX;
	let lastY = targetY;
	let lastSpawnAt = 0;
	let nextSpawnIn = rand(SPARK_SPAWN_MIN_MS, SPARK_SPAWN_MAX_MS);
	let lastFrameAt = performance.now();

	// Sparks live inside the difference-blended cursor so they invert with it
	// (visible as white on dark AND as black on light).
	const sparkHost = cursor;

	const sparks: Spark[] = Array.from({ length: SPARK_POOL }, () => {
		const el = document.createElement('span');
		el.className = 'site-cursor-spark';
		sparkHost.appendChild(el);
		return {
			el,
			alive: false,
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			life: 0,
			maxLife: 1,
			size: 2,
			spin: 0,
			wobble: 0,
		};
	});

	sparksLayer.replaceChildren();
	sparksLayer.setAttribute('aria-hidden', 'true');

	function isSuppressed() {
		return cursor.classList.contains('is-suppressed');
	}

	function clearSparks() {
		for (const spark of sparks) {
			spark.alive = false;
			spark.el.style.opacity = '0';
		}
	}

	function setVisible(next: boolean) {
		if (visible === next) return;
		visible = next;
		cursor.classList.toggle('is-visible', next);
		if (!next) clearSparks();
	}

	function spawnSpark(intensity: number, angleRad: number) {
		const spark = sparks.find((item) => !item.alive);
		if (!spark) return;

		const side = Math.random() < 0.5 ? -1 : 1;
		const spread = rand(0.55, 1.35) * side;
		const rearward = rand(0.15, 0.55);
		const launch = rand(0.55, 1.35) + intensity * 0.9;

		const cos = Math.cos(angleRad);
		const sin = Math.sin(angleRad);
		const dirX = -sin * spread - cos * rearward;
		const dirY = cos * spread - sin * rearward;
		const mag = Math.hypot(dirX, dirY) || 1;

		spark.alive = true;
		spark.x = rand(-2.5, 2.5);
		spark.y = rand(-2.5, 2.5);
		spark.vx = (dirX / mag) * launch * rand(0.7, 1.8);
		spark.vy = (dirY / mag) * launch * rand(0.7, 1.8) - rand(0.05, 0.35);
		spark.maxLife = rand(420, 820);
		spark.life = spark.maxLife;
		spark.size = rand(1.6, 3.4);
		spark.spin = rand(-0.08, 0.08);
		spark.wobble = rand(0, Math.PI * 2);

		spark.el.style.width = `${spark.size}px`;
		spark.el.style.height = `${spark.size}px`;
		spark.el.style.opacity = '1';
		spark.el.style.transform = `translate3d(${spark.x}px, ${spark.y}px, 0) translate(-50%, -50%) scale(1)`;
	}

	function updateSparks(dt: number, intensity: number, angleRad: number, now: number) {
		if (visible && intensity >= SPARK_MIN_INTENSITY && now - lastSpawnAt >= nextSpawnIn) {
			const burst = Math.random() < 0.28 + intensity * 0.35 ? 2 : 1;
			for (let i = 0; i < burst; i += 1) spawnSpark(intensity, angleRad);
			lastSpawnAt = now;
			nextSpawnIn = rand(
				SPARK_SPAWN_MIN_MS * (1.15 - intensity * 0.45),
				SPARK_SPAWN_MAX_MS * (1.1 - intensity * 0.35),
			);
		}

		for (const spark of sparks) {
			if (!spark.alive) continue;

			spark.life -= dt;
			if (spark.life <= 0) {
				spark.alive = false;
				spark.el.style.opacity = '0';
				continue;
			}

			spark.wobble += dt * 0.006 + Math.abs(spark.spin);
			const swirl = Math.sin(spark.wobble) * 0.045;
			const curlX = -spark.vy * spark.spin;
			const curlY = spark.vx * spark.spin;

			spark.vx += curlX + Math.cos(spark.wobble) * swirl;
			spark.vy += curlY + Math.sin(spark.wobble * 1.3) * swirl - 0.012;
			spark.vx *= 0.985;
			spark.vy *= 0.985;

			spark.x += spark.vx * (dt * 0.055);
			spark.y += spark.vy * (dt * 0.055);

			const progress = 1 - spark.life / spark.maxLife;
			const fade = progress < 0.15 ? progress / 0.15 : 1 - (progress - 0.15) / 0.85;
			const scale = 1 - progress * 0.75;

			spark.el.style.opacity = String(Math.max(0, fade));
			spark.el.style.transform = `translate3d(${spark.x}px, ${spark.y}px, 0) translate(-50%, -50%) scale(${scale})`;
		}
	}

	function render(now = performance.now()) {
		if (isSuppressed() || !visible) {
			rafId = 0;
			clearSparks();
			return;
		}

		const dt = Math.min(32, now - lastFrameAt);
		lastFrameAt = now;

		const rawVelX = targetX - lastX;
		const rawVelY = targetY - lastY;
		lastX = targetX;
		lastY = targetY;

		velX += (rawVelX - velX) * VELOCITY_SMOOTH;
		velY += (rawVelY - velY) * VELOCITY_SMOOTH;

		const speed = Math.min(MAX_SPEED, Math.hypot(velX, velY));
		const trailLag = speed < 3 ? TRAIL_LAG_SETTLE : TRAIL_LAG_MOVE;

		coreX += (targetX - coreX) * CORE_LAG;
		coreY += (targetY - coreY) * CORE_LAG;
		trailX += (coreX - trailX) * trailLag;
		trailY += (coreY - trailY) * trailLag;

		const dragX = coreX - trailX;
		const dragY = coreY - trailY;
		const dragMag = Math.hypot(dragX, dragY);
		const motion = Math.max(speed, dragMag * 1.05);
		const intensity = Math.max(0, Math.min(1, (motion - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)));

		const dirX = Math.abs(velX) + Math.abs(velY) > MIN_SPEED ? velX : dragX;
		const dirY = Math.abs(velX) + Math.abs(velY) > MIN_SPEED ? velY : dragY;
		const angleRad = Math.atan2(dirY, dirX);
		const angleDeg = (angleRad * 180) / Math.PI;

		cursor.style.transform = `translate3d(${coreX}px, ${coreY}px, 0)`;

		const restSize = 34;
		const moveLength = 26 + intensity * 50 + dragMag * 0.35;
		const moveThickness = 16 + intensity * 12;
		const trailWidth = restSize + (moveLength - restSize) * intensity;
		const trailHeight = restSize + (moveThickness - restSize) * intensity;
		const trailOffset = trailWidth * 0.42 * intensity;
		const trailOpacity = 0.5 * (1 - intensity) + (0.1 + intensity * 0.42) * intensity;

		trail.style.width = `${trailWidth}px`;
		trail.style.height = `${trailHeight}px`;
		trail.style.opacity = String(trailOpacity);
		trail.style.transform = `translate(-50%, -50%) rotate(${angleDeg + 180}deg) translateX(${trailOffset}px)`;

		const arcSize = 26 + intensity * 8;
		flash.style.width = `${arcSize}px`;
		flash.style.height = `${arcSize}px`;
		flash.style.opacity = String(intensity * 0.85);
		flash.style.transform = `translate(-50%, -50%) rotate(${angleDeg + 90}deg)`;

		updateSparks(dt, intensity, angleRad, now);

		const hasAliveSparks = sparks.some((spark) => spark.alive);
		const settled =
			Math.abs(targetX - coreX) < 0.15 &&
			Math.abs(targetY - coreY) < 0.15 &&
			Math.abs(coreX - trailX) < 0.2 &&
			motion < MIN_SPEED;

		if (!settled || hasAliveSparks) {
			rafId = requestAnimationFrame(render);
		} else {
			rafId = 0;
			flash.style.opacity = '0';
		}
	}

	function start() {
		if (isSuppressed() || !visible) return;
		if (!rafId) {
			lastFrameAt = performance.now();
			rafId = requestAnimationFrame(render);
		}
	}

	window.addEventListener(
		'pointermove',
		(event) => {
			if (event.pointerType && event.pointerType !== 'mouse') return;
			targetX = event.clientX;
			targetY = event.clientY;
			setVisible(true);
			start();
		},
		{ passive: true },
	);

	window.addEventListener(
		'pointerdown',
		(event) => {
			if (event.pointerType && event.pointerType !== 'mouse') return;
			cursor.classList.add('is-pressed');
		},
		{ passive: true },
	);

	window.addEventListener(
		'pointerup',
		() => {
			cursor.classList.remove('is-pressed');
		},
		{ passive: true },
	);

	document.addEventListener(
		'mouseleave',
		() => {
			setVisible(false);
		},
		{ passive: true },
	);

	document.addEventListener(
		'mouseenter',
		() => {
			setVisible(true);
			start();
		},
		{ passive: true },
	);
}

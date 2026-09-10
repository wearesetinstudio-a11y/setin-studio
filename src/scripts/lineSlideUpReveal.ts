/** Shared helpers for home/about-style line slide-up reveals. */

export function normalizeCopy(text: string): string {
	return text.replace(/[^\S\u00a0]+/g, ' ').trim();
}

export function measureWrappedLines(container: HTMLElement, raw: string): string[] {
	container.textContent = '';
	const words = raw.split(' ').filter(Boolean);
	const wordSpans = words.map((word, index) => {
		const span = document.createElement('span');
		span.textContent = index < words.length - 1 ? `${word} ` : word;
		container.appendChild(span);
		return span;
	});

	const lines: string[][] = [];
	let currentLine: string[] = [];
	let currentTop = wordSpans[0]?.offsetTop ?? 0;

	for (const span of wordSpans) {
		if (span.offsetTop > currentTop + 1) {
			lines.push(currentLine);
			currentLine = [];
			currentTop = span.offsetTop;
		}
		currentLine.push((span.textContent ?? '').replace(/ $/, ''));
	}
	if (currentLine.length) lines.push(currentLine);

	return lines.map((lineWords) => lineWords.join(' '));
}

export function splitIntoRevealLines(
	container: HTMLElement,
	options: {
		rawText?: string;
		maskClass?: string;
		lineClass?: string;
		fixedLines?: boolean;
		startIndex?: number;
		alreadyRevealed?: boolean;
	} = {},
): number {
	const {
		rawText,
		maskClass = 'hero-reveal-mask',
		lineClass = 'hero-reveal-line',
		fixedLines,
		startIndex = 0,
		alreadyRevealed = false,
	} = options;

	const raw = (rawText ?? container.dataset.rawText ?? container.textContent ?? '')
		.replace(/\r/g, '')
		.trim();
	if (!raw) return 0;

	container.dataset.rawText = raw;
	const hasFixedLines = fixedLines ?? raw.includes('\n');

	const lines = hasFixedLines
		? raw
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)
		: measureWrappedLines(container, normalizeCopy(raw));

	container.replaceChildren();

	lines.forEach((lineText, index) => {
		const mask = document.createElement('span');
		mask.className = maskClass;

		const line = document.createElement('span');
		line.className = lineClass;
		line.style.setProperty('--i', String(startIndex + index));
		line.textContent = lineText;

		if (alreadyRevealed) {
			line.style.transition = 'none';
			line.classList.add('is-revealed');
		}

		mask.appendChild(line);
		container.appendChild(mask);
	});

	if (alreadyRevealed) {
		requestAnimationFrame(() => {
			container.querySelectorAll<HTMLElement>(`.${lineClass}`).forEach((line) => {
				line.style.removeProperty('transition');
			});
		});
	}

	return lines.length;
}

type TransitionPhase = 'idle' | 'covering' | 'covered' | 'revealing';

export function isPageTransitionBlocking(): boolean {
	const phase =
		(window as Window & { __setinPageTransitionPhase?: TransitionPhase }).__setinPageTransitionPhase ??
		'idle';
	if (phase === 'covering' || phase === 'covered' || phase === 'revealing') return true;

	const overlay = document.getElementById('page-transition-overlay');
	return Boolean(overlay?.classList.contains('is-active') || overlay?.classList.contains('is-covered'));
}

export function waitForPageReveal(callback: () => void) {
	let done = false;
	const run = () => {
		if (done) return;
		done = true;
		callback();
	};

	if (!isPageTransitionBlocking()) {
		requestAnimationFrame(() => {
			requestAnimationFrame(run);
		});
		return;
	}

	window.addEventListener('page-transition-reveal-complete', run, { once: true });
	if (!isPageTransitionBlocking()) {
		run();
		return;
	}
	window.setTimeout(run, 2200);
}

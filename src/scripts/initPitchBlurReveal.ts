import { measureWrappedLines, normalizeCopy } from './lineSlideUpReveal.ts';

/**
 * Pitch headings: blur each wrapped line from soft → sharp, staggered on enter.
 * Waits for fonts so wrap matches the real Science Gothic metrics (full grid width).
 *
 * Optional: `data-pitch-lines="Line one|Line two"` forces exact breaks (e.g. hero mobile).
 * Optional: `data-pitch-lines-desktop="One line"` overrides from `md` up.
 */
export function initPitchBlurReveal() {
	const headings = Array.from(
		document.querySelectorAll<HTMLElement>('[data-pitch-reveal]'),
	);
	if (!headings.length) return;

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const desktopMq = window.matchMedia('(min-width: 768px)');

	const resolveLines = (heading: HTMLElement, raw: string): string[] => {
		const mobileFixed = heading.dataset.pitchLines?.split('|').map((s) => s.trim()).filter(Boolean);
		const desktopFixed = heading.dataset.pitchLinesDesktop
			?.split('|')
			.map((s) => s.trim())
			.filter(Boolean);

		if (desktopMq.matches && desktopFixed?.length) return desktopFixed;
		if (!desktopMq.matches && mobileFixed?.length) return mobileFixed;
		if (mobileFixed?.length && !desktopFixed?.length && !desktopMq.matches) return mobileFixed;

		return measureWrappedLines(heading, normalizeCopy(raw));
	};

	const prepare = (heading: HTMLElement) => {
		heading.dataset.pitchRevealReady = 'true';

		const raw = (heading.dataset.rawText ?? heading.textContent ?? '').replace(/\r/g, '').trim();
		if (!raw) return;
		heading.dataset.rawText = raw;

		const lines = resolveLines(heading, raw);
		heading.replaceChildren();
		heading.classList.add('pitch-reveal');

		lines.forEach((lineText, index) => {
			const mask = document.createElement('span');
			mask.className = 'pitch-reveal__mask';

			const line = document.createElement('span');
			line.className = 'pitch-reveal__line';
			line.style.setProperty('--i', String(index));
			line.textContent = lineText;

			if (reduceMotion) line.classList.add('is-revealed');

			mask.appendChild(line);
			heading.appendChild(mask);
		});
	};

	const reveal = (heading: HTMLElement) => {
		if (heading.dataset.pitchRevealed === 'true') return;
		heading.dataset.pitchRevealed = 'true';
		heading.querySelectorAll('.pitch-reveal__line').forEach((line) => {
			line.classList.add('is-revealed');
		});
	};

	const remasureAll = () => {
		headings.forEach((heading) => {
			const wasRevealed = heading.dataset.pitchRevealed === 'true';
			heading.dataset.pitchRevealReady = 'false';
			heading.dataset.pitchRevealed = 'false';
			const raw = heading.dataset.rawText;
			if (raw) heading.textContent = raw;
			prepare(heading);
			if (wasRevealed || reduceMotion) reveal(heading);
		});
	};

	const start = () => {
		headings.forEach(prepare);

		if (reduceMotion) {
			headings.forEach(reveal);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					reveal(entry.target as HTMLElement);
					observer.unobserve(entry.target);
				}
			},
			{ root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.2 },
		);

		headings.forEach((heading) => {
			const rect = heading.getBoundingClientRect();
			if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
				requestAnimationFrame(() => requestAnimationFrame(() => reveal(heading)));
				return;
			}
			observer.observe(heading);
		});

		let resizeTimer = 0;
		window.addEventListener(
			'resize',
			() => {
				window.clearTimeout(resizeTimer);
				resizeTimer = window.setTimeout(remasureAll, 120);
			},
			{ passive: true },
		);

		desktopMq.addEventListener('change', remasureAll);
	};

	const fontsReady = document.fonts?.ready ?? Promise.resolve();
	fontsReady.then(start).catch(start);
}

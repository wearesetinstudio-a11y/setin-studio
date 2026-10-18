import { wait } from './sygnetFlipAnimation.ts';

const MAX_WAIT_MS = 8000;

/** Hero / first-viewport backgrounds that must be paint-ready before the transition reveal. */
const CRITICAL_IMAGE_SELECTOR = '.project-hero-background';

function waitForImage(img: HTMLImageElement): Promise<void> {
	return new Promise((resolve) => {
		img.loading = 'eager';
		img.fetchPriority = 'high';

		const finish = () => {
			if (typeof img.decode === 'function') {
				void img.decode().then(
					() => resolve(),
					() => resolve(),
				);
				return;
			}
			resolve();
		};

		if (img.complete && img.naturalWidth > 0) {
			finish();
			return;
		}

		img.addEventListener('load', finish, { once: true });
		img.addEventListener('error', () => resolve(), { once: true });
	});
}

/**
 * Hold the page-transition cover until critical destination media is decoded,
 * so the reveal does not flash an empty hero background.
 */
export async function waitForCriticalPageMedia(): Promise<void> {
	const images = Array.from(
		document.querySelectorAll<HTMLImageElement>(CRITICAL_IMAGE_SELECTOR),
	);
	if (!images.length) return;

	await Promise.race([
		Promise.all(images.map(waitForImage)).then(() => wait(40)),
		wait(MAX_WAIT_MS),
	]);
}

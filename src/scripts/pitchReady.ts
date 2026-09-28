/**
 * Resolves once the pitch preloader has finished (or immediately when the page has none).
 * Shared module so page scripts and the layout script see the same promise regardless of order.
 */
let resolveReady: () => void = () => {};

export const pitchReady = new Promise<void>((resolve) => {
	resolveReady = resolve;
	if (!document.querySelector('[data-pitch-preloader]')) resolve();
});

export function markPitchReady() {
	resolveReady();
}

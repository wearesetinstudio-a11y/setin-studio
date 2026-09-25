/**
 * Keep pitch sticky offsets in sync with the shared site header height.
 */
export function initTorosNav() {
	const nav = document.getElementById('site-header');
	if (!nav) return;

	const update = () => {
		document.documentElement.style.setProperty('--pitch-nav-offset', `${nav.offsetHeight}px`);
	};

	update();
	window.addEventListener('resize', update, { passive: true });

	if (typeof ResizeObserver !== 'undefined') {
		const observer = new ResizeObserver(update);
		observer.observe(nav);
	}
}

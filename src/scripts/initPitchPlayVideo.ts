/**
 * Click-to-play videos with sound: centered play button starts playback unmuted,
 * native controls take over afterwards. Pauses when scrolled out of view.
 *
 * Selectors: `[data-click-play]` (portfolio) and `[data-pitch-play]` (legacy pitches).
 */
export function initPitchPlayVideo() {
	const wrappers = Array.from(
		document.querySelectorAll<HTMLElement>('[data-click-play], [data-pitch-play]'),
	);

	wrappers.forEach((wrapper) => {
		if (wrapper.dataset.bound === 'true') return;
		wrapper.dataset.bound = 'true';

		const video = wrapper.querySelector<HTMLVideoElement>('video');
		const button = wrapper.querySelector<HTMLButtonElement>(
			'[data-click-play-button], [data-pitch-play-button]',
		);
		if (!video || !button) return;

		const start = () => {
			video.muted = false;
			video.volume = 1;
			video.controls = true;
			wrapper.classList.add('is-playing');
			const play = video.play();
			if (play && typeof play.catch === 'function') {
				play.catch(() => {
					wrapper.classList.remove('is-playing');
					video.controls = false;
				});
			}
		};

		button.addEventListener('click', start);

		video.addEventListener('ended', () => {
			wrapper.classList.remove('is-playing');
			video.controls = false;
			video.currentTime = 0;
		});

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting && !video.paused) video.pause();
				}
			},
			{ threshold: 0 },
		);
		observer.observe(video);
	});
}

/**
 * Ensure pitch hero videos autoplay when they enter the viewport.
 * Some browsers ignore the autoplay attribute until a play() call.
 */
export function initTorosVideos() {
	const videos = Array.from(
		document.querySelectorAll<HTMLVideoElement>('video[data-toros-video]'),
	);
	if (!videos.length) return;

	const tryPlay = (video: HTMLVideoElement) => {
		video.muted = true;
		video.defaultMuted = true;
		video.playsInline = true;
		video.loop = true;
		const play = video.play();
		if (play && typeof play.catch === 'function') {
			play.catch(() => {
				/* autoplay may still be blocked — ignore */
			});
		}
	};

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const video = entry.target as HTMLVideoElement;
				if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
					tryPlay(video);
				} else if (!entry.isIntersecting) {
					video.pause();
				}
			}
		},
		{ root: null, threshold: [0, 0.15, 0.5] },
	);

	videos.forEach((video) => {
		video.muted = true;
		video.defaultMuted = true;
		video.setAttribute('muted', '');
		video.setAttribute('playsinline', '');
		// Always try play once metadata is ready (covers iOS / strict autoplay)
		if (video.readyState >= 2) tryPlay(video);
		else video.addEventListener('loadeddata', () => tryPlay(video), { once: true });
		observer.observe(video);
	});
}

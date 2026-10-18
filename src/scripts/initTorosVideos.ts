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
		const play = () => {
			const result = video.play();
			if (result && typeof result.catch === 'function') {
				result.catch(() => {
					/* autoplay may still be blocked — ignore */
				});
			}
		};
		if (video.readyState >= 3) play();
		else video.addEventListener('canplay', play, { once: true });
	};

	const visible = new Set<HTMLVideoElement>();

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const video = entry.target as HTMLVideoElement;
				if (entry.isIntersecting) visible.add(video);
				else visible.delete(video);
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
		// Play once data is ready, but only if on screen (media is also preloaded ahead of scroll)
		const playIfVisible = () => {
			if (visible.has(video)) tryPlay(video);
		};
		if (video.readyState >= 2) playIfVisible();
		else video.addEventListener('loadeddata', playIfVisible);
		observer.observe(video);
	});
}

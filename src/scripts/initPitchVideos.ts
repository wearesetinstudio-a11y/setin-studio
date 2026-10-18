/**
 * Ensure pitch hero videos autoplay when visible (muted + playsinline).
 */
export function initPitchVideos() {
	const videos = Array.from(
		document.querySelectorAll<HTMLVideoElement>('video[data-pitch-video]'),
	);
	if (!videos.length) return;

	const tryPlay = (video: HTMLVideoElement) => {
		video.muted = true;
		const play = () => {
			const result = video.play();
			if (result && typeof result.catch === 'function') {
				result.catch(() => {
					/* Autoplay can still be blocked — poster remains */
				});
			}
		};
		if (video.readyState >= 3) play();
		else video.addEventListener('canplay', play, { once: true });
	};

	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const video = entry.target as HTMLVideoElement;
				if (entry.isIntersecting) tryPlay(video);
				else video.pause();
			}
		},
		{ root: null, threshold: 0.2 },
	);

	videos.forEach((video) => {
		video.muted = true;
		video.playsInline = true;
		video.setAttribute('playsinline', '');
		video.setAttribute('webkit-playsinline', '');
		io.observe(video);
		if (video.getBoundingClientRect().top < window.innerHeight) tryPlay(video);
	});
}

type MediaWindow = Window &
	typeof globalThis & {
		__setinProjectMediaObserver?: IntersectionObserver;
	};

/** Play only when the cover is actually in / near the viewport. */
const PLAY_MARGIN = '8% 0px';

function getObserver(): IntersectionObserver {
	const mediaWindow = window as MediaWindow;
	if (mediaWindow.__setinProjectMediaObserver) return mediaWindow.__setinProjectMediaObserver;

	mediaWindow.__setinProjectMediaObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const video = entry.target;
				if (!(video instanceof HTMLVideoElement)) continue;

				if (entry.isIntersecting) {
					if (video.preload !== 'auto') {
						video.preload = 'auto';
						if (video.readyState < 2) video.load();
					}
					void video.play().catch(() => {});
				} else if (!video.paused) {
					video.pause();
				}
			}
		},
		{ rootMargin: PLAY_MARGIN, threshold: 0.05 },
	);

	return mediaWindow.__setinProjectMediaObserver;
}

/** Decode and play project covers only once they enter the viewport. */
export function initProjectMediaVisibility() {
	const observer = getObserver();

	document.querySelectorAll<HTMLVideoElement>('.project-card__media video').forEach((video) => {
		video.autoplay = false;
		video.preload = 'none';
		video.pause();
		observer.observe(video);
	});
}

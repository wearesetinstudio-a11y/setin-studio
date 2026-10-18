type AutoplayWindow = Window &
	typeof globalThis & {
		__setinBufferedAutoplayObserver?: IntersectionObserver;
	};

const PLAY_MARGIN = '12% 0px';

function tryPlayWhenReady(video: HTMLVideoElement) {
	video.muted = true;
	const play = () => {
		void video.play().catch(() => {});
	};

	if (video.readyState >= 3) {
		play();
		return;
	}

	const onCanPlay = () => {
		video.removeEventListener('canplay', onCanPlay);
		play();
	};
	video.addEventListener('canplay', onCanPlay);
}

function getObserver(): IntersectionObserver {
	const autoplayWindow = window as AutoplayWindow;
	if (autoplayWindow.__setinBufferedAutoplayObserver) {
		return autoplayWindow.__setinBufferedAutoplayObserver;
	}

	autoplayWindow.__setinBufferedAutoplayObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const video = entry.target;
				if (!(video instanceof HTMLVideoElement)) continue;

				if (entry.isIntersecting) {
					if (video.preload !== 'auto') {
						video.preload = 'auto';
						if (video.readyState < 2) video.load();
					}
					tryPlayWhenReady(video);
				} else if (!video.paused) {
					video.pause();
				}
			}
		},
		{ rootMargin: PLAY_MARGIN, threshold: 0.05 },
	);

	return autoplayWindow.__setinBufferedAutoplayObserver;
}

/**
 * Muted loop videos that should only load/play near the viewport, after a short buffer.
 * Mark elements with `data-buffered-autoplay`.
 */
export function initBufferedAutoplayVideos(root: ParentNode = document) {
	const observer = getObserver();

	root.querySelectorAll<HTMLVideoElement>('video[data-buffered-autoplay]').forEach((video) => {
		if (video.dataset.bufferedBound === 'true') return;
		video.dataset.bufferedBound = 'true';
		video.autoplay = false;
		video.muted = true;
		video.playsInline = true;
		video.preload = 'none';
		video.pause();
		observer.observe(video);
	});
}

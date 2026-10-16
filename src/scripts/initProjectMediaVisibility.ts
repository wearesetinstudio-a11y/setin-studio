type MediaWindow = Window &
	typeof globalThis & {
		__setinProjectMediaObserver?: IntersectionObserver;
	};

function getObserver(): IntersectionObserver {
	const mediaWindow = window as MediaWindow;
	if (mediaWindow.__setinProjectMediaObserver) return mediaWindow.__setinProjectMediaObserver;

	mediaWindow.__setinProjectMediaObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const video = entry.target as HTMLVideoElement;
				if (!(video instanceof HTMLVideoElement)) continue;
				if (entry.isIntersecting) {
					void video.play().catch(() => {});
				} else {
					video.pause();
				}
			}
		},
		{ rootMargin: '40% 0px 100% 0px', threshold: 0.01 },
	);

	return mediaWindow.__setinProjectMediaObserver;
}

/** Pause off-screen project card videos so the page doesn't jank. */
export function initProjectMediaVisibility() {
	const observer = getObserver();
	document.querySelectorAll<HTMLVideoElement>('.project-card__media video').forEach((video) => {
		observer.observe(video);
		const rect = video.getBoundingClientRect();
		const ahead = window.innerHeight;
		const inView =
			rect.bottom > -ahead &&
			rect.top < window.innerHeight + ahead &&
			rect.right > 0 &&
			rect.left < window.innerWidth;
		if (!inView) video.pause();
	});
}

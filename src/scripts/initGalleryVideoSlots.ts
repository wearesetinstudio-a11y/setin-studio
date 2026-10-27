/**
 * Reserve size + gray placeholder for gallery videos until the first frame is ready,
 * so late-loading clips don't collapse layout or pop in abruptly.
 */
export function initGalleryVideoSlots(root: ParentNode = document) {
	root.querySelectorAll<HTMLElement>('[data-gallery-video-slot]').forEach((slot) => {
		if (slot.dataset.slotBound === 'true') return;
		slot.dataset.slotBound = 'true';

		const video = slot.querySelector<HTMLVideoElement>('video');
		if (!video) return;

		let ready = false;

		const applyAspect = () => {
			if (video.videoWidth > 0 && video.videoHeight > 0) {
				slot.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
			}
		};

		const markReady = () => {
			if (ready) return;
			ready = true;
			applyAspect();
			slot.classList.add('is-ready');
			slot.classList.remove('is-loading');
		};

		if (video.readyState >= 2 && video.videoWidth > 0) {
			markReady();
			return;
		}

		slot.classList.add('is-loading');
		slot.classList.remove('is-ready');

		video.addEventListener('loadedmetadata', applyAspect);
		video.addEventListener('loadeddata', markReady);
		video.addEventListener('canplay', markReady);
		video.addEventListener(
			'playing',
			() => {
				markReady();
			},
			{ once: true },
		);
	});
}

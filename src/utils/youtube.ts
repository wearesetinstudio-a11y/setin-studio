const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

export function extractYouTubeId(input: string): string | null {
	const value = input.trim();
	if (!value) return null;
	if (YOUTUBE_ID_PATTERN.test(value)) return value;

	try {
		const url = new URL(value);
		const host = url.hostname.replace(/^www\./, '');

		if (host === 'youtu.be') {
			const id = url.pathname.split('/').filter(Boolean)[0] ?? '';
			return YOUTUBE_ID_PATTERN.test(id) ? id : null;
		}

		if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
			const fromQuery = url.searchParams.get('v');
			if (fromQuery && YOUTUBE_ID_PATTERN.test(fromQuery)) return fromQuery;

			const parts = url.pathname.split('/').filter(Boolean);
			const embedIndex = parts.findIndex((part) => part === 'embed' || part === 'shorts' || part === 'live');
			if (embedIndex >= 0) {
				const id = parts[embedIndex + 1] ?? '';
				return YOUTUBE_ID_PATTERN.test(id) ? id : null;
			}
		}
	} catch {
		return null;
	}

	return null;
}

export function getYouTubeEmbedUrl(input: string): string | null {
	const id = extractYouTubeId(input);
	if (!id) return null;
	return `https://www.youtube-nocookie.com/embed/${id}`;
}

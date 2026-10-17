import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { withPublicAssetVersion } from './withPublicAssetVersion';

/** Still frames next to animated covers — shown until video/Rive is ready. */
const POSTER_CANDIDATES = [
	'cover_image.webp',
	'cover-image.webp',
	'cover_image.jpg',
	'cover-image.jpg',
	'cover_image.png',
	'cover-image.png',
];

export function resolveCoverPoster(folderName: string): string {
	if (!folderName) return '';

	for (const filename of POSTER_CANDIDATES) {
		const absolute = join(process.cwd(), 'public', 'portfolio', folderName, filename);
		if (existsSync(absolute)) {
			return withPublicAssetVersion(`/portfolio/${folderName}/${filename}`);
		}
	}

	return '';
}

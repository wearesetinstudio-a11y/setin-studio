import sharp from 'sharp';
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'public/portfolio/nrv-web');
const MAX_COVER = 1600;
const MAX_BG = 2400;
const MAX_GALLERY = 2000;

function targetName(name) {
	const numbered = name.match(/^(\d+)_(\d+)\.webp$/i);
	if (numbered) return `${numbered[1]}.${numbered[2]}.webp`;
	if (name === 'cover.webp') return 'cover.webp';
	if (name === 'bg.webp') return 'bg.webp';
	return name;
}

function maxWidthFor(name) {
	if (name === 'cover.webp') return MAX_COVER;
	if (name === 'bg.webp') return MAX_BG;
	return MAX_GALLERY;
}

const files = readdirSync(dir).filter((name) => /^(\d+_\d+|cover|bg)\.webp$/i.test(name));

for (const name of files) {
	const src = join(dir, name);
	const destName = targetName(name);
	const dest = join(dir, destName === name ? `${name.replace('.webp', '.opt.webp')}` : destName);
	const maxW = maxWidthFor(name);

	const meta = await sharp(src, { limitInputPixels: false }).metadata();
	const width = meta.width ?? 0;
	const height = meta.height ?? 0;
	if (!width) continue;

	const needsResize = Math.max(width, height) > maxW || width > maxW;
	if (!needsResize && destName === name) {
		console.log('ok ', name, `${width}x${height}`);
		continue;
	}

	const pipeline = sharp(src, { limitInputPixels: false }).rotate();
	const resized = needsResize
		? pipeline.resize({
				width: maxW,
				height: maxW,
				fit: 'inside',
				withoutEnlargement: true,
			})
		: pipeline;

	const buffer = await resized.webp({ quality: 78, effort: 4 }).toBuffer();
	try {
		writeFileSync(dest, buffer);
		const after = await sharp(buffer).metadata();
		console.log('wrote', destName === name ? dest.replace(/.*\\/, '') : destName, `${width}x${height} -> ${after.width}x${after.height}`);
	} catch (error) {
		console.log('fail', dest, error.code);
	}
}

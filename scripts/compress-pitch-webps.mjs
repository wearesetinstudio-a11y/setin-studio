/**
 * Compress oversized pitch WebPs to portfolio-like weights.
 *
 *   node scripts/compress-pitch-webps.mjs
 *   node scripts/compress-pitch-webps.mjs aeronaval
 */
import sharp from 'sharp';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const slug = process.argv[2] || 'turysta';
const dir = join(process.cwd(), 'public/pitches', slug);
const MAX_BG = 2400;
const MAX_GALLERY = 2000;
const QUALITY = 78;
const SKIP_UNDER_BYTES = 450_000;

function maxWidthFor(name) {
	if (/^bg\./i.test(name) || /hero/i.test(name)) return MAX_BG;
	return MAX_GALLERY;
}

const files = readdirSync(dir).filter((name) => /\.webp$/i.test(name) && !name.includes('.tmp.'));
if (!files.length) {
	console.error('No webp files in', dir);
	process.exit(1);
}

let saved = 0;
let beforeTotal = 0;
let afterTotal = 0;

for (const name of files) {
	const src = join(dir, name);
	const before = statSync(src).size;
	beforeTotal += before;

	const input = readFileSync(src);
	const meta = await sharp(input, { limitInputPixels: false }).metadata();
	const width = meta.width ?? 0;
	const height = meta.height ?? 0;
	if (!width) continue;

	const maxW = maxWidthFor(name);
	const needsResize = width > maxW;
	if (!needsResize && before <= SKIP_UNDER_BYTES) {
		afterTotal += before;
		console.log('skip', name, `${width}x${height}`, `${(before / 1e6).toFixed(2)}MB`);
		continue;
	}

	let pipeline = sharp(input, { limitInputPixels: false }).rotate();
	if (needsResize) {
		pipeline = pipeline.resize({
			width: maxW,
			height: maxW,
			fit: 'inside',
			withoutEnlargement: true,
		});
	}

	const buffer = await pipeline.webp({ quality: QUALITY, effort: 5 }).toBuffer();
	if (buffer.length >= before * 0.98 && !needsResize) {
		afterTotal += before;
		console.log('keep', name, `${(before / 1e6).toFixed(2)}MB (no gain)`);
		continue;
	}

	writeFileSync(src, buffer);
	const after = await sharp(buffer).metadata();
	afterTotal += buffer.length;
	saved += before - buffer.length;
	console.log(
		'ok  ',
		name,
		`${width}x${height}→${after.width}x${after.height}`,
		`${(before / 1e6).toFixed(2)}→${(buffer.length / 1e6).toFixed(2)}MB`,
	);
}

console.log(
	`\n${slug}: ${(beforeTotal / 1e6).toFixed(1)}MB → ${(afterTotal / 1e6).toFixed(1)}MB (saved ${(saved / 1e6).toFixed(1)}MB)`,
);

import fs from 'fs';
import path from 'path';
import { createCanvas } from '@napi-rs/canvas';

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

const pdfPath = String.raw`c:\Users\PhotoAiD SA\Downloads\Mobile.pdf`;
const outDir = path.resolve('public/pitches/toros-dechiriqui/_mobile-ref');
fs.mkdirSync(outDir, { recursive: true });

const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjs.getDocument({
	data,
	disableWorker: true,
	useSystemFonts: true,
	verbosity: 0,
}).promise;

const page = await doc.getPage(1);
const scale = 1.25;
const full = page.getViewport({ scale });
const pageW = Math.ceil(full.width);
const pageH = Math.ceil(full.height);
console.log('page', pageW, 'x', pageH);

const sliceH = 1600;
let index = 0;
for (let y = 0; y < pageH; y += sliceH) {
	const h = Math.min(sliceH, pageH - y);
	// Transform: scale then translate so we only paint the visible band
	const canvas = createCanvas(pageW, h);
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = '#0b140f';
	ctx.fillRect(0, 0, pageW, h);

	const transform = [scale, 0, 0, scale, 0, -y];
	const viewport = page.getViewport({ scale, offsetX: 0, offsetY: 0 });
	await page.render({
		canvasContext: ctx,
		viewport,
		transform: [1, 0, 0, 1, 0, -y],
	}).promise;

	const out = path.join(outDir, `slice-${String(index).padStart(2, '0')}.jpg`);
	fs.writeFileSync(out, canvas.toBuffer('image/jpeg', 82));
	console.log('wrote', out, fs.statSync(out).size, `y=${y}-${y + h}`);
	index += 1;
}

console.log('done slices', index);

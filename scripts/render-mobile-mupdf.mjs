import fs from 'fs';
import path from 'path';
import * as mupdf from 'mupdf';
import sharp from 'sharp';

const pdfPath = 'c:/Users/PhotoAiD SA/Downloads/Mobile.pdf';
const outDir = path.resolve('public/pitches/toros-dechiriqui/_mobile-ref');
fs.mkdirSync(outDir, { recursive: true });

const doc = mupdf.Document.openDocument(fs.readFileSync(pdfPath), 'application/pdf');
const page = doc.loadPage(0);
const bounds = page.getBounds();
const pageW = bounds[2] - bounds[0];
const pageH = bounds[3] - bounds[1];
console.log('page', pageW, 'x', pageH);

// Low-res full render for overview (390 * 0.8 ≈ 312 wide)
const scale = 0.8;
const pixmap = page.toPixmap(mupdf.Matrix.scale(scale, scale), mupdf.ColorSpace.DeviceRGB, false, true);
const png = Buffer.from(pixmap.asPNG());
const fullPath = path.join(outDir, 'full-low.png');
fs.writeFileSync(fullPath, png);
console.log('full', png.length, pixmap.getWidth(), 'x', pixmap.getHeight());

const meta = await sharp(png).metadata();
const sliceH = 1800;
const w = meta.width;
const h = meta.height;
let i = 0;
for (let y = 0; y < h; y += sliceH) {
	const sh = Math.min(sliceH, h - y);
	const out = path.join(outDir, `view-${String(i).padStart(2, '0')}.jpg`);
	await sharp(png).extract({ left: 0, top: y, width: w, height: sh }).jpeg({ quality: 80 }).toFile(out);
	console.log('slice', i, out);
	i++;
}
console.log('slices', i);

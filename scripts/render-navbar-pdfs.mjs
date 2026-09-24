import fs from 'node:fs';
import path from 'node:path';
import * as mupdf from 'mupdf';
import sharp from 'sharp';

const outDir = path.resolve('public/pitches/toros-dechiriqui/_mobile-ref/navbar');
fs.mkdirSync(outDir, { recursive: true });

async function render(pdfPath, prefix) {
	const bytes = fs.readFileSync(pdfPath);
	const doc = mupdf.Document.openDocument(bytes, 'application/pdf');
	const page = doc.loadPage(0);
	const bounds = page.getBounds();
	const pageW = bounds[2] - bounds[0];
	const pageH = bounds[3] - bounds[1];
	console.log(prefix, 'page', pageW, 'x', pageH);

	const scale = Math.min(2, 1800 / pageW);
	const pixmap = page.toPixmap(
		mupdf.Matrix.scale(scale, scale),
		mupdf.ColorSpace.DeviceRGB,
		false,
		true,
	);
	const w = pixmap.getWidth();
	const h = pixmap.getHeight();
	const raw = Buffer.from(pixmap.getPixels());
	const pngBuf = await sharp(raw, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();

	const fullPath = path.join(outDir, `${prefix}-full.png`);
	fs.writeFileSync(fullPath, pngBuf);
	console.log('wrote', fullPath, w, 'x', h);

	const sliceH = Math.min(1400, h);
	let i = 0;
	for (let y = 0; y < h; y += sliceH) {
		const hh = Math.min(sliceH, h - y);
		const slicePath = path.join(outDir, `${prefix}-view-${String(i).padStart(2, '0')}.jpg`);
		await sharp(pngBuf)
			.extract({ left: 0, top: y, width: w, height: hh })
			.jpeg({ quality: 88 })
			.toFile(slicePath);
		console.log('slice', slicePath);
		i += 1;
	}
}

await render('C:/Users/PhotoAiD SA/Downloads/Navbar.pdf', 'desktop');
await render('C:/Users/PhotoAiD SA/Downloads/Navbar/Mobile.pdf', 'mobile');

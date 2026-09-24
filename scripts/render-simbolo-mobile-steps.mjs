import fs from 'node:fs';
import path from 'node:path';
import * as mupdf from 'mupdf';
import sharp from 'sharp';

const outDir = path.resolve('public/pitches/toros-dechiriqui/_mobile-ref/simbolo-mobile');
fs.mkdirSync(outDir, { recursive: true });

async function render(pdfPath, prefix) {
	const bytes = fs.readFileSync(pdfPath);
	const doc = mupdf.Document.openDocument(bytes, 'application/pdf');
	const page = doc.loadPage(0);
	const bounds = page.getBounds();
	const pageW = bounds[2] - bounds[0];
	const pageH = bounds[3] - bounds[1];
	const text = page.toStructuredText('preserve-whitespace').asJSON();
	const plain = JSON.parse(text)
		.blocks?.flatMap((b) => b.lines?.map((l) => l.text) ?? [])
		.join('\n');
	fs.writeFileSync(path.join(outDir, `${prefix}-text.txt`), plain || '');
	console.log('\n===', prefix, '===');
	console.log(plain);

	const scale = Math.min(2, 900 / pageW);
	const pixmap = page.toPixmap(
		mupdf.Matrix.scale(scale, scale),
		mupdf.ColorSpace.DeviceRGB,
		false,
		true,
	);
	const w = pixmap.getWidth();
	const h = pixmap.getHeight();
	const raw = Buffer.from(pixmap.getPixels());
	await sharp(raw, { raw: { width: w, height: h, channels: 3 } })
		.jpeg({ quality: 88 })
		.toFile(path.join(outDir, `${prefix}.jpg`));
	console.log('wrote', prefix, w, 'x', h);
}

const base = 'C:/Users/PhotoAiD SA/Downloads';
for (let i = 1; i <= 5; i++) {
	await render(`${base}/Símbolo_Mobile ${i}.pdf`, `step-${i}`);
}

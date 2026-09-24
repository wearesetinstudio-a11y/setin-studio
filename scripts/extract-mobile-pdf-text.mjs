import fs from 'fs';
import path from 'path';

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
const pdfPath = String.raw`c:\Users\PhotoAiD SA\Downloads\Mobile.pdf`;
const outDir = path.resolve('public/pitches/toros-dechiriqui/_mobile-ref');
fs.mkdirSync(outDir, { recursive: true });

const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjs.getDocument({ data, disableWorker: true, verbosity: 0 }).promise;
const page = await doc.getPage(1);
const viewport = page.getViewport({ scale: 1 });
console.log('page', viewport.width, 'x', viewport.height);

const text = await page.getTextContent();
const lines = [];
for (const item of text.items) {
	if (!item.str || !item.str.trim()) continue;
	const tx = item.transform;
	const x = Math.round(tx[4]);
	const y = Math.round(viewport.height - tx[5]); // top-origin
	const fontSize = Math.round(Math.hypot(tx[0], tx[1]));
	lines.push({ x, y, fontSize, str: item.str });
}
lines.sort((a, b) => a.y - b.y || a.x - b.x);

// Merge items on same visual line
const merged = [];
for (const item of lines) {
	const last = merged[merged.length - 1];
	if (last && Math.abs(last.y - item.y) < Math.max(8, item.fontSize * 0.4) && item.x - (last.xEnd ?? last.x) < 40) {
		last.str += item.str;
		last.xEnd = item.x + item.str.length * item.fontSize * 0.5;
		last.fontSize = Math.max(last.fontSize, item.fontSize);
	} else {
		merged.push({ ...item, xEnd: item.x + item.str.length * item.fontSize * 0.5 });
	}
}

const out = merged.map((l) => `${String(l.y).padStart(5)} | ${String(l.fontSize).padStart(2)}px | ${l.str}`).join('\n');
fs.writeFileSync(path.join(outDir, 'text-map.txt'), out);
console.log('text items', merged.length);
console.log(out.slice(0, 8000));
console.log('\n--- ... ---\n');
console.log(out.slice(-4000));

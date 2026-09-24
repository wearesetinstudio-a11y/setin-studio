import fs from 'fs';
import path from 'path';

const pdfPath = 'c:/Users/PhotoAiD SA/Downloads/Mobile.pdf';
const outDir = path.resolve('public/pitches/toros-dechiriqui/_mobile-ref');
fs.mkdirSync(outDir, { recursive: true });

const buf = fs.readFileSync(pdfPath);
let count = 0;
const jpegStarts = [];
for (let i = 0; i < buf.length - 1; i++) {
	if (buf[i] === 0xff && buf[i + 1] === 0xd8) jpegStarts.push(i);
}
console.log('jpeg markers', jpegStarts.length);

for (const start of jpegStarts) {
	let end = -1;
	for (let i = start + 2; i < buf.length - 1; i++) {
		if (buf[i] === 0xff && buf[i + 1] === 0xd9) {
			end = i + 2;
			break;
		}
	}
	if (end < 0) continue;
	const size = end - start;
	if (size < 80000) continue;
	const name = path.join(outDir, `img-${String(count).padStart(3, '0')}.jpg`);
	fs.writeFileSync(name, buf.subarray(start, end));
	console.log(path.basename(name), size);
	count++;
	if (count >= 60) break;
}

// Also PNG
let pngCount = 0;
for (let i = 0; i < buf.length - 8; i++) {
	if (
		buf[i] === 0x89 &&
		buf[i + 1] === 0x50 &&
		buf[i + 2] === 0x4e &&
		buf[i + 3] === 0x47
	) {
		// find IEND
		let end = -1;
		for (let j = i + 8; j < buf.length - 8; j++) {
			if (
				buf[j] === 0x49 &&
				buf[j + 1] === 0x45 &&
				buf[j + 2] === 0x4e &&
				buf[j + 3] === 0x44
			) {
				end = j + 8;
				break;
			}
		}
		if (end < 0) continue;
		const size = end - i;
		if (size < 80000) continue;
		const name = path.join(outDir, `png-${String(pngCount).padStart(3, '0')}.png`);
		fs.writeFileSync(name, buf.subarray(i, end));
		console.log(path.basename(name), size);
		pngCount++;
		if (pngCount >= 40) break;
	}
}

console.log('jpeg saved', count, 'png saved', pngCount);

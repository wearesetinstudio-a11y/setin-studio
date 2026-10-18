import ExcelJS from 'exceljs';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'templates');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'pitch-content-template.xlsx');

const workbook = new ExcelJS.Workbook();
workbook.creator = 'Setin Studio';
workbook.created = new Date();

const border = {
	top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
	left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
	bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
	right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
};

/** @param {ExcelJS.Worksheet} sheet */
function styleHeader(sheet) {
	const header = sheet.getRow(1);
	header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
	header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF131415' } };
	header.alignment = { vertical: 'middle' };
	header.height = 22;
}

/* ------------------------------------------------------------------ */
/* Sheet 1 — Pitch content                                             */
/* ------------------------------------------------------------------ */

const sheet = workbook.addWorksheet('Pitch content', {
	views: [{ state: 'frozen', ySplit: 1, xSplit: 2 }],
});

sheet.columns = [
	{ header: 'Block', key: 'block', width: 18 },
	{ header: 'Field', key: 'field', width: 34 },
	{ header: 'Content', key: 'content', width: 60 },
	{ header: 'Example (Aeronaval)', key: 'example', width: 48 },
	{ header: 'Notes', key: 'notes', width: 46 },
];
styleHeader(sheet);

/** @typedef {{ block: string; field: string; example?: string; notes?: string; long?: boolean }} Row */

/** @type {Row[]} */
const rows = [
	{ block: 'Pitch', field: 'Slug', example: 'aeronaval', notes: 'URL /pitches/<slug> and asset folder public/pitches/<slug>/. Lowercase, hyphens only.' },
	{ block: 'Pitch', field: 'Client name', example: 'Servicio Nacional Aeronaval (SENAN)' },
	{ block: 'Pitch', field: 'Page title (browser tab)', example: 'Aeronaval — Propuesta', notes: '"— Setin Studio" is appended automatically.' },
	{ block: 'Pitch', field: 'Meta description', example: 'Propuesta privada de extensión de identidad visual para el Servicio Nacional Aeronaval por Setin Studio.', notes: 'Shown when the link is shared. Pitches are always noindex.' },
	{ block: 'Pitch', field: 'Language', example: 'es', notes: 'Header + Footer stay in Spanish.' },

	{
		block: 'Theme',
		field: 'Theme color (leading)',
		example: '#0d0e0f',
		notes: 'ONE color for navbar (after scroll), footer, preloader, and mobile section list.',
	},
	{
		block: 'Theme',
		field: 'Page / sidebar background',
		example: '#0d0e0f',
		notes: 'Behind the hero and the left sidebar column (desktop gradient edge).',
	},
	{
		block: 'Theme',
		field: 'Content surface',
		example: '#17181c',
		notes: 'Background of the content column (Toros: #111a15, Turysta: #000731).',
	},
	{ block: 'Theme', field: 'Accent color', example: '#ffffff', notes: 'Toros: #a4ff00.' },
	{ block: 'Theme', field: 'Display font (headings)', example: 'Saira', notes: 'Google Font name.' },
	{ block: 'Theme', field: 'Body font', example: 'Public Sans', notes: 'Google Font name. Also used for nav labels.' },

	{ block: 'Navbar', field: 'Lockup (setin × client)', example: 'nav-lockup.svg', notes: 'SVG, white. Height ~59px.' },
	{ block: 'Navbar', field: 'Lockup width × height (px)', example: '235 × 59' },

	{ block: 'Hero', field: 'Eyebrow label', example: 'Propuesta', notes: 'Small caps line above the headline (Toros: "Propuesta de Rebranding").' },
	{ block: 'Hero', field: 'Headline', example: 'La nueva identidad del Aeronaval', notes: 'One line on desktop.' },
	{ block: 'Hero', field: 'Headline — mobile line breaks', example: 'La nueva identidad|del Aeronaval', notes: 'Same text, split lines with |' },
	{ block: 'Hero', field: 'Subtitle', example: 'Una evolución gráfica diseñada para potenciar la presencia institucional…', long: true, notes: '1–2 sentences.' },
	{ block: 'Hero', field: 'Background', example: 'hero_bg.webm', notes: 'Looping video (.webm) or image (.webp). Full screen, stays fixed while scrolling.' },
	{ block: 'Hero', field: 'Scroll icon (client symbol)', example: 'aeronaval_symbol.svg', notes: 'Small white SVG under the hero, ~44–60px tall.' },

	{ block: '01 Motivation', field: 'Sidebar label', example: 'Motivación' },
	{ block: '01 Motivation', field: 'Title', example: 'El origen de Iniciativa conceptual' },
	{ block: '01 Motivation', field: 'Text', example: 'El escudo tradicional del SENAN es indispensable para preservar el legado histórico…', long: true, notes: 'Why we made this pitch. Separate paragraphs with Enter (usually 2).' },
	{ block: '01 Motivation', field: 'Media', example: 'motivacion_1.mp4', notes: 'One image (.webp) or one video. .mp4 = video with sound and play button.' },
	{ block: '01 Motivation', field: 'Media alt text', example: 'Video Motivación Aeronaval' },

	{ block: '02 Reference', field: 'Sidebar label', example: 'Estándares', notes: 'Toros: "Valor".' },
	{ block: '02 Reference', field: 'Title', example: 'La evolución en la referencia internacional' },
	{ block: '02 Reference', field: 'Title — mobile line breaks', example: '', notes: 'Optional. Split lines with |' },
	{ block: '02 Reference', field: 'Intro text', example: 'A nivel global, las fuerzas armadas de referencia implementan transformaciones…', long: true },
];

const referenceCases = [
	{ logo: 'Royal Air Force.svg', name: 'Royal Air Force (Reino Unido)', lines: 'Royal Air Force|(Reino Unido)', text: 'Reestructuró su identidad unificando su escarapela histórica con tipografía precisa…' },
	{ logo: 'WP.svg', name: 'Wojsko Polskie (Polonia)', lines: 'Wojsko Polskie|(Polonia)', text: 'Introdujeron un lenguaje gráfico coherente para eliminar la fragmentación heredada…' },
	{ logo: 'US Air Force.svg', name: 'US Air Force (Estados Unidos)', lines: 'US Air Force|(Estados Unidos)', text: 'Modernizó su geometría institucional para la era digital…' },
	{ logo: 'Forsvaret.svg', name: 'Forsvaret (Dinamarca)', lines: 'Forsvaret|(Dinamarca)', text: 'Implementaron una arquitectura monolítica para integrar bajo un mismo paraguas visual…' },
];

referenceCases.forEach((item, index) => {
	const block = `02 Case ${index + 1}`;
	rows.push(
		{ block, field: 'Logo', example: item.logo, notes: index === 0 ? 'White SVG of the reference brand.' : '' },
		{ block, field: 'Name', example: item.name },
		{ block, field: 'Name — mobile line breaks', example: item.lines, notes: index === 0 ? 'Split lines with |' : '' },
		{ block, field: 'Text', example: item.text, long: true, notes: index === 0 ? 'What changed and the result (numbers work best).' : '' },
	);
});

rows.push(
	{ block: '03 Strategy', field: 'Sidebar label', example: 'Estrategia' },
	{ block: '03 Strategy', field: 'Title', example: 'Síntesis de herencia y evolución operativa' },
	{ block: '03 Strategy', field: 'Text', example: 'Nuestra aproximación metodológica se fundamenta en la evolución y no en la sustitución…', long: true },
	{ block: '03 Strategy', field: 'Media', example: 'estrategia_1.webp', notes: 'One full-width image.' },
	{ block: '03 Strategy', field: 'Media alt text', example: 'Del escudo al símbolo' },

	{ block: '04 Symbol', field: 'Sidebar label', example: 'Símbolo', notes: 'Sticky section: the symbol stays pinned and swaps on scroll, one step at a time.' },
	{ block: '04 Symbol', field: 'Symbol size (W × H px)', example: '224 × 165', notes: 'Artboard size shared by every step SVG.' },
);

const symbolSteps = [
	{ title: 'Anatomía y codificación del lenguaje visual', text: 'El emblema propuesto traduce los valores fundacionales de la institución…', visual: 'symbol_1.svg' },
	{ title: 'Ancla', text: 'El ancla se consolida como el eje firme de mando y liderazgo estratégico…', visual: 'symbol_2.svg' },
	{ title: 'Rosa de los vientos', text: 'La rosa de los vientos actúa como el símbolo definitivo de vigilancia integral…', visual: 'symbol_3.svg' },
	{ title: 'Alas', text: 'Las alas estilizadas representan la soberanía aérea…', visual: 'symbol_4.svg' },
	{ title: 'Escudo', text: 'El escudo conforma el marco histórico y estructural…', visual: 'symbol_5.svg' },
	{ title: 'Protección', text: 'El anillo central cerrado envuelve y protege el núcleo operativo del emblema…', visual: 'symbol_6.svg' },
];

symbolSteps.forEach((step, index) => {
	const block = `04 Step ${index + 1}`;
	const notes =
		index === 0
			? 'Step 1 = full symbol + overview. Next steps highlight one element each.'
			: index === symbolSteps.length - 1
				? 'Max 6 steps (Toros used 5). Leave unused steps empty.'
				: '';
	rows.push(
		{ block, field: 'Title', example: step.title, notes },
		{ block, field: 'Text', example: step.text, long: true },
		{ block, field: 'Visual', example: step.visual, notes: index === 0 ? 'SVG, same artboard size for every step.' : '' },
	);
});

rows.push({
	block: '04 Symbol',
	field: 'Media below (files, in order)',
	example: 'simbolo_1.webp, simbolo_2.webm, simbolo_3.webp, simbolo_4.webp',
	long: true,
	notes: 'Optional. Full-width images/videos after the steps (construction, scaling, crest…).',
});

const contentSections = [
	{
		label: 'Operativa',
		title: 'Eficacia visual en entornos operacionales complejos',
		text: 'Ya sea sobre patrulleras sometidas a la fuerza del oleaje…',
		media: 'operativa_1.webm … operativa_8.webp',
	},
	{
		label: 'Indumentaria',
		title: 'Integración rigurosa en el equipamiento táctico',
		text: 'El diseño ha sido concebido para integrarse sin fricciones…',
		media: 'indumentaria_1.webm … indumentaria_7.webp',
	},
	{
		label: 'Entorno',
		title: 'Coherencia señalética en la infraestructura',
		text: 'La legibilidad optimizada del símbolo asegura una señalización impecable…',
		media: 'entorno_1.webm … entorno_9.webp',
	},
	{
		label: 'Promoción',
		title: 'Expansión pública y posicionamiento de vanguardia',
		text: 'La nueva identidad se acopla con naturalidad a los canales de comunicación…',
		media: 'promocion_1.webm, promocion_2.webm, promocion_3.webp',
	},
	{
		label: 'Resumen',
		title: 'Una aportación conceptual al servicio de la institución',
		text: 'Este proyecto independiente refleja nuestra visión… estaremos encantados de coordinar una presentación formal.',
		media: '',
	},
	{ label: '', title: '', text: '', media: '' },
];

contentSections.forEach((section, index) => {
	const num = String(index + 5).padStart(2, '0');
	const block = `${num} Section`;
	const labelNote =
		index === 0
			? 'Applications of the identity. Toros: Logotipo, Home Kit, Away Kit, Merch, Promoción.'
			: index === contentSections.length - 1
				? 'Max 6 content sections (05–10). The last used one is the closing: Resumen / Futuro.'
				: '';
	rows.push(
		{ block, field: 'Sidebar label', example: section.label, notes: labelNote },
		{
			block,
			field: 'Layout',
			example: section.label ? 'Stack' : '',
			notes: index === 0 ? 'Stack = text, then full-width media. Split = text left + featured image right, then media (Toros kits).' : '',
		},
		{ block, field: 'Title', example: section.title },
		{ block, field: 'Text', example: section.text, long: true, notes: index === 0 ? 'Separate paragraphs with Enter.' : '' },
		{ block, field: 'Featured image (Split only)', example: '', notes: index === 0 ? 'Toros: home_1.webp next to the "Volcanic lava" text.' : '' },
		{ block, field: 'Media (files, in order)', example: section.media, long: true, notes: index === 0 ? 'Full-width images/videos stacked with 20px gap. Optional for the closing section.' : '' },
		{ block, field: 'Media alt text', example: section.label, notes: index === 0 ? 'One line, or one per file.' : '' },
	);
});

rows.push(
	{ block: 'Share', field: 'OG image', example: 'og.jpg', notes: '1200×630 JPG. Shown when the link is sent in WhatsApp / mail / LinkedIn.' },
);

/** @type {Record<string, string>} */
const blockColors = {
	Pitch: 'FFE8EEF5',
	Theme: 'FFF0E8F5',
	Navbar: 'FFE8F5F3',
	Hero: 'FFF5F0E8',
	Share: 'FFE8EEF5',
};

const blockOrder = [...new Set(rows.map((row) => row.block))];
blockOrder.forEach((block, index) => {
	if (!blockColors[block]) blockColors[block] = index % 2 === 0 ? 'FFF7F7F7' : 'FFFFFFFF';
});

for (const row of rows) {
	const r = sheet.addRow({
		block: row.block,
		field: row.field,
		content: '',
		example: row.example ?? '',
		notes: row.notes ?? '',
	});
	const fill = blockColors[row.block];
	for (let c = 1; c <= 5; c++) {
		r.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
		r.getCell(c).border = border;
		r.getCell(c).alignment = { vertical: 'top', wrapText: true };
	}
	r.getCell(1).font = { bold: true };
	r.getCell(4).font = { color: { argb: 'FF8A8A8A' }, italic: true };
	if (row.long) r.height = 60;
}

/* ------------------------------------------------------------------ */
/* Sheet 2 — Assets checklist                                          */
/* ------------------------------------------------------------------ */

const assets = workbook.addWorksheet('Assets', {
	views: [{ state: 'frozen', ySplit: 1 }],
});

assets.columns = [
	{ header: 'Section', key: 'section', width: 18 },
	{ header: 'File name', key: 'file', width: 34 },
	{ header: 'Format', key: 'format', width: 18 },
	{ header: 'Size / spec', key: 'spec', width: 40 },
	{ header: 'Ready', key: 'ready', width: 10 },
];
styleHeader(assets);

const assetRows = [
	['Navbar', 'nav-lockup.svg', 'SVG', 'setin × client, white, ~59px tall'],
	['Hero', 'hero_bg.webm / bg.webp', 'WEBM or WEBP', 'Full screen, 1920px+ wide, loop for video'],
	['Hero', '<client>_symbol.svg', 'SVG', 'White, ~44–60px tall'],
	['01', 'motivacion_1.webp / .mp4', 'WEBP or MP4', '16:9; .mp4 plays with sound on click'],
	['02', '<reference>.svg × 4', 'SVG', 'White logos of the reference brands'],
	['03', 'estrategia_1.webp', 'WEBP', 'Full width, ~3300px wide'],
	['04', 'symbol_1.svg … symbol_6.svg', 'SVG', 'Same artboard for all steps'],
	['04', 'simbolo_1…4.webp / .webm', 'WEBP or WEBM', 'Optional media under the steps'],
	['05–10', '<label>_1 … <label>_N', 'WEBP or WEBM', 'Lowercase section label + number, e.g. promocion_3.webp'],
	['Share', 'og.jpg', 'JPG', '1200×630'],
];

for (const [section, file, format, spec] of assetRows) {
	const r = assets.addRow({ section, file, format, spec, ready: '' });
	for (let c = 1; c <= 5; c++) {
		r.getCell(c).border = border;
		r.getCell(c).alignment = { vertical: 'top', wrapText: true };
	}
	r.getCell(1).font = { bold: true };
}

/* ------------------------------------------------------------------ */
/* Sheet 3 — Instructions                                              */
/* ------------------------------------------------------------------ */

const info = workbook.addWorksheet('Instructions');
info.getColumn(1).width = 110;
info.addRow(['How to fill']).font = { bold: true };
[
	'',
	'1. Fill the "Content" column. The grey "Example" column shows what Aeronaval used in the same slot.',
	'2. Fixed structure: Hero → 01 Motivation → 02 Reference cases (4) → 03 Strategy → 04 Symbol (up to 6 steps) → 05–10 content sections.',
	'3. Sidebar label = short name in the side navigation (one word, e.g. MOTIVACIÓN, PROMOCIÓN). Numbers are added automatically.',
	'4. Line breaks: use | to choose where a heading breaks on mobile.',
	'5. Text: separate paragraphs with Enter (Alt+Enter inside a cell).',
	'6. Media: list file names in display order. Put every file in public/pitches/<slug>/. Missing files are skipped.',
	'7. Content sections 05–10: use as many as needed (Aeronaval 5, Toros 6). The last one closes the pitch (Resumen / Futuro) with a call to talk.',
	'8. Images: .webp. Silent looping videos: .webm. Video with sound + play button: .mp4.',
	'9. One file = one pitch. Duplicate the workbook for each new pitch.',
].forEach((text) => info.addRow([text]));

await workbook.xlsx.writeFile(outPath);
console.log(outPath);

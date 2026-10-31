import ExcelJS from 'exceljs';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'templates');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'project-content-i18n-template.xlsx');

const workbook = new ExcelJS.Workbook();
workbook.creator = 'Setin Studio';
workbook.created = new Date();

const sheet = workbook.addWorksheet('Project translations', {
	views: [{ state: 'frozen', ySplit: 1, xSplit: 2 }],
});

sheet.columns = [
	{ header: 'Block', key: 'block', width: 14 },
	{ header: 'Field', key: 'field', width: 32 },
	{ header: 'PL', key: 'pl', width: 48 },
	{ header: 'EN', key: 'en', width: 48 },
	{ header: 'ES', key: 'es', width: 48 },
	{ header: 'Notes', key: 'notes', width: 40 },
];

const header = sheet.getRow(1);
header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A0A0B' } };
header.alignment = { vertical: 'middle' };
header.height = 22;

/** @type {{ block: string; field: string; notes: string }[]} */
const rows = [
	{ block: 'Project', field: 'Project name', notes: 'Wewnętrzna nazwa projektu / folder' },
	{
		block: 'Project',
		field: 'Theme color',
		notes: 'Hex e.g. #0A0A0B — navbar (after scroll), footer, page-transition preloader. Empty = Setin default.',
	},
	{ block: 'Hero', field: 'Hero Title', notes: 'Nagłówek w hero (może mieć łamania linii)' },
	{ block: 'Hero', field: 'Klient / Client / Cliente', notes: '' },
	{ block: 'Meta', field: 'Zakres / Services / Servicios', notes: '' },
	{ block: 'Meta', field: 'Branża / Industry / Industria', notes: '' },
	{ block: 'Meta', field: 'Rynek / Market / Mercado', notes: '' },
	{ block: 'Meta', field: 'Rok / Year / Año', notes: 'np. 2024' },
	{ block: 'Meta', field: 'Live', notes: 'Adres live, np. nrvsystems.com (bez http). Puste = ukryj wiersz na stronie.' },
];

for (let i = 1; i <= 10; i++) {
	const noteLabel =
		i === 1 ? 'np. Overview / Intro' : i === 10 ? 'Ostatnia często: Results / Podsumowanie' : '';
	rows.push(
		{ block: `Section ${i}`, field: 'Label', notes: noteLabel },
		{ block: `Section ${i}`, field: 'Title', notes: '' },
		{ block: `Section ${i}`, field: 'Description', notes: 'Dłuższy tekst; akapity rozdziel enterem' },
	);
}

/** @type {Record<string, string>} */
const blockColors = {
	Project: 'FFE8EEF5',
	Hero: 'FFF5F0E8',
	Meta: 'FFEEF5EE',
};

for (let i = 1; i <= 10; i++) {
	blockColors[`Section ${i}`] = i % 2 === 0 ? 'FFF7F7F7' : 'FFFFFFFF';
}

for (const row of rows) {
	const r = sheet.addRow({
		block: row.block,
		field: row.field,
		pl: '',
		en: '',
		es: '',
		notes: row.notes,
	});
	const fill = blockColors[row.block] || 'FFFFFFFF';
	for (let c = 1; c <= 6; c++) {
		r.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
		r.getCell(c).border = {
			top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
			left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
			bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
			right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
		};
		r.getCell(c).alignment = { vertical: 'top', wrapText: true };
	}
	r.getCell(1).font = { bold: true };
	if (row.field === 'Description') r.height = 60;
}

const info = workbook.addWorksheet('Instructions');
info.getColumn(1).width = 100;
info.addRow(['How to fill']).font = { bold: true };
[
	'',
	'1. Fill columns PL / EN / ES for each field.',
	'2. Section 1-10 map to case-study sections (max 10). Leave unused sections empty.',
	'3. Label = sidebar name (e.g. OVERVIEW, WYZWANIA, RESULTS).',
	'4. Title = section heading. Description = body copy.',
	'5. Hero Title = project hero headline.',
	'6. Meta: Services, Industry, Market, Year, Live (adres strony, ten sam we wszystkich językach).',
	'7. Theme color (Project block): one hex for navbar / footer / preloader. Same in all languages.',
	'8. One sheet = one project. Duplicate "Project translations" for more projects.',
].forEach((text) => info.addRow([text]));

await workbook.xlsx.writeFile(outPath);
console.log(outPath);

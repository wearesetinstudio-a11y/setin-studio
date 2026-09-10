import ExcelJS from 'exceljs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const xlsxPath = 'C:/Users/PhotoAiD SA/Downloads/WARSZEWICZ.xlsx';
const mdPath = join(process.cwd(), 'src/content/projects/warszewicz.md');

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(xlsxPath);
const sheet = workbook.getWorksheet('Project translations');
if (!sheet) throw new Error('Missing sheet: Project translations');

function cellText(value) {
	if (value == null) return '';
	if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
	if (typeof value === 'object' && Array.isArray(value.richText)) {
		return value.richText.map((part) => part.text).join('').trim();
	}
	if (typeof value === 'object' && value.text != null) return String(value.text).trim();
	return String(value).trim();
}

/** @type {Map<string, { row: number; pl: string; en: string; es: string }>} */
const data = new Map();

sheet.eachRow((row, rowNumber) => {
	if (rowNumber === 1) return;
	const block = cellText(row.getCell(1).value);
	const field = cellText(row.getCell(2).value);
	if (!block || !field) return;
	data.set(`${block}||${field}`, {
		row: rowNumber,
		pl: cellText(row.getCell(3).value),
		en: cellText(row.getCell(4).value),
		es: cellText(row.getCell(5).value),
	});
});

function get(block, field) {
	return data.get(`${block}||${field}`) ?? { row: 0, pl: '', en: '', es: '' };
}

function setCells(block, field, values) {
	const existing = get(block, field);
	if (!existing.row) return;
	const row = sheet.getRow(existing.row);
	if (values.pl != null) row.getCell(3).value = values.pl;
	if (values.en != null) row.getCell(4).value = values.en;
	if (values.es != null) row.getCell(5).value = values.es;
	data.set(`${block}||${field}`, {
		row: existing.row,
		pl: values.pl ?? existing.pl,
		en: values.en ?? existing.en,
		es: values.es ?? existing.es,
	});
}

function pick(block, field, lang = 'en') {
	const item = get(block, field);
	return item[lang] || item.en || item.pl || '';
}

function meta(fieldPlLike) {
	for (const [key, value] of data.entries()) {
		if (key.startsWith('Meta||') && key.includes(fieldPlLike)) return value;
	}
	return { pl: '', en: '', es: '' };
}

// Complete project name translations
const projectName = get('Project', 'Project name');
setCells('Project', 'Project name', {
	pl: projectName.pl || 'WARSZEWICZ',
	en: projectName.en || 'WARSZEWICZ',
	es: projectName.es || 'WARSZEWICZ',
});

// Move Section 10 (Results) into Section 5 when 5 is empty
const s5 = get('Section 5', 'Label');
const s10 = get('Section 10', 'Label');
if (!s5.pl && !s5.en && (s10.pl || s10.en)) {
	for (const field of ['Label', 'Title', 'Description']) {
		const from = get(`Section 10`, field);
		setCells(`Section 5`, field, { pl: from.pl, en: from.en, es: from.es });
		setCells(`Section 10`, field, { pl: '', en: '', es: '' });
	}
}

await workbook.xlsx.writeFile(xlsxPath);

function yamlScalar(key, value, indent = 0) {
	const pad = ' '.repeat(indent);
	const text = String(value ?? '').replace(/\r\n/g, '\n').trim();
	if (!text) return `${pad}${key}: ''`;
	if (!text.includes('\n')) return `${pad}${key}: ${JSON.stringify(text)}`;
	return `${pad}${key}: |-\n${text
		.split('\n')
		.map((line) => `${pad}  ${line}`)
		.join('\n')}`;
}

const sections = [];
for (let i = 1; i <= 10; i++) {
	const label = pick(`Section ${i}`, 'Label');
	const title = pick(`Section ${i}`, 'Title');
	const text = pick(`Section ${i}`, 'Description');
	if (!label && !title && !text) continue;
	sections.push({ label, title, text });
}

const isResults = (label) => /result|podsum|resumen/i.test(label);
const content = sections.filter((section) => !isResults(section.label));
const results = sections.filter((section) => isResults(section.label));
const ordered = [...content, ...results];

const overview = ordered[0];
const rest = ordered.slice(1);

const industry = meta('Industry');
const market = meta('Market');
const services = meta('Services');
const yearRaw = meta('Year').en || meta('Year').pl || meta('Año').pl || '2026';

const lines = [
	'---',
	'title: Warszewicz',
	yamlScalar('client', pick('Hero', 'Klient / Client / Cliente') || 'Warszewicz'),
	`tags: ['Video Production', 'Motion Design', 'AI Art Direction']`,
	`thumbnail: '/portfolio/warszewicz/cover.webp'`,
	`folderName: 'warszewicz'`,
	'order: 1',
	`heroImage: '/portfolio/warszewicz/bg.webp'`,
	yamlScalar('heroSubtitle', pick('Hero', 'Hero Title')),
	yamlScalar('overviewLabel', overview?.label || 'Overview'),
	yamlScalar('overviewTitle', overview?.title || ''),
	yamlScalar('overviewText', overview?.text || ''),
	`overviewYoutube: 'https://www.youtube.com/watch?v=J7tUKIalQow'`,
	yamlScalar('service', services.en || services.pl),
	yamlScalar('industry', industry.en || industry.pl),
	yamlScalar('market', market.en || market.pl),
	`year: ${Number.parseInt(String(yearRaw), 10) || 2026}`,
	'sections:',
];

rest.forEach((section, index) => {
	lines.push(`  - label: ${JSON.stringify(section.label)}`);
	lines.push(yamlScalar('title', section.title, 4));
	lines.push(yamlScalar('text', section.text, 4));
	if (!isResults(section.label)) {
		lines.push(`    afterGroup: ${index + 1}`);
	}
});

lines.push('---', '');
writeFileSync(mdPath, lines.join('\n'), 'utf8');

console.log('Excel updated:', xlsxPath);
console.log('Markdown updated:', mdPath);
console.log(
	'Sections:',
	ordered.map((section) => section.label).join(' -> '),
);

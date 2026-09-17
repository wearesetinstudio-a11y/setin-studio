import ExcelJS from 'exceljs';
import { writeFileSync } from 'node:fs';

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile('public/portfolio/nrv-web/NRV - WEB.xlsx');
const sheet = wb.getWorksheet('Project translations');

function cellText(value) {
	if (value == null) return '';
	if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
	if (typeof value === 'object' && Array.isArray(value.richText)) {
		return value.richText.map((part) => part.text).join('').trim();
	}
	if (typeof value === 'object' && value.text != null) return String(value.text).trim();
	return String(value).trim();
}

const data = new Map();
sheet.eachRow((row, n) => {
	if (n === 1) return;
	const block = cellText(row.getCell(1).value);
	const field = cellText(row.getCell(2).value);
	if (!block || !field) return;
	data.set(`${block}||${field}`, {
		pl: cellText(row.getCell(3).value),
		en: cellText(row.getCell(4).value),
		es: cellText(row.getCell(5).value),
	});
});

function get(block, field, lang) {
	const item = data.get(`${block}||${field}`) || { pl: '', en: '', es: '' };
	return item[lang] || item.en || '';
}

function dumpText(s, indent) {
	const pad = ' '.repeat(indent);
	const t = String(s).replace(/\r\n/g, '\n').trim();
	if (!t.includes('\n')) return JSON.stringify(t);
	return `|-\n${t
		.split('\n')
		.map((line) => `${pad}${line}`)
		.join('\n')}`;
}

function isResult(label) {
	return /result|podsum|resultado/i.test(label);
}

function dumpSections(sections, itemIndent) {
	const itemPad = ' '.repeat(itemIndent);
	const fieldPad = ' '.repeat(itemIndent + 2);
	return sections
		.map((section, idx) => {
			const lines = [
				`${itemPad}- label: ${JSON.stringify(section.label)}`,
				`${fieldPad}title: ${JSON.stringify(section.title)}`,
				`${fieldPad}text: ${dumpText(section.text, itemIndent + 4)}`,
			];
			if (!isResult(section.label)) {
				lines.push(`${fieldPad}afterGroup: ${idx + 1}`);
			}
			return lines.join('\n');
		})
		.join('\n');
}

function buildLocale(lang) {
	const sections = [];
	for (let i = 2; i <= 10; i++) {
		const label = get(`Section ${i}`, 'Label', lang);
		const title = get(`Section ${i}`, 'Title', lang);
		const text = get(`Section ${i}`, 'Description', lang);
		if (!label && !title && !text) continue;
		sections.push({ label, title, text });
	}

	return {
		title: get('Project', 'Project name', lang) || get('Hero', 'Hero Title', lang),
		client: get('Hero', 'Klient / Client / Cliente', lang),
		heroSubtitle: get('Hero', 'Hero Title', lang),
		service: get('Meta', 'Zakres / Services / Servicios', lang),
		industry: get('Meta', 'Branża / Industry / Industria', lang),
		market: get('Meta', 'Rynek / Market / Mercado', lang),
		year: get('Meta', 'Rok / Year / Año', lang),
		overviewLabel: get('Section 1', 'Label', lang),
		overviewTitle: get('Section 1', 'Title', lang),
		overviewText: get('Section 1', 'Description', lang),
		sections,
	};
}

const en = buildLocale('en');
const pl = buildLocale('pl');
const es = buildLocale('es');
const year = Number.parseInt(en.year, 10) || 2026;

const md = `---
title: ${JSON.stringify(en.title)}
client: ${JSON.stringify(en.client)}
tags: ['UX/UI Design', 'SEO', 'Webflow']
thumbnail: '/portfolio/nrv-web/cover.opt.webp'
folderName: 'nrv-web'
order: 8
heroImage: '/portfolio/nrv-web/bg.opt.webp'
heroSubtitle: ${JSON.stringify(en.heroSubtitle)}
overviewLabel: ${JSON.stringify(en.overviewLabel)}
overviewTitle: ${JSON.stringify(en.overviewTitle)}
overviewText: ${dumpText(en.overviewText, 2)}
service: ${JSON.stringify(en.service)}
industry: ${JSON.stringify(en.industry)}
market: ${JSON.stringify(en.market)}
year: ${year}
sections:
${dumpSections(en.sections, 2)}
i18n:
  pl:
    title: ${JSON.stringify(pl.title)}
    client: ${JSON.stringify(pl.client)}
    heroSubtitle: ${JSON.stringify(pl.heroSubtitle)}
    service: ${JSON.stringify(pl.service)}
    industry: ${JSON.stringify(pl.industry)}
    market: ${JSON.stringify(pl.market)}
    overviewLabel: ${JSON.stringify(pl.overviewLabel)}
    overviewTitle: ${JSON.stringify(pl.overviewTitle)}
    overviewText: ${dumpText(pl.overviewText, 6)}
    sections:
${dumpSections(pl.sections, 6)}
  es:
    title: ${JSON.stringify(es.title)}
    client: ${JSON.stringify(es.client)}
    heroSubtitle: ${JSON.stringify(es.heroSubtitle)}
    service: ${JSON.stringify(es.service)}
    industry: ${JSON.stringify(es.industry)}
    market: ${JSON.stringify(es.market)}
    overviewLabel: ${JSON.stringify(es.overviewLabel)}
    overviewTitle: ${JSON.stringify(es.overviewTitle)}
    overviewText: ${dumpText(es.overviewText, 6)}
    sections:
${dumpSections(es.sections, 6)}
---
`;

writeFileSync('src/content/projects/nrv.md', md, 'utf8');
console.log('OK', en.heroSubtitle);
console.log('sections:', en.sections.map((s) => s.label).join(' -> '));
console.log('year', year, 'client', en.client);
console.log('overview length', en.overviewText.length, pl.overviewText.length, es.overviewText.length);

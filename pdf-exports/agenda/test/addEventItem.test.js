import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addText from '../lib/addText.js';
import addEventItem from '../lib/addEventItem/index.js';
import getIntl from '../../utils/intl.js';

import expoNature from './fixtures/expoNature.event.json' with { type: 'json' };
import agenda from './fixtures/mel.agenda.json' with { type: 'json' };

const { PDF_TEST_FOLDER: pdfTestFolder = '/tmp', LANG: lang = 'fr' } = process.env;

async function addTestCaseTitle(doc, cursor, message) {
  await addText(doc, cursor, message, { fontSize: 16 });
  cursor.y += 30;
}

const cursor = { x: 20, y: 20 };

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const writeStream = fs.createWriteStream(
  `${pdfTestFolder}/pdfTestEventItem.pdf`,
);
doc.pipe(writeStream);

const options = {
  lang,
  includeEventImages: true,
  intl: getIntl(lang),
};

await addTestCaseTitle(
  doc,
  cursor,
  'Option includeEventImages: true (default)',
);
await addEventItem(agenda, expoNature, doc, cursor, options);

cursor.y += 120;

await addTestCaseTitle(doc, cursor, 'Option includeEventImages: false');
await addEventItem(agenda, expoNature, doc, cursor, {
  ...options,
  includeEventImages: false,
});

doc.end();

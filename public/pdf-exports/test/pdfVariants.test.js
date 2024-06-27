import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addText from '../lib/addText.js';
import addEventItem from '../lib/addEventItem/index.js';
import addDocumentHeader from '../lib/addDocumentHeader.js';
import getIntl from '../lib/intl.js';

import expoNature from './fixtures/expoNature.event.json' assert { type: 'json' };
import agenda from './fixtures/mel.agenda.json' assert { type: 'json' };

const { PDF_TEST_FOLDER: pdfTestFolder = '/tmp', LANG: lang = 'fr' } = process.env;

async function addTestCaseTitle(doc, cursor, message) {
  await addText(doc, cursor, message, { fontSize: 16 });
  cursor.y += 30;
}
const cursor = { x: 20, y: 20 };

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const writeStream = fs.createWriteStream(`${pdfTestFolder}/pdfVariants.pdf`);
doc.pipe(writeStream);

const options = {
  lang,
  includeEventImages: true,
  intl: getIntl(lang),
};

await addTestCaseTitle(doc, cursor, 'Default mode');
await addEventItem(agenda, expoNature, doc, cursor, options);

cursor.y += 180;

await addTestCaseTitle(doc, cursor, 'Highlighting of the city');
await addEventItem(agenda, expoNature, doc, cursor, {
  ...options,
  mode: 'city',
});

cursor.y += 180;

await addTestCaseTitle(doc, cursor, 'Highlighting of the location name');
const { height: documentHeaderHeight } = await addDocumentHeader(
  agenda,
  expoNature,
  doc,
  cursor,
  {
    mode: 'locationName',
  },
);
cursor.y += documentHeaderHeight + 20;
await addEventItem(agenda, expoNature, doc, cursor, {
  ...options,
  mode: 'locationName',
});

doc.end();

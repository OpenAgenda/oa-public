import * as url from 'node:url';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import Cursor from '../lib/Cursor.js';
import addText from '../lib/addText.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const doc = new PDFDocument({
  size: 'A4',
  margin: 0,
});

doc.pipe(fs.createWriteStream(`${__dirname}/renders/addText.pdf`));

const initPosition = { x: 10, y: 10 };
const firstColWidth = 120;

const cursor = Cursor(initPosition);

cursor.moveY(
  addText(doc, cursor, {
    value: 'Steampunk elephant',
    availableWidth: firstColWidth,
  }).height,
);

cursor.moveY(
  addText(doc, cursor, {
    value: 'This is a bold dancing guy emoji: 🕺, here is a bold smiley: 😃',
    bold: true,
    availableWidth: firstColWidth,
  }).height,
);

cursor.moveY(
  addText(doc, cursor, {
    value: 'aVeryLongWordThatMustBe',
    availableWidth: firstColWidth,
  }).height,
);

cursor.moveY(
  addText(doc, cursor, {
    value: 'This is a dancing guy emoji: 🕺, here is a smiley: 😃',
    availableWidth: firstColWidth,
  }).height,
);

cursor.moveX(
  addText(doc, cursor, {
    value: 'This is a bit of text',
  }).width,
);

cursor.moveY(
  addText(doc, cursor, {
    value: ' followed by a bit more.',
  }).height,
);

cursor.setX(0);

cursor.moveY(
  addText(doc, cursor, {
    value: 'Letters pdfkit handles badly: É',
  }).height,
);

addText(doc, cursor, {
  value: fs.readFileSync(`${__dirname}/fixtures/intrepides.txt`, 'utf8'),
  availableWidth: firstColWidth,
  segmentable: true,
});

doc.addPage();

cursor.reset();

// this should display text. Otherwise there is a line height eval mismatch
addText(doc, cursor, {
  value: fs.readFileSync(`${__dirname}/fixtures/fantaisie.txt`, 'utf8'),
  availableWidth: 357.29999999999995,
  availableHeight: 15.7,
  segmentable: true,
  paragraphAvailableWidth: 357.29999999999995,
  underline: false,
});

doc.end();

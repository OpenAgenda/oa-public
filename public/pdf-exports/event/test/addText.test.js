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

const cursor = Cursor({ x: 10, y: 10 });
const availableWidth = 120;

cursor.moveY(
  addText(doc, cursor, {
    value: 'Steampunk elephant',
    availableWidth,
  }).height,
);

cursor.moveY(
  addText(doc, cursor, {
    value: 'This is a bold dancing guy emoji: 🕺, here is a bold smiley: 😃',
    bold: true,
    availableWidth,
  }).height,
);

cursor.moveY(
  addText(doc, cursor, {
    value: 'aVeryLongWordThatMustBe',
    availableWidth,
  }).height,
);

cursor.moveY(
  addText(doc, cursor, {
    value: 'This is a dancing guy emoji: 🕺, here is a smiley: 😃',
    availableWidth,
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

cursor.moveY(
  addText(doc, cursor, {
    value: fs.readFileSync(`${__dirname}/fixtures/intrepides.txt`, 'utf8'),
    availableWidth,
    segmentable: true,
  }).height,
);

doc.end();

import * as url from 'node:url';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import Cursor from '../lib/Cursor.js';
import addText from '../lib/addText.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const doc = new PDFDocument({ size: 'A4', margin: 0 });

doc.pipe(fs.createWriteStream(`${__dirname}/renders/addText.pdf`));

const cursor = Cursor({ x: 10, y: 10 });

cursor.moveY(
  addText(doc, cursor, {
    value: 'This is a dancing guy emoji: 🕺, here is a smiley: 😃',
  }).height,
);

cursor.moveY(
  addText(doc, cursor, {
    value: 'This is a dancing guy emoji: 🕺, here is a smiley: 😃',
    bold: true,
  }).height,
);

doc.end();

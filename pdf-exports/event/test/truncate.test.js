import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addText from '../lib/addText.js';
import truncate from '../lib/truncate.js';
import data from './fixtures/data.json' assert { type: 'json' };

const pdfTestFolder = process.env.PDF_TEST_FOLDER;

function addRectangle(doc, cursor, width, height, color) {
  doc.fillColor(color).rect(cursor.x, cursor.y, width, height).fill();
}

const cursor = { x: 0, y: 0 };

const doc = new PDFDocument({ size: 'A4', margin: 0 });

const writeStream = fs.createWriteStream(
  `${pdfTestFolder}/truncate.pdf`,
);

doc.pipe(writeStream);

const lang = "fr";
const fontSize = 10;

const contentItem = {
  addFn: "addText",
  data: data.text,
  trucable: true,
};

const rectWidth = 200;
const rectHeight = 100

addRectangle(doc, cursor, rectWidth, rectHeight, 'yellow');

const [beforeOverflow] = truncate(doc, cursor, addText, contentItem, rectHeight, { columnWidth: rectWidth, lang, fontSize });

addText(doc, cursor, {
  content: beforeOverflow.data,
  width: rectWidth,
  fontSize,
});

doc.end();

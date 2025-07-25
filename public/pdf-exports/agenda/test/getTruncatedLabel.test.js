import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addText from '../lib/addText.js';
import getTruncatedLabel from '../lib/getTruncatedLabel.js';
import sentences from './fixtures/sentences.json' with { type: 'json' };

const pdfTestFolder = process.env.PDF_TEST_FOLDER;

function addRectangle(doc, cursor, width, height, color) {
  doc.fillColor(color).rect(cursor.x, cursor.y, width, height).fill();
}

(async () => {
  const cursor = { x: 0, y: 0 };

  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  const writeStream = fs.createWriteStream(
    `${pdfTestFolder}/getTruncatedLabel.pdf`,
  );

  doc.pipe(writeStream);

  const rectWidth = 200;

  addRectangle(doc, cursor, rectWidth, 100, 'yellow');

  for (const sentence of sentences) {
    const truncatedLabel = getTruncatedLabel(doc, cursor, rectWidth, sentence);

    addText(doc, cursor, truncatedLabel.label, {
      fontSize: 10,
      underline: false,
    });

    cursor.y += 20;
  }
  doc.end();
})();

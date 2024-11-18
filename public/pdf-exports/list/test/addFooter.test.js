import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import cursorYOverflowing from '../../utils/cursorYOverflowing.js';
import addFooter from '../lib/addFooter.js';
import addText from '../lib/addText.js';
import texts from './fixtures/texts.json' assert { type: 'json' };

const pdfTestFolder = process.env.PDF_TEST_FOLDER;
const cursor = { x: 0, y: 0 };
const margin = 20;

(async () => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const writeStream = fs.createWriteStream(
    `${pdfTestFolder}/pdfTestAddFooter.pdf`,
  );
  doc.pipe(writeStream);

  let pageNumber = 1;
  let simulateFooterHeight = null;

  const simulateFooter = addFooter(doc, `Page ${pageNumber}`, margin, {
    simulate: true,
  });
  simulateFooterHeight = simulateFooter.height;

  addFooter(doc, `Page ${pageNumber}`, margin);

  let currentPageNumber = 0;

  for (const text of texts) {
    if (pageNumber !== currentPageNumber) {
      currentPageNumber = pageNumber;
      addFooter(doc, `Page ${pageNumber}`, margin);
    }
    const { height: simulatedHeight } = addText(doc, cursor, text, {
      width: 150,
      simulate: true,
    });

    if (
      cursorYOverflowing(doc, cursor.y + simulatedHeight + simulateFooterHeight)
    ) {
      doc.addPage();
      pageNumber += 1;
      addFooter(doc, `Page ${pageNumber}`, margin);
      cursor.y = margin;
    }

    const { height } = addText(doc, cursor, text, { width: 150 });
    cursor.y += height;
  }

  doc.end();
})();

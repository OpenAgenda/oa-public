import PDFDocument from 'pdfkit';
import addDocumentHeader from './addDocumentHeader.js';
import addPageHeader from './addPageHeader.js';
import addEventItem from './addEventItem.js';
import cursorYOverflowing from './cursorYOverflowing.js';
import addFooter from './addFooter.js';

export default async function GenerateExportStream(
  config,
  eventStream,
  writeStream,
  options = {},
) {
  const { agenda, lang } = options;

  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  const margin = 20;
  const cursor = { x: 0, y: 0 };

  let pageNumber = 1;
  let simulateFooterHeight = null;

  cursor.x += margin;

  const { height: documentHeaderHeight } = await addDocumentHeader(
    agenda,
    doc,
    cursor,
  );
  cursor.y += documentHeaderHeight + margin;

  const simulateFooter = addFooter(doc, `Page ${pageNumber}`, margin, {
    simulate: true,
  });
  simulateFooterHeight = simulateFooter.height;

  addFooter(doc, `Page ${pageNumber}`, margin);

  eventStream.on('end', () => doc.end());

  doc.pipe(writeStream);

  for await (const event of eventStream) {
    const { height: simulatedHeight } = await addEventItem(
      agenda,
      event,
      doc,
      cursor,
      { simulate: true, lang },
    );

    if (
      cursorYOverflowing(doc, cursor.y + simulatedHeight + simulateFooterHeight)
    ) {
      doc.addPage();
      cursor.y = margin / 6;
      const { height: pageHeaderHeight } = await addPageHeader(
        agenda,
        doc,
        cursor,
      );
      cursor.y += pageHeaderHeight + margin;
      pageNumber += 1;
      addFooter(doc, `Page ${pageNumber}`, margin);
    }

    const { height: eventItemHeight } = await addEventItem(
      agenda,
      event,
      doc,
      cursor,
      { lang },
    );

    cursor.y += eventItemHeight;
  }
}

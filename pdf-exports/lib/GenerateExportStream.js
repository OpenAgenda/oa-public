import PDFDocument from 'pdfkit';
import addDocumentHeader from './addDocumentHeader.js';
import addPageHeader from './addPageHeader.js';
import addEventItem from './addEventItem.js';
import cursorYOverflowing from './cursorYOverflowing.js';
import addFooter from './addFooter.js';
import getIntl from './intl.js';

export default async function GenerateExportStream(
  config,
  eventStream,
  writeStream,
  options = {},
) {
  const {
    agenda,
    lang = 'fr',
    includeEventImages = true,
    little,
    medium,
  } = options;

  const intl = getIntl(lang);

  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  const margin = 20;
  const cursor = { x: 0, y: 0 };

  let pageNumber = 1;
  let simulateFooterHeight = null;
  let fontSize;

  if (little) {
    fontSize = 8;
  } else if (medium) {
    fontSize = 9;
  } else {
    fontSize = 10;
  }

  cursor.x += margin;

  const { height: documentHeaderHeight } = await addDocumentHeader(
    agenda,
    doc,
    cursor,
    {
      little,
      medium,
    },
  );
  cursor.y += documentHeaderHeight + margin;

  const simulateFooter = addFooter(doc, `Page ${pageNumber}`, margin, {
    simulate: true,
    fontSize,
  });
  simulateFooterHeight = simulateFooter.height;

  eventStream.on('end', () => doc.end());

  doc.pipe(writeStream);

  let currentPageNumber = 0;

  for await (const event of eventStream) {
    if (pageNumber !== currentPageNumber) {
      currentPageNumber = pageNumber;
      addFooter(doc, `Page ${pageNumber}`, margin, { fontSize });
    }

    const { height: simulatedHeight } = await addEventItem(
      agenda,
      event,
      doc,
      cursor,
      { simulate: true, intl, lang, includeEventImages, little, medium },
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
        {
          little,
          medium,
        },
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
      { intl, lang, includeEventImages, little, medium },
    );

    cursor.y += eventItemHeight;
  }
}

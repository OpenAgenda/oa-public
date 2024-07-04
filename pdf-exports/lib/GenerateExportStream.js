import PDFDocument from 'pdfkit';
import addDocumentHeader from './addDocumentHeader.js';
import addPageHeader from './addPageHeader.js';
import addEventItem from './addEventItem/index.js';
import cursorYOverflowing from './cursorYOverflowing.js';
import addFooter from './addFooter.js';
import getIntl from './intl.js';
import messages from './messages.js';

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
    mode,
  } = options;

  const intl = getIntl(lang);

  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  const margin = 20;
  const cursor = { x: 0, y: 0 };

  let pageNumber = 1;
  let simulateFooterHeight = null;
  let fontSize;
  let eventStreamHasBeenClosed = false;

  if (little) {
    fontSize = 8;
  } else if (medium) {
    fontSize = 9;
  } else {
    fontSize = 10;
  }

  cursor.x += margin;

  const simulateFooter = addFooter(
    doc,
    `${intl.formatMessage(messages.page)} ${pageNumber}`,
    margin,
    {
      simulate: true,
      fontSize,
    },
  );

  simulateFooterHeight = simulateFooter.height;

  eventStream.on('end', () => {
    eventStreamHasBeenClosed = true;
  });

  doc.pipe(writeStream);

  let currentPageNumber = 0;
  let isFirstPage = true;

  for await (const event of eventStream) {
    if (pageNumber !== currentPageNumber) {
      currentPageNumber = pageNumber;

      if (isFirstPage) {
        const { height: documentHeaderHeight } = await addDocumentHeader(
          agenda,
          event,
          doc,
          cursor,
          {
            little,
            medium,
            mode,
          },
        );
        cursor.y += documentHeaderHeight + margin;
        isFirstPage = false;
      }
      addFooter(
        doc,
        `${intl.formatMessage(messages.page)} ${pageNumber}`,
        margin,
        { fontSize },
      );
    }

    const { height: simulatedHeight } = await addEventItem(
      agenda,
      event,
      doc,
      cursor,
      { simulate: true, intl, lang, includeEventImages, little, medium, mode },
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
      addFooter(
        doc,
        `${intl.formatMessage(messages.page)} ${pageNumber}`,
        margin,
      );
    }

    const { height: eventItemHeight } = await addEventItem(
      agenda,
      event,
      doc,
      cursor,
      { intl, lang, includeEventImages, little, medium, mode },
    );

    if (eventStreamHasBeenClosed) {
      doc.end();
    }

    cursor.y += eventItemHeight;
  }
}

import { getLocaleValue } from '@openagenda/intl';
import PDFDocument from 'pdfkit';
import getIntl from '../../utils/intl.js';
import addFooter from './addFooter.js';
import addPageHeader from './addPageHeader.js';
import addPageColumns from './addPageColumns.js';
import messages from './messages.js';

export default async function GenerateExport(writeStream, options = {}) {
  const { agenda, event, lang = 'fr' } = options;

  const intl = getIntl(lang);

  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  const pageWidth = doc.page.width;
  const margin = 20;
  const cursor = { x: 0, y: 0 };
  const iconHeightAndWidth = 10;
  let pageNumber = 1;
  let isFirstPage = true;

  doc.pipe(writeStream);
  const pdfRender = () => ({
    columns: [
      {
        width: 3,
        content: [
          {
            addFn: 'addText',
            data: getLocaleValue(event.title, lang),
            truncable: true,
            bold: true,
          },
          {
            addFn: 'addText',
            data: getLocaleValue(event.description, lang),
            truncable: true,
          },
          {
            addFn: 'imagePositioning',
            data: event.image,
          },
          {
            addFn: 'addMarkdownDescription',
            data: getLocaleValue(event.longDescription, lang),
            truncable: true,
          },
          {
            addFn: 'addCalendar',
            data: event.timings,
            columnNumber: 2,
            truncable: true,
          },
        ],
      },
      {
        width: 2,
        content: [
          {
            addFn: 'addText',
            data: getLocaleValue(event.dateRange, lang),
            bold: true,
            truncable: true,
          },
          {
            addFn: 'addStatus',
            data: event.status,
            agenda,
            truncable: true,
            title: 'status',
          },
          {
            addFn: 'addText',
            data: getLocaleValue(event.conditions, lang),
            truncable: true,
            title: 'conditions',
          },
          {
            addFn: 'addRegistration',
            data: { registration: event.registration },
            truncable: true,
          },
          {
            addFn: 'addAdditionalFields',
            data: { event },
            agenda,
            truncable: true,
          },
          {
            addFn: 'addLocation',
            data: { event },
            truncable: true,
          },
        ],
      },
    ],
  });

  const columnConfig = pdfRender(event);
  let columnsWithContent = columnConfig.columns;

  const addedFooter = addFooter(
    doc,
    `${intl.formatMessage(messages.page)} ${pageNumber}`,
    margin,
  );

  do {
    const { height: pageHeaderHeight } = await addPageHeader(
      agenda,
      event,
      doc,
      cursor,
      { margin, isFirstPage, lang },
    );
    isFirstPage = false;

    cursor.y += pageHeaderHeight + margin;

    columnsWithContent = await addPageColumns(
      { doc, cursor },
      { columns: columnsWithContent },
      {
        pageWidth,
        iconHeightAndWidth,
        margin,
        footerHeight: addedFooter.height,
        intl,
        lang,
      },
    );

    if (columnsWithContent.some((column) => column.content.length > 0)) {
      doc.addPage();
      pageNumber += 1;

      cursor.x = 0;
      cursor.y = 0;

      addFooter(
        doc,
        `${intl.formatMessage(messages.page)} ${pageNumber}`,
        margin,
      );
    }
  } while (columnsWithContent.some((column) => column.content.length > 0));

  doc.end();
}

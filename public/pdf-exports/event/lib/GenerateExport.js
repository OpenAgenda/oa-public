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

  let columnsWithContent = [
    {
      width: 3,
      content: [
        {
          id: 'title',
          addFn: 'addText',
          data: getLocaleValue(event.title, lang),
          truncable: true,
          bold: true,
        },
        {
          id: 'description',
          addFn: 'addText',
          data: getLocaleValue(event.description, lang),
          truncable: true,
        },
        {
          id: 'image',
          addFn: 'imagePositioning',
          data: event.image,
        },
        {
          id: 'longDescription',
          addFn: 'addMarkdownDescription',
          data: getLocaleValue(event.longDescription, lang),
          truncable: true,
        },
        {
          id: 'timings',
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
          id: 'dateRange',
          addFn: 'addText',
          data: getLocaleValue(event.dateRange, lang),
          bold: true,
          truncable: true,
        },
        {
          id: 'status',
          addFn: 'addStatus',
          data: event.status,
          agenda,
          truncable: true,
          title: 'status',
        },
        {
          id: 'conditions',
          addFn: 'addText',
          data: getLocaleValue(event.conditions, lang),
          truncable: true,
          title: 'conditions',
        },
        {
          id: 'registration',
          addFn: 'addRegistration',
          data: { registration: event.registration },
          truncable: true,
        },
        {
          id: 'additionalFields',
          addFn: 'addAdditionalFields',
          data: { event },
          agenda,
          truncable: true,
        },
        {
          id: 'addLocationSection',
          addFn: 'addLocationSection',
          data: event.location,
          title:
            event.location.name || event.location.address ? 'location' : null,
        },
        {
          id: 'onlineAccessLink',
          addFn: 'addText',
          data: event.onlineAccessLink,
          title: event.onlineAccessLink ? 'online' : null,
        },
        {
          id: 'locationDescription',
          addFn: 'addText',
          data: getLocaleValue(event.location.description, lang),
          truncable: true,
          title: event.location.description ? 'aboutLocation' : null,
        },
        {
          id: 'locationTags',
          addFn: 'addTagsSection',
          data: event.location.tags,
          truncable: true,
          title: event.location.tags ? 'tags' : null,
        },
        {
          id: 'locationAccess',
          addFn: 'addText',
          data: getLocaleValue(event.location.access, lang),
          title: event.location.access ? 'access' : null,
        },
        {
          id: 'locationImage',
          addFn: 'imagePositioning',
          data: event.location.image,
        },
        {
          id: 'locationContact',
          addFn: 'addContactSection',
          data: event.location,
        },
        {
          id: 'locationAdditionalLinks',
          addFn: 'addAdditionalLinksSection',
          data: event.location.links,
          truncable: true,
          title: event.location.links ? 'additionalLinks' : null,
        },
      ].filter(({ data }) => ![undefined, null].includes(data)),
    },
  ];

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

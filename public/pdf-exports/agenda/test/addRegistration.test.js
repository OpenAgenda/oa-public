import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import getIntl from '../../utils/intl.js';
import addRegistration from '../lib/addRegistration.js';
import loadEventData from './lib/loadEventData.js';

const {
  AGENDA_UID: agendaUid,
  API_KEY: APIKey,
  PDF_TEST_FOLDER: pdfTestFolder,
} = process.env;

(async (params = {}, options = {}) => {
  const cursor = { x: 130, y: 0 };

  const {
    base = {
      margin: 20,
      color: '#413a42',
      fontSize: 10,
    },
  } = params;

  const { simulate = false, lang = 'fr', little, medium } = options;

  const intl = getIntl(lang);

  let iconHeightAndWidth;
  let fontSize;
  let margin;

  if (little) {
    fontSize = 8;
    iconHeightAndWidth = 8;
    margin = base.margin / 5;
  } else if (medium) {
    fontSize = 9;
    iconHeightAndWidth = 9;
    margin = base.margin / 4;
  } else {
    fontSize = 10;
    iconHeightAndWidth = 10;
    margin = base.margin / 3;
  }

  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  const writeStream = fs.createWriteStream(
    `${pdfTestFolder}/pdfTestRegistration.pdf`,
  );

  doc.pipe(writeStream);

  const eventData = (await loadEventData(agendaUid, APIKey)).events;

  for (const event of eventData) {
    addRegistration(
      doc,
      event,
      cursor,
      {
        base,
        iconHeightAndWidth,
        fontSize,
        margin,
      },
      {
        simulate,
        intl,
      },
    );
    cursor.y += base.margin * 2;
  }

  doc.end();
})();

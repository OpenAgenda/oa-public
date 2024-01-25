import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addRegistration from '../lib/addRegistration.js';
import loadEventData from './lib/loadEventData.js';

const {
  AGENDA_UID: agendaUid,
  PUBLIC_KEY: publicKey,
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

  const { simulate = false } = options;

  const iconHeightAndWidth = 10;
  const imageWidth = 90;

  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  const writeStream = fs.createWriteStream(
    `${pdfTestFolder}/pdfTestRegistration.pdf`,
  );

  doc.pipe(writeStream);

  const eventData = (await loadEventData(agendaUid, publicKey)).events;

  for (const event of eventData) {
    addRegistration(
      doc,
      event,
      cursor,
      {
        base,
        iconHeightAndWidth,
        imageWidth,
      },
      { simulate },
    );
    cursor.y += base.margin * 2;
  }

  doc.end();
})();

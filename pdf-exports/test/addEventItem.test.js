import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addEventItem from '../lib/addEventItem.js';
import cursorYOverflowing from '../lib/cursorYOverflowing.js';
import getIntl from '../lib/intl.js';
import loadAgendaData from './lib/loadAgendaData.js';
import loadEventData from './lib/loadEventData.js';
import lorem from './fixtures/lorem.json' assert { type: 'json' };

const {
  AGENDA_UID: agendaUid,
  API_KEY: APIKey,
  PDF_TEST_FOLDER: pdfTestFolder,
} = process.env;

const cursor = { x: 0, y: 0 };
const margin = 20;

cursor.x += margin;
cursor.y += margin;

(async (options = {}) => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const writeStream = fs.createWriteStream(
    `${pdfTestFolder}/pdfTestEventItem.pdf`,
  );
  doc.pipe(writeStream);

  const agenda = await loadAgendaData(agendaUid, APIKey);
  const eventData = (await loadEventData(agendaUid, APIKey)).events.map(e => ({
    ...e,
    description: {
      fr: e.description.fr + lorem[Math.floor(Math.random() * lorem.length)],
    },
  }));

  const { lang = 'fr', includeEventImages = true, little, medium } = options;
  const intl = getIntl(lang);

  const simulateFooterHeight = null;

  for (const event of eventData) {
    const { height: simulatedHeight } = await addEventItem(
      agenda,
      event,
      doc,
      cursor,
      {
        simulate: true,
        intl,
        lang,
        includeEventImages,
        little,
        medium,
      },
    );

    if (
      cursorYOverflowing(doc, cursor.y + simulatedHeight + simulateFooterHeight)
    ) {
      doc.addPage();
      cursor.y = margin;
    }

    const { height } = await addEventItem(agenda, event, doc, cursor, {
      intl,
      lang,
      includeEventImages,
      little,
      medium,
    });
    cursor.y += height;
  }
  doc.end();
})();

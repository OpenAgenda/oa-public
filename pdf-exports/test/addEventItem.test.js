import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addEventItem from '../lib/addEventItem.js';
import cursorYOverflowing from '../lib/cursorYOverflowing.js';
import loadAgendaData from './lib/loadAgendaData.js';
import loadEventData from './lib/loadEventData.js';
import lorem from './fixtures/lorem.json' assert { type: 'json' };

const {
  AGENDA_UID: agendaUid,
  PUBLIC_KEY: publicKey,
  PDF_TEST_FOLDER: pdfTestFolder,
} = process.env;

const cursor = { x: 0, y: 0 };
const margin = 20;
const lang = 'fr';

cursor.x += margin;
cursor.y += margin;

(async () => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const writeStream = fs.createWriteStream(
    `${pdfTestFolder}/pdfTestEventItem.pdf`,
  );
  doc.pipe(writeStream);

  const agenda = await loadAgendaData(agendaUid, publicKey);
  const eventData = (await loadEventData(agendaUid, publicKey)).events.map(
    e => ({
      ...e,
      description: {
        fr: e.description.fr + lorem[Math.floor(Math.random() * lorem.length)],
      },
    }),
  );

  const simulateFooterHeight = null;

  for (const event of eventData) {
    const { height: simulatedHeight } = await addEventItem(
      agenda,
      event,
      lang,
      doc,
      cursor,
      { simulate: true },
    );

    if (
      cursorYOverflowing(doc, cursor.y + simulatedHeight + simulateFooterHeight)
    ) {
      doc.addPage();
      cursor.y = margin;
    }

    const { height } = await addEventItem(agenda, event, lang, doc, cursor);
    cursor.y += height;
  }

  doc.end();
})();

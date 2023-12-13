import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addRegistration from '../lib/addRegistration.js';
// import loadEventData from './lib/loadEventData.js';
import eventData from './fixtures/registrationItem/events.json' assert { type: 'json' };

const {

  PDF_TEST_FOLDER: pdfTestFolder,
} = process.env;

const lang = 'fr';

const cursor = { x: 0, y: 0 };
const localCursor = {
  y: cursor.y,
  x: cursor.x,
};

let widthOfRegistration = null;
let heightOfRegistration = null;

const imageWidth = 90;

const iconHeightAndWidth = 10;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const emailIconPath = `${__dirname}/../images/email.png`;
const phoneIconPath = `${__dirname}/../images/phone.png`;
const linkIconPath = `${__dirname}/../images/link.png`;

(async (options = {}) => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const writeStream = fs.createWriteStream(
    `${pdfTestFolder}/pdfTestRegistrationItem.pdf`,
  );

  const {
    base = {
      margin: 20,
      color: '#413a42',
      fontSize: 10,
    },
    simulate = false,
  } = options;

  const textMaxWidth = doc.page.width - imageWidth - base.margin * 3;

  doc.pipe(writeStream);

  // const eventData = (await loadEventData(agendaUid, publicKey)).events.map(
  //   e => ({
  //     ...e,
  //     description: {
  //       fr: e.description.fr + lorem[Math.floor(Math.random() * lorem.length)],
  //     },
  //   }),
  // );

  for (const event of eventData) {
    const registration = await addRegistration(
      event,
      doc,
      localCursor,
      {
        base,
        iconHeightAndWidth,
        emailIconPath,
        phoneIconPath,
        linkIconPath,
        textMaxWidth,
        imageWidth,
      },
      { simulate, lang },
    );

    widthOfRegistration = Math.min(registration.width, textMaxWidth);
    heightOfRegistration = registration.height;

    localCursor.y += heightOfRegistration + base.margin / 10;
  }

  doc.end();
})();

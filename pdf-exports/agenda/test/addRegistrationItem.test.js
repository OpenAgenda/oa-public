import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addRegistration from '../lib/addRegistration.js';
import getIntl from '../../utils/intl.js';
import eventData from './fixtures/registrationItem/events.json' assert { type: 'json' };

const { PDF_TEST_FOLDER: pdfTestFolder } = process.env;

const cursor = { x: 0, y: 0 };
const localCursor = {
  y: cursor.y,
  x: cursor.x,
};

let heightOfRegistration = null;

const imageWidth = 90;

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
    lang = 'fr',
    little,
    medium,
  } = options;

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

  doc.pipe(writeStream);

  localCursor.x += imageWidth + base.margin * 2;

  for (const event of eventData) {
    const registration = addRegistration(
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

    heightOfRegistration = registration.height;

    localCursor.y += heightOfRegistration + base.margin / 10;
  }

  doc.end();
})();

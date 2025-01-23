import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import thumbnail from '../lib/thumbnail.js';

const { PDF_TEST_FOLDER: pdfTestFolder } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eventImage = {
  image: {
    filename: 'event_passages-de-memoire-la-rue-de-lannoy_737925.jpg',
    variants: [
      {
        filename: 'evfevent_passages-de-memoire-la-rue-de-lannoy_737925.jpg',
        type: 'full',
      },
      {
        filename: 'evtbevent_passages-de-memoire-la-rue-de-lannoy_737925.jpg',
        type: 'thumbnail',
      },
    ],
    base: 'https://cdn.openagenda.com/main/',
  },
};

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const writeStream = fs.createWriteStream(
  `${pdfTestFolder}/pdfThumbnailTest.pdf`,
);
doc.pipe(writeStream);

const imageWidth = 90;
const imageHeight = 90;

const imageOptions = {
  cover: [imageWidth, imageHeight],
  align: 'center',
  valign: 'center',
};
const oaLogoPath = `${__dirname}/../../images/oaLogo.png`;
const imageUrl = await thumbnail(eventImage, { default: oaLogoPath });
try {
  doc.image(imageUrl, 0, 0, imageOptions);
} catch (e) {
  doc.image(oaLogoPath, 0, 0, imageOptions);
}
doc.end();

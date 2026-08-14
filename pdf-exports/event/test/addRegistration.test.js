import * as url from 'node:url';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import Cursor from '../lib/Cursor.js';
import addRegistration from '../lib/addRegistration.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const doc = new PDFDocument({ size: 'A4', margin: 0 });

doc.pipe(fs.createWriteStream(`${__dirname}/renders/addRegistration.pdf`));

const cursor = Cursor({ x: 10, y: 10 });
const availableWidth = 200;

// Test with registration data
cursor.moveY(
  (
    await addRegistration(doc, cursor, {
      value: [
        {
          type: 'link',
          value: 'https://www.musee-lam.fr/fr/oiseaux-de-nuit',
        },
      ],
      availableWidth,
    })
  ).height,
);

cursor.moveY(10); // Add some spacing

// Test with multiple registration types
const multipleRegistrations = [
  { type: 'link', value: 'https://www.musee-lam.fr/fr/oiseaux-de-nuit' },
  { type: 'email', value: 'contact@musee-lam.fr' },
  { type: 'phone', value: '03 20 19 68 68' },
];

cursor.moveY(
  (
    await addRegistration(doc, cursor, {
      value: multipleRegistrations,
      availableWidth: availableWidth * 2,
    })
  ).height,
);

cursor.moveY(10); // Add some spacing

// Test with empty registration array
cursor.moveY(
  (
    await addRegistration(doc, cursor, {
      value: [],
      availableWidth,
    })
  ).height,
);

cursor.moveY(10); // Add some spacing

// Test with limited available height
cursor.moveY(
  (
    await addRegistration(doc, cursor, {
      value: [
        {
          type: 'link',
          value: 'https://www.musee-lam.fr/fr/oiseaux-de-nuit',
        },
      ],
      availableWidth,
      availableHeight: 5, // Very small height to test overflow
    })
  ).height,
);

doc.end();

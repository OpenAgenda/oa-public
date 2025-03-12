import fs from 'node:fs';
import PDFExports from '../index.js';

// Import fixtures
import loiretAgenda from './fixtures/loiretAgenda.json' assert { type: 'json' };
import loiretEvent from './fixtures/loiretEvent.json' assert { type: 'json' };
import beglesAgenda from './fixtures/begles.agenda.json' assert { type: 'json' };
import beglesEvent from './fixtures/permanences.events.begles.agenda.json' assert { type: 'json' };

const { PDF_TEST_FOLDER: pdfTestFolder, TEST_LANG: testLang = 'fr' } = process.env;

// Create PDF exports instance
const pdfExports = PDFExports({});

// Define fixture pairs to test
const fixturePairs = [
  { name: 'loiret', agenda: loiretAgenda, event: loiretEvent },
  { name: 'begles', agenda: beglesAgenda, event: beglesEvent },
];

// Generate PDFs for each fixture pair
for (const { name, agenda, event } of fixturePairs) {
  const writeStream = fs.createWriteStream(
    `${pdfTestFolder}/${name}EventPage.pdf`,
  );
  await pdfExports.GenerateExport(writeStream, {
    agenda,
    event,
    lang: testLang,
  });
}

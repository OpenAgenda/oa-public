import fs from 'node:fs';
import PDFExports from '../index.js';

import agenda from './fixtures/loiretAgenda.json' assert { type: 'json' };
import event from './fixtures/loiretEvent.json' assert { type: 'json' };

const {
  PDF_TEST_FOLDER: pdfTestFolder,
  TEST_LANG: testLang = 'fr',
} = process.env;

const writeStream = fs.createWriteStream(`${pdfTestFolder}/eventPage.pdf`);

const pdfExports = PDFExports({});

await pdfExports.GenerateExportStream(writeStream, {
  agenda,
  event,
  lang: testLang,
});

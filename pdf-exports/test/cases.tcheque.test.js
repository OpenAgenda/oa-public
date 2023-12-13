import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import PDFExports from '../index.js';
import FixturesStream from './lib/fixturesStream.js';
import agenda from './fixtures/tcheque/agenda.json' assert { type: 'json' };

const pdfTestFolder = process.env.PDF_TEST_FOLDER;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eventStream = new FixturesStream(
  `${__dirname}/fixtures/tcheque/events.json`,
);
const writeStream = fs.createWriteStream(`${pdfTestFolder}/cases.tcheque.pdf`);

const pdfExports = PDFExports({});

await eventStream.load();
await pdfExports.GenerateExportStream(eventStream, writeStream, {
  agenda,
});

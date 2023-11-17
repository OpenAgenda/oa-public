import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import PDFExports from '../index.js';
import FixturesStream from './lib/fixturesStream.js';
import agenda from './fixtures/agenda.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eventStream = new FixturesStream(`${__dirname}/fixtures/event.json`);
const writeStream = fs.createWriteStream(
  `${__dirname}/../pdf-test/streamOutputTest.pdf`,
);

const pdfExports = PDFExports({});

await eventStream.load();
await pdfExports.GenerateExportStream(eventStream, writeStream, {
  agenda,
});

import fs from 'node:fs';
import PDFExports from '../index.js';

import APIEventsStream from './lib/APIEventsStream.js';
import agenda from './fixtures/agenda.json' assert { type: 'json' };

const {
  AGENDA_UID: agendaUID,
  API_KEY: APIKey,
  PDF_TEST_FOLDER: pdfTestFolder,
  MAX_FETCHED_EVENT_COUNT: maxFetchedEventCount,
} = process.env;

const eventStream = new APIEventsStream({
  agendaUID,
  APIKey,
  max: maxFetchedEventCount,
});

const writeStream = fs.createWriteStream(
  `${pdfTestFolder}/streamOutputTest.pdf`,
);

const pdfExports = PDFExports({});

await pdfExports.GenerateExportStream(eventStream, writeStream, {
  agenda,
  lang: 'fr',
});

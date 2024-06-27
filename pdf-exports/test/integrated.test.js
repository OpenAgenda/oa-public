import fs from 'node:fs';
import qs from 'qs';
import PDFExports from '../index.js';

import APIEventsStream from './lib/APIEventsStream.js';
import agenda from './fixtures/agenda.json' assert { type: 'json' };

const {
  AGENDA_UID: agendaUID,
  API_KEY: APIKey,
  PDF_TEST_FOLDER: pdfTestFolder,
  MAX_FETCHED_EVENT_COUNT: maxFetchedEventCount,
  TEST_QUERY: testQueryString,
  TEST_MODE: testMode,
  TEST_LANG: testLang = 'fr',
} = process.env;

const eventStream = new APIEventsStream({
  agendaUID,
  APIKey,
  max: maxFetchedEventCount,
  query: testQueryString ? qs.parse(testQueryString.replace(/\?/, '')) : {},
});

const writeStream = fs.createWriteStream(
  `${pdfTestFolder}/streamOutputTest.pdf`,
);

const pdfExports = PDFExports({});

await pdfExports.GenerateExportStream(eventStream, writeStream, {
  agenda,
  lang: testLang,
  mode: testMode,
});

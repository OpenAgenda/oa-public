import fs from 'node:fs';
import qs from 'qs';
import PDFExports from '../index.js';

import APIEventsStream from './lib/APIEventsStream.js';
import agenda from './fixtures/JNA.agenda.json' with { type: 'json' };

const {
  AGENDA_UID: agendaUID,
  API_KEY: APIKey,
  PDF_TEST_FOLDER: pdfTestFolder,
  MAX_FETCHED_EVENT_COUNT: maxFetchedEventCount,
  TEST_QUERY:
    testQueryString = '?sort[]=location.region.asc&sort[]=location.city.asc',
  TEST_LANG: lang = 'fr',
} = process.env;

const query = testQueryString
  ? qs.parse(testQueryString.replace(/\?/, ''))
  : {};

const eventStream = new APIEventsStream({
  agendaUID,
  APIKey,
  max: maxFetchedEventCount,
  query,
});

const writeStream = fs.createWriteStream(
  `${pdfTestFolder}/locationSection.pdf`,
);

const pdfExports = PDFExports({});

const logBundle = {
  agendaUID,
  params: query,
};

await pdfExports.GenerateExportStream(eventStream, writeStream, {
  agenda,
  lang,
  logBundle,
  sections: testQueryString
    .split('sort[]=')
    .filter((v) => v !== '?')
    .map((v) => v.replace(/&|\.asc/g, '')),
});

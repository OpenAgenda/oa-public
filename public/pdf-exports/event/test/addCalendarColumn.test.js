import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import { spreadTimings } from '@openagenda/date-utils';
import addCalendarColumn from '../lib/addCalendarColumn.js';
import addTestTitle from './utils/addTestTitle.js';

const { PDF_TEST_FOLDER: pdfTestFolder = '/tmp' } = process.env;

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const writeStream = fs.createWriteStream(
  `${pdfTestFolder}/addCalendarColumn.pdf`,
);
doc.pipe(writeStream);

const lang = 'fr';

const cursor = { x: 0, y: 0 };

const timings = [
  {
    begin: '2024-06-01T14:00:00+02:00',
    end: '2024-06-01T16:00:00+02:00',
  },
  {
    begin: '2024-06-02T14:00:00+02:00',
    end: '2024-06-02T16:00:00+02:00',
  },
  {
    begin: '2024-06-03T14:00:00+02:00',
    end: '2024-06-03T16:00:00+02:00',
  },
  {
    begin: '2024-06-04T14:00:00+02:00',
    end: '2024-06-04T16:00:00+02:00',
  },
  {
    begin: '2024-06-05T14:00:00+02:00',
    end: '2024-06-05T16:00:00+02:00',
  },
  {
    begin: '2024-06-06T14:00:00+02:00',
    end: '2024-06-06T16:00:00+02:00',
  },
  {
    begin: '2024-06-07T14:00:00+02:00',
    end: '2024-06-07T16:00:00+02:00',
  },
  {
    begin: '2024-06-08T14:00:00+02:00',
    end: '2024-06-08T16:00:00+02:00',
  },
  {
    begin: '2024-06-09T14:00:00+02:00',
    end: '2024-06-09T16:00:00+02:00',
  },
  {
    begin: '2024-06-10T14:00:00+02:00',
    end: '2024-06-10T16:00:00+02:00',
  },
  {
    begin: '2024-06-11T14:00:00+02:00',
    end: '2024-06-11T16:00:00+02:00',
  },
  {
    begin: '2024-06-12T14:00:00+02:00',
    end: '2024-06-12T16:00:00+02:00',
  },
  {
    begin: '2024-06-13T14:00:00+02:00',
    end: '2024-06-13T16:00:00+02:00',
  },
  {
    begin: '2024-06-14T14:00:00+02:00',
    end: '2024-06-14T16:00:00+02:00',
  },
  {
    begin: '2024-06-15T14:00:00+02:00',
    end: '2024-06-15T16:00:00+02:00',
  },
  {
    begin: '2024-06-16T14:00:00+02:00',
    end: '2024-06-16T16:00:00+02:00',
  },
  {
    begin: '2024-06-17T14:00:00+02:00',
    end: '2024-06-17T16:00:00+02:00',
  },
  {
    begin: '2024-06-18T14:00:00+02:00',
    end: '2024-06-18T16:00:00+02:00',
  },
  {
    begin: '2024-06-19T14:00:00+02:00',
    end: '2024-06-19T16:00:00+02:00',
  },
  {
    begin: '2024-06-20T14:00:00+02:00',
    end: '2024-06-20T16:00:00+02:00',
  },
  {
    begin: '2024-06-21T14:00:00+02:00',
    end: '2024-06-21T16:00:00+02:00',
  },
  {
    begin: '2024-06-22T14:00:00+02:00',
    end: '2024-06-22T16:00:00+02:00',
  },
  {
    begin: '2024-06-23T14:00:00+02:00',
    end: '2024-06-23T16:00:00+02:00',
  },
  {
    begin: '2024-06-24T14:00:00+02:00',
    end: '2024-06-24T16:00:00+02:00',
  },
  {
    begin: '2024-06-25T14:00:00+02:00',
    end: '2024-06-25T16:00:00+02:00',
  },
  {
    begin: '2024-06-26T14:00:00+02:00',
    end: '2024-06-26T16:00:00+02:00',
  },
  {
    begin: '2024-06-27T14:00:00+02:00',
    end: '2024-06-27T16:00:00+02:00',
  },
];

const availableSpace = doc.page.width;
const columnNumber = 3;
let height;
let isMonthFullyProcessed;

const datesByMonth = spreadTimings(timings, 'Europe/Paris');
const [_monthYear, _weeks] = Object.entries(datesByMonth).shift();

await addTestTitle(doc, cursor, 'All dates fit in 1 column');
height = doc.page.height;
isMonthFullyProcessed = true;
await addCalendarColumn(doc, cursor, timings, isMonthFullyProcessed, {
  availableSpace,
  columnNumber,
  height,
  lang,
});

cursor.y += 30;

await addTestTitle(doc, cursor, "Some dates don't fit in 1 column");
height = cursor.y + 100;
isMonthFullyProcessed = true;
await addCalendarColumn(doc, cursor, timings, isMonthFullyProcessed, {
  availableSpace,
  columnNumber,
  height,
  lang,
});

cursor.y += 30;

await addTestTitle(doc, cursor, 'Month header not displayed');
height = cursor.y + 100;
isMonthFullyProcessed = false;
await addCalendarColumn(doc, cursor, timings, isMonthFullyProcessed, {
  availableSpace,
  columnNumber,
  height,
  lang,
});

doc.end();

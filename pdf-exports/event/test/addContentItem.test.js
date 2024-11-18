import fs from 'node:fs';
import { getLocaleValue } from '@openagenda/intl';
import PDFDocument from 'pdfkit';
import addPageColumns from '../lib/addPageColumns.js';
import event from './fixtures/loiretEvent.json' assert { type: 'json' };
import agenda from './fixtures/loiretAgenda.json' assert { type: 'json' };

const { PDF_TEST_FOLDER: pdfTestFolder = '/tmp' } = process.env;

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const writeStream = fs.createWriteStream(`${pdfTestFolder}/addContentItem.pdf`);
doc.pipe(writeStream);

const lang = "fr";

const cursor = { x: 0, y: 0 };
const pageWidth = doc.page.width;

const pdfRender = () => ({
  columns: [{
    width: 3,
    content: [{
      addFn: 'addAdditionalFields',
      data: event,
      agenda,
      truncable: true,
    },
    {
      addFn: 'addAdditionalFields',
      data: event,
      agenda,
      truncable: true,
    }]
  }, {
    width: 2,
    content: [{
      addFn: 'addText',
      data: getLocaleValue(event.dateRange, lang),
      bold: true,
      truncable: true,
    }]
  }]
});

const columnConfig = pdfRender(event);

await addPageColumns({ doc, cursor }, columnConfig, { pageWidth, lang });

doc.end();

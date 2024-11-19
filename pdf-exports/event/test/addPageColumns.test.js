import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addPageColumns from '../lib/addPageColumns.js';

const { PDF_TEST_FOLDER: pdfTestFolder = '/tmp' } = process.env;

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const writeStream = fs.createWriteStream(`${pdfTestFolder}/addPageColumns.pdf`);
doc.pipe(writeStream);

const cursor = { x: 0, y: 0 };

const eventData = {
  title: 'Sample Title',
  description: { fr: 'Description en français' },
  timings: [
    {
      begin: '2024-06-23T14:00:00+02:00',
      end: '2024-06-23T16:00:00+02:00'
    },
    {
      begin: '2024-06-24T14:00:00+02:00',
      end: '2024-06-24T16:00:00+02:00'
    },
    {
      begin: '2024-07-25T14:00:00+02:00',
      end: '2024-07-25T16:00:00+02:00'
    },
    {
      begin: '2024-07-26T14:00:00+02:00',
      end: '2024-07-26T16:00:00+02:00'
    },
    {
      begin: '2024-08-27T14:00:00+02:00',
      end: '2024-08-27T16:00:00+02:00'
    }
  ]
};

const pageWidth = doc.page.width;

const pdfRender = (data) => ({
  columns: [{
    width: 3,
    content: [{
      addFn: 'addText',
      data: data.title,
      bold: true,
    }, {
      addFn: 'addText',
      data: data.description.fr
    }]
  }, {
    width: 2,
    content: [{
      addFn: 'addText',
      data: data.title,
      bold: true,
    }, {
      addFn: 'addText',
      data: data.description.fr
    }]
  }, {
    width: 5,
    content: [{
      addFn: 'addText',
      data: data.title,
      bold: true,
    }, {
      addFn: 'addText',
      data: data.description.fr
    }]
  }]
});


const columnConfig = pdfRender(eventData);

await addPageColumns({ doc, cursor }, columnConfig, { pageWidth });

doc.end();

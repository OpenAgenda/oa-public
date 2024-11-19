import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addPageColumns from '../lib/addPageColumns.js';
import data from './fixtures/data.json' assert { type: 'json' };

const { PDF_TEST_FOLDER: pdfTestFolder = '/tmp' } = process.env;

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const writeStream = fs.createWriteStream(`${pdfTestFolder}/truncatedContent.pdf`);
doc.pipe(writeStream);

const cursor = { x: 0, y: 0 };
const pageWidth = doc.page.width;

await addPageColumns({ doc, cursor }, {
  columns: [{
    width: 2,
    content: [{
      addFn: 'addText',
      data: data.text,
      truncable: true,
    }]
  }, {
    width: 5,
    content: [{
      addFn: 'addText',
      data: 'Un bout de texte Lorem Ipsum à rallonge'
    }]
  }] 
}, { pageWidth });


doc.end();
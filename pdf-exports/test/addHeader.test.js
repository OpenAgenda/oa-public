import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addDocumentHeader from '../lib/addDocumentHeader.js';
import addPageHeader from '../lib/addPageHeader.js';
import loadAgendaData from './lib/loadAgendaData.js';

const {
  AGENDA_UID: agendaUid,
  API_KEY: APIKey,
  PDF_TEST_FOLDER: pdfTestFolder,
} = process.env;

const cursor = { x: 0, y: 0 };
const margin = 20;

let firstPage = true;
let pageHeader = null;
let pageHeaderHeight = null;

(async () => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const writeStream = fs.createWriteStream(
    `${pdfTestFolder}/pdfTestAddHeader.pdf`,
  );
  doc.pipe(writeStream);

  const agenda = await loadAgendaData(agendaUid, APIKey);

  if (firstPage) {
    const { height: documentHeaderHeight } = await addDocumentHeader(
      agenda,
      doc,
      cursor,
    );

    cursor.y += documentHeaderHeight + margin;

    firstPage = false;
  }

  doc.addPage();

  cursor.y = doc.page.margins.top;

  pageHeader = await addPageHeader(agenda, doc, cursor);
  pageHeaderHeight = pageHeader.height;

  cursor.y += pageHeaderHeight + margin;

  doc.end();
})();

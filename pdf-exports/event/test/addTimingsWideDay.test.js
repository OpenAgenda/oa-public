import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addMultipageSegments from '../lib/addMultipageSegments.js';
import addText from '../lib/addText.js';
import outputFolder from './lib/outputFolder.js';

// Non-regression for the web-worker memory runaways of 2026-08-30 → 09-01:
// an event with 21 quarter-hour slots per day (event 70063400, JEP 2026 La
// Réunion) rendered its date line wider than the column, the timings
// segment never fit, and addMultipageSegments retried it on an empty page
// forever — ~800 pages/s, all buffered by pdfkit. The render must finish,
// on a handful of pages.

const slots = [];
for (const day of ['2026-09-19', '2026-09-20']) {
  for (const [h, m] of [
    [9, 0],
    [9, 15],
    [9, 30],
    [9, 45],
    [10, 0],
    [10, 15],
    [10, 30],
    [10, 45],
    [11, 0],
    [11, 15],
    [13, 0],
    [13, 15],
    [13, 30],
    [13, 45],
    [14, 0],
    [14, 15],
    [14, 30],
    [14, 45],
    [15, 0],
    [15, 15],
    [15, 30],
  ]) {
    const pad = (n) => String(n).padStart(2, '0');
    const endM = (m + 15) % 60;
    const endH = h + (m + 15 >= 60 ? 1 : 0);
    slots.push({
      begin: `${day}T${pad(h)}:${pad(m)}:00+04:00`,
      end: `${day}T${pad(endH)}:${pad(endM)}:00+04:00`,
    });
  }
}

// Same geometry as the event render: A4 portrait, 7pt margins, one column.
const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margin: 7 });
doc.pipe(fs.createWriteStream(`${outputFolder}/addTimingsWideDay.pdf`));

let pages = 1;
doc.on('pageAdded', () => {
  pages += 1;
});

const watchdog = setTimeout(() => {
  console.error('addTimingsWideDay: render did not finish within 20s');
  process.exit(1);
}, 20_000);

await addMultipageSegments(
  doc,
  [
    [
      {
        width: 1,
        padding: 0,
        contentItemMargin: 5,
        content: [
          {
            field: {
              field: 'timings',
              fieldType: 'timings',
              label: { fr: 'Horaires' },
            },
            value: slots,
            relatedValues: { timezone: 'Indian/Reunion' },
          },
        ],
      },
    ],
  ],
  {
    lang: 'fr',
    addHeader: (d, cursor, options = {}) =>
      addText(d, cursor, {
        ...options,
        content: 'Visites guidées',
        bold: true,
      }),
  },
);

doc.end();
clearTimeout(watchdog);

if (pages > 3) {
  console.error(`addTimingsWideDay: expected at most 3 pages, got ${pages}`);
  process.exit(1);
}
console.log(`addTimingsWideDay: ok, ${slots.length} slots on ${pages} page(s)`);

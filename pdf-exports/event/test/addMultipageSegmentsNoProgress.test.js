import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addMultipageSegments from '../lib/addMultipageSegments.js';
import outputFolder from './lib/outputFolder.js';

// The paginator must fail, not loop, on a segment that cannot be placed on
// an empty page. A non-segmentable text taller than a page is such a
// segment: addText hands it back whole whenever it does not fit, and before
// the guard addMultipageSegments retried it on a fresh page forever.

const doc = new PDFDocument({ size: 'A6', layout: 'portrait', margin: 20 });
doc.pipe(
  fs.createWriteStream(`${outputFolder}/addMultipageSegmentsNoProgress.pdf`),
);

let pages = 1;
doc.on('pageAdded', () => {
  pages += 1;
});

const watchdog = setTimeout(() => {
  console.error(
    'addMultipageSegmentsNoProgress: paginator did not stop within 20s',
  );
  process.exit(1);
}, 20_000);

const tallerThanAPage = Array.from(
  { length: 400 },
  (_, i) => `ligne ${i + 1}`,
).join('\n');

let failure = null;
try {
  await addMultipageSegments(
    doc,
    [
      [
        {
          width: 1,
          content: [
            {
              field: { field: 'conditions', fieldType: 'text' },
              value: { fr: tallerThanAPage },
              segmentable: false,
            },
          ],
        },
      ],
    ],
    { lang: 'fr' },
  );
} catch (error) {
  failure = error;
}

doc.end();
clearTimeout(watchdog);

if (failure?.name !== 'PDFSegmentDoesNotFit') {
  console.error(
    `addMultipageSegmentsNoProgress: expected PDFSegmentDoesNotFit, got ${failure?.name ?? 'no error'} after ${pages} page(s)`,
  );
  process.exit(1);
}
if (pages > 3) {
  console.error(
    `addMultipageSegmentsNoProgress: gave up too late, ${pages} pages`,
  );
  process.exit(1);
}
console.log(
  `addMultipageSegmentsNoProgress: ok, aborted after ${pages} page(s)`,
);

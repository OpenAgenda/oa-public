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

// The guard must not fire on legitimate progress. A labelled item whose label
// fits on the page but whose non-segmentable text does not comes back whole
// (minus the label, which was drawn): that is progress, and the text must
// land on the next page. The page height is not calibrated: each length is
// first rendered without a label to learn whether the text fits an empty
// page at all; whenever it does, the labelled variant must render too — on
// two pages exactly when label + text overflow the first.
async function renderText(name, lineCount, label) {
  const d = new PDFDocument({ size: 'A6', layout: 'portrait', margin: 20 });
  d.pipe(fs.createWriteStream(`${outputFolder}/${name}-${lineCount}.pdf`));
  let p = 1;
  d.on('pageAdded', () => {
    p += 1;
  });
  const text = Array.from(
    { length: lineCount },
    (_, i) => `ligne ${i + 1}`,
  ).join('\n');
  let error = null;
  try {
    await addMultipageSegments(
      d,
      [
        [
          {
            width: 1,
            content: [
              {
                field: {
                  field: 'conditions',
                  fieldType: 'text',
                  ...label && { label },
                },
                value: { fr: text },
                segmentable: false,
              },
            ],
          },
        ],
      ],
      { lang: 'fr' },
    );
  } catch (e) {
    error = e;
  }
  d.end();
  return { pages: p, error };
}

let boundaryHit = false;
for (let lineCount = 16; lineCount <= 30; lineCount += 1) {
  const bare = await renderText('addMultipageSegmentsText', lineCount, null);
  if (bare.error) {
    // Too tall for an empty page even alone: unplaceable, the guard is right.
    continue;
  }
  const labelled = await renderText(
    'addMultipageSegmentsLabelThenText',
    lineCount,
    {
      fr: 'Conditions de participation',
    },
  );
  if (labelled.error) {
    console.error(
      `addMultipageSegmentsNoProgress: ${lineCount} lines fit a page alone but failed with a label: ${labelled.error.name}`,
    );
    process.exit(1);
  }
  if (labelled.pages > 2) {
    console.error(
      `addMultipageSegmentsNoProgress: ${lineCount} lines with a label took ${labelled.pages} pages`,
    );
    process.exit(1);
  }
  if (labelled.pages === 2) boundaryHit = true;
}
if (!boundaryHit) {
  console.error(
    'addMultipageSegmentsNoProgress: no length exercised the label-then-text boundary',
  );
  process.exit(1);
}
console.log(
  'addMultipageSegmentsNoProgress: ok, a label followed by a bouncing text renders on 2 pages',
);

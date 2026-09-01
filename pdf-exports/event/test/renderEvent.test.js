import fs from 'node:fs';
import { finished } from 'node:stream/promises';
import PDFExports from '../index.js';
import outputFolder from './lib/outputFolder.js';

const selectedPDF = process.argv.length > 2 && [].concat(process.argv).pop();

const readFx = (filename) =>
  fs.promises
    .readFile(`${import.meta.dirname}/fixtures/${filename}.json`, 'utf-8')
    .then((content) => JSON.parse(content));

const {
  TEST_LANG: testLang = 'fr',
  RENDER_TIMEOUT_MS: renderTimeoutMs = 120_000,
} = process.env;

// Create PDF exports instance
const pdfExports = PDFExports({});

// Define fixture pairs to test
const fixturePairs = [
  {
    name: 'loiret',
    agenda: await readFx('loiret.agenda'),
    event: await readFx('withRegistrationLink.event'),
  },
  {
    name: 'begles',
    agenda: await readFx('begles.agenda'),
    event: await readFx('begles.event'),
  },
  {
    name: 'withLocationImage',
    agenda: await readFx('withLocationImage.agenda'),
    event: await readFx('withLocationImage.event'),
  },
  {
    name: 'online',
    agenda: await readFx('pciCorse.agenda'),
    event: await readFx('onlineAttendance.event'),
  },
  {
    name: 'detailedLocation',
    agenda: await readFx('ndm.agenda'),
    event: await readFx('detailedLocation.event'),
  },
  {
    name: 'animanas',
    agenda: await readFx('ndm.agenda'),
    event: await readFx('animanas.event'),
  },
  {
    name: 'animanas-no-long-description',
    agenda: await readFx('ndm.agenda'),
    event: { ...await readFx('animanas.event'), longDescription: {} },
  },
  {
    name: 'visite-gratuite',
    agenda: await readFx('ndm.agenda'),
    event: await readFx('visite-gratuite.event'),
  },
  {
    name: 'quinzaine',
    agenda: await readFx('quinzaine.agenda'),
    event: await readFx('quinzaine.event'),
  },
  {
    name: 'rodin',
    agenda: await readFx('piscine.agenda'),
    event: await readFx('rodin-bourdelle.event'),
  },
  {
    name: 'suzanne',
    agenda: await readFx('bm.agenda'),
    event: await readFx('suzanne.event'),
  },
  {
    name: 'intrepides',
    agenda: await readFx('colo.agenda'),
    event: await readFx('intrepides.event'),
  },
  {
    name: 'bunkers',
    agenda: await readFx('jep-2025-pays-de-la-loire'),
    event: await readFx('bunkers.event'),
  },
  {
    // Event 70063400: 21 quarter-hour slots per day. Its date line used to be
    // measured unbounded, never fit a column, and the paginator retried it on
    // fresh pages forever — the web-node memory runaways of 2026-08-30 → 09-01.
    name: 'prefecture-reunion-many-slots',
    agenda: await readFx('jep-2026-la-reunion.agenda'),
    event: await readFx('prefecture-reunion-visites.event'),
  },
  {
    name: 'gouton',
    agenda: await readFx('gouton').then((d) => d.agenda),
    event: await readFx('gouton').then((d) => d.event),
  },
  {
    name: 'additionalImage',
    agenda: await readFx('additionalImage').then((d) => d.agenda),
    event: await readFx('additionalImage').then((d) => d.event),
  },
  {
    name: 'badLocationImage',
    agenda: await readFx('badLocationImage').then((d) => d.agenda),
    event: await readFx('badLocationImage').then((d) => d.event),
  },
  {
    name: '404LocationImage',
    agenda: await readFx('404LocationImage').then((d) => d.agenda),
    event: await readFx('404LocationImage').then((d) => d.event),
  },
  {
    name: 'nullValuedRegistrationItem',
    agenda: await readFx('nullValuedRegistrationItem').then((d) => d.agenda),
    event: await readFx('nullValuedRegistrationItem').then((d) => d.event),
  },
  {
    name: 'lineOverflow',
    agenda: await readFx('lineOverflow').then((d) => d.agenda),
    event: await readFx('lineOverflow').then((d) => d.event),
  },
  {
    name: 'lineSeparator2028',
    agenda: await readFx('lineSeparator2028').then((d) => d.agenda),
    event: await readFx('lineSeparator2028').then((d) => d.event),
  },
  {
    name: 'longerLink',
    agenda: await readFx('longerLink').then((d) => d.agenda),
    event: await readFx('longerLink').then((d) => d.event),
  },
].filter(({ name }) => (selectedPDF ? selectedPDF === name : true));

if (!fixturePairs.length) {
  console.error(`No fixture pair named "${selectedPDF}".`);
  process.exit(1);
}

// A plain setTimeout keeps the event loop alive, where AbortSignal.timeout()
// would not: an unclosed document has to fail loudly rather than let node exit
// on an unsettled await.
function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// A rendered PDF must at least exist, be non-empty and carry the PDF magic
// number — enough to catch a render that silently produced nothing.
async function assertRenderedPDF(filePath, name) {
  const { size } = await fs.promises.stat(filePath);

  if (size === 0) {
    throw new Error(`${name}: rendered an empty file`);
  }

  const handle = await fs.promises.open(filePath, 'r');

  try {
    const { buffer } = await handle.read(Buffer.alloc(5), 0, 5, 0);

    if (buffer.toString('latin1') !== '%PDF-') {
      throw new Error(`${name}: rendered file is not a PDF`);
    }
  } finally {
    await handle.close();
  }

  return size;
}

// Generate PDFs for each fixture pair
const failures = [];

for (const { name, agenda, event } of fixturePairs) {
  const filePath = `${outputFolder}/${name}EventPage.pdf`;

  try {
    const writeStream = fs.createWriteStream(filePath);
    await pdfExports.render(writeStream, agenda, event, {
      lang: testLang,
      imagePath: 'https://cdn.openagenda.com/main/',
    });
    // render() calls doc.end(), but the piped stream flushes asynchronously:
    // without this the file may still be incomplete when we check it. The
    // timeout keeps a document that is never closed from hanging the run.
    await withTimeout(
      finished(writeStream),
      Number(renderTimeoutMs),
      `${name}: not finished after ${renderTimeoutMs}ms`,
    );

    const size = await assertRenderedPDF(filePath, name);
    console.log(`ok ${name} (${Math.round(size / 1024)} KiB)`);
  } catch (e) {
    failures.push({ name, error: e });
    console.error(`FAIL ${name}: ${e.message}`);
  }
}

console.log(
  `\n${fixturePairs.length - failures.length}/${fixturePairs.length} rendered in ${outputFolder}`,
);

if (failures.length) {
  console.error(`\n${failures.length} failed:`);
  for (const { name, error } of failures) {
    console.error(`\n--- ${name} ---`);
    console.error(error);
  }
  process.exit(1);
}

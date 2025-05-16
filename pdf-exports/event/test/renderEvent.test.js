import * as url from 'node:url';
import fs from 'node:fs';
import PDFExports from '../index.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const selectedPDF = process.argv.length > 2 && [].concat(process.argv).pop();

const readFx = (filename) =>
  fs.promises
    .readFile(`${__dirname}/fixtures/${filename}.json`, 'utf-8')
    .then((content) => JSON.parse(content));

const { TEST_LANG: testLang = 'fr' } = process.env;

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
].filter(({ name }) => (selectedPDF ? selectedPDF === name : true));

// Generate PDFs for each fixture pair
for (const { name, agenda, event } of fixturePairs) {
  const writeStream = fs.createWriteStream(
    `${__dirname}/renders/${name}EventPage.pdf`,
  );
  await pdfExports.render(writeStream, agenda, event, {
    lang: testLang,
    imagePath: 'https://cdn.openagenda.com/main/',
  });
}

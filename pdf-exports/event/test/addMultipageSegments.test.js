import * as url from 'node:url';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addMultipageSegments from '../lib/addMultipageSegments.js';
import addText from '../lib/addText.js';
import loiretEvent from './fixtures/withRegistrationLink.event.json' assert { type: 'json' };

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const doc = new PDFDocument({
  size: 'A5',
  layout: 'landscape',
  margin: 20,
});
const writeStream = fs.createWriteStream(
  `${__dirname}/renders/addMultipageSegments.pdf`,
);
doc.pipe(writeStream);

const bdxFields = JSON.parse(
  await readFile(`${__dirname}/fixtures/bdxFields.json`, 'utf-8'),
).filter((f) => ['agenda', 'network'].includes(f.schemaType));

const column1 = {
  width: 4,
  margin: 10,
  content: [
    {
      field: {
        field: 'timings',
        fieldType: 'timings',
        label: { fr: 'Horaires' },
      },
      value: loiretEvent.timings,
      relatedValues: {
        timezone: 'Europe/Paris',
      },
    },
    {
      field: {
        field: 'uid',
        fieldType: 'qr',
      },
      value: 'https://openagenda.com',
      size: 80,
    },
    {
      field: bdxFields.find(
        (f) => f.field === 'categories-agenda-metropolitain',
      ),
      value: [53, 54],
    },
    {
      field: bdxFields.find((f) => f.field === 'categories-mediatheque'),
      value: 88,
    },
    {
      field: {
        field: 'enfantmaitre',
        fieldType: 'markdown',
        label: { fr: "L'enfant et le maître d'école" },
      },
      value: await readFile(
        `${__dirname}/fixtures/l-enfant-et-le-maitre-decole.md`,
        'utf-8',
      ),
    },
    {
      field: {
        field: 'cocheetmouche',
        fieldType: 'markdown',
        label: { fr: 'Le coche et la mouche' },
      },
      value: await readFile(
        `${__dirname}/fixtures/le-coche-et-la-mouche.md`,
        'utf-8',
      ),
    },
  ],
};

const column2 = {
  width: 5,
  margin: 10,
  content: [
    {
      field: {
        field: 'title',
        fieldType: 'text',
      },
      value: { fr: 'Ce texte pourrait être un titre' },
      fontSize: '1.3em',
      bold: true,
    },
    {
      field: {
        field: 'image',
        fieldType: 'image',
        label: { fr: 'Image' },
      },
      value: {
        filename: '6bcfd7adf2944e4ba7cddfc75d909d4f.base.image.jpg',
        size: {
          width: 700,
          height: 525,
        },
        variants: [
          {
            filename: '6bcfd7adf2944e4ba7cddfc75d909d4f.full.image.jpg',
            size: {
              width: 747,
              height: 560,
            },
            type: 'full',
          },
          {
            filename: '6bcfd7adf2944e4ba7cddfc75d909d4f.thumb.image.jpg',
            size: {
              width: 200,
              height: 200,
            },
            type: 'thumbnail',
          },
        ],
        base: 'https://cdn.openagenda.com/main/',
      },
    },
    {
      field: {
        field: 'registration',
        label: {
          fr: "Outils d'inscription",
        },
        fieldType: 'registration',
      },
      value: [
        {
          type: 'phone',
          value: '0238874307',
        },
        {
          type: 'email',
          value: 'mairie.sceaudugatinais@wanadoo.fr',
        },
        {
          type: 'link',
          value: 'billetterie.com',
        },
      ],
    },
    {
      field: {
        field: 'image-portrait',
        fieldType: 'image',
        label: {
          fr: 'Image au format portrait',
        },
      },
      value: {
        filename:
          '6bcfd7adf2944e4ba7cddfc75d909d4f.image-de-levenement-format-portrait.jpg',
        base: 'https://cdn.openagenda.com/main/',
      },
    },
    {
      field: {
        field: 'cauderie',
        fieldType: 'markdown',
        label: { fr: 'Causerie' },
      },
      value: await readFile(`${__dirname}/fixtures/causerie.md`, 'utf-8'),
    },
  ],
};

const column3 = {
  width: 1,
  margin: 10,
  content: [
    {
      field: {
        field: 'lionetrat',
        fieldType: 'markdown',
        label: { fr: 'Le Lion et le rat' },
      },
      value: await readFile(
        `${__dirname}/fixtures/le-lion-et-le-rat.md`,
        'utf-8',
      ),
      fontSize: '1.4em',
    },
  ],
};

await addMultipageSegments(doc, [[column1, column2], [column3]], {
  lang: 'fr',
  addHeader: (d, cursor, options = {}) =>
    addText(d, cursor, {
      ...options,
      content: 'Mixtouille de contenus',
      bold: true,
      align: 'center',
    }),
  addFooter: (d, cursor, options = {}) =>
    addText(d, cursor, {
      ...options,
      content: `Page ${options.pageNumber}`,
      align: 'center',
    }),
});

doc.end();

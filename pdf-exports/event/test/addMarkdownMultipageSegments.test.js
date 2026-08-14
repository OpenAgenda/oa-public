import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addMultipageSegments from '../lib/addMultipageSegments.js';
import addText from '../lib/addText.js';
import outputFolder from './lib/outputFolder.js';

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const writeStream = fs.createWriteStream(
  `${outputFolder}/addMarkdownMultipageSegments.pdf`,
);
doc.pipe(writeStream);

await addMultipageSegments(
  doc,
  [
    [
      {
        width: 4,
        margin: 10,
        content: [
          {
            field: {
              field: 'paterna',
              fieldType: 'markdown',
              label: { fr: 'Mise en forme problématique' },
            },
            value: await readFile(
              `${import.meta.dirname}/fixtures/paternap.md`,
              'utf-8',
            ),
          },
          {
            field: {
              field: 'textwithemojis',
              fieldType: 'markdown',
              label: { fr: 'Du text avec des emojs' },
            },
            value: await readFile(
              `${import.meta.dirname}/fixtures/emojis.md`,
              'utf-8',
            ),
          },
          {
            field: {
              field: 'enfantmaitre',
              fieldType: 'markdown',
              label: { fr: "L'enfant et le maître d'école" },
            },
            value: await readFile(
              `${import.meta.dirname}/fixtures/l-enfant-et-le-maitre-decole.md`,
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
              `${import.meta.dirname}/fixtures/le-coche-et-la-mouche.md`,
              'utf-8',
            ),
          },
        ],
      },
      {
        width: 2,
        margin: 10,
        content: [
          {
            field: {
              field: 'cauderie',
              fieldType: 'markdown',
              label: { fr: 'Causerie' },
            },
            value: await readFile(
              `${import.meta.dirname}/fixtures/causerie.md`,
              'utf-8',
            ),
          },
        ],
      },
      {
        width: 4,
        margin: 10,
        content: [
          {
            field: {
              field: 'loiret',
              fieldType: 'markdown',
              label: { fr: 'Des entêtes, des listes et des liens' },
            },
            value: await readFile(
              `${import.meta.dirname}/fixtures/ateliers-urbbraye.md`,
              'utf-8',
            ),
          },
          {
            field: {
              field: 'tiradedunez',
              fieldType: 'markdown',
              label: { fr: 'Tirade du nez' },
            },
            value: await readFile(
              `${import.meta.dirname}/fixtures/tirade-du-nez.md`,
              'utf-8',
            ),
          },
        ],
      },
    ],
    [
      {
        width: 10,
        margin: 10,
        content: [
          {
            field: {
              field: 'rodinbourdelle',
              fieldType: 'markdown',
              label: { fr: 'Expositions Rodin/Bourdelle à La Piscine' },
            },
            value: await readFile(
              `${import.meta.dirname}/fixtures/rodin-bourdelle.md`,
              'utf-8',
            ),
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
        content: `Entête - page ${options.pageNumber}`,
        bold: true,
      }),
    addFooter: (d, cursor, options = {}) =>
      addText(d, cursor, {
        ...options,
        content: `Pied de page - page ${options.pageNumber}`,
        bold: true,
      }),
  },
);

doc.end();

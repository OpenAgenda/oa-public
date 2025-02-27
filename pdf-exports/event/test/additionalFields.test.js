import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addAdditionalFields from '../lib/addAdditionalFields.js';

import addTestTitle from './utils/addTestTitle.js';

const { PDF_TEST_FOLDER: pdfTestFolder, TEST_LANG: lang = 'fr' } = process.env;

const cursor = {
  x: 10,
  y: 10,
};
const doc = new PDFDocument({ size: 'A4', margin: 0 });
doc.pipe(fs.createWriteStream(`${pdfTestFolder}/additionalFields.test.pdf`));

await addTestTitle(doc, cursor, 'Additional field is not handled yet');

await addAdditionalFields(doc, cursor, {
  content: {
    event: {
      someTextField: 'Some text field value',
    },
  },
  agenda: {
    schema: {
      fields: [
        {
          field: 'someTextField',
          schemaType: 'agenda',
          label: { fr: 'Un champ paragraphe' },
        },
      ],
    },
  },
});

await addTestTitle(doc, cursor, 'Optioned field case:');

await addAdditionalFields(doc, cursor, {
  lang,
  width: doc.page.width,
  margin: 20,
  content: {
    event: {
      category: 12,
      public: [13],
    },
  },
  agenda: {
    schema: {
      fields: [
        {
          field: 'category',
          schemaType: 'agenda',
          label: { fr: 'Catégorie' },
          options: [
            {
              id: 12,
              label: { fr: 'Exposition' },
            },
          ],
        },
        {
          field: 'public',
          schemaType: 'agenda',
          label: { fr: 'Public' },
          options: [
            { id: 13, label: { fr: 'Enfants' } },
            { id: 14, label: { fr: 'Adolescents' } },
          ],
        },
      ],
    },
  },
});

doc.end();

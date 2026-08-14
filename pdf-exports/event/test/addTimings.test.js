import * as url from 'node:url';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addMultipageSegments from '../lib/addMultipageSegments.js';
import addText from '../lib/addText.js';
import onlineEvent from './fixtures/onlineAttendance.event.json' with { type: 'json' };

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const doc = new PDFDocument({
  size: 'A5',
  layout: 'landscape',
  margin: 20,
});
const writeStream = fs.createWriteStream(`${__dirname}/renders/addTimings.pdf`);
doc.pipe(writeStream);

await addMultipageSegments(
  doc,
  [
    [
      {
        width: 2,
        content: [
          {
            field: {
              field: 'title',
              fieldType: 'text',
            },
            value: {
              fr: "Les horaires se répandent sur plusieurs colonnes selon la place disponible. Lorsqu'un mois n'a pas la place de se placer sur une colonne, le reste s'affiche à la colonne suivante, sans répéter le titre. Le titre est par contre répété si le contenu d'un même mois passe à la page suivante.",
            },
          },
        ],
      },
      {
        width: 5,
        content: [
          {
            field: {
              field: 'timings',
              fieldType: 'timings',
            },
            value: onlineEvent.timings.filter(
              (t) =>
                t.begin > '2025-10-01T00:00:00+02:00'
                && t.begin < '2025-12-30T00:00:00+02:00',
            ),
            relatedValues: {
              timezone: 'Europe/Paris',
            },
          },
        ],
      },
    ],
  ],
  {
    lang: 'fr',
    addHeader: async (d, cursor, options = {}) => {
      const size = await addText(d, cursor, {
        ...options,
        content: 'Affichage des horaires sur plusieurs colonnes',
        bold: true,
        align: 'center',
      });
      return {
        ...size,
        height: size.height + 10,
      };
    },
    addFooter: (d, cursor, options = {}) =>
      addText(d, cursor, {
        ...options,
        content: `Page ${options.pageNumber}`,
        align: 'center',
      }),
  },
);

doc.end();

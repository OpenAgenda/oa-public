import * as url from 'node:url';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import addMultipageSegments from '../lib/addMultipageSegments.js';
import addText from '../lib/addText.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const doc = new PDFDocument({
  size: 'A5',
  layout: 'landscape',
  margin: 20,
});
const writeStream = fs.createWriteStream(
  `${__dirname}/renders/addOptioned.pdf`,
);
doc.pipe(writeStream);

const column1 = {
  width: 4,
  margin: 10,
  content: [
    {
      field: {
        field: 'interetintercommunal',
        label: {
          fr: 'Événement d’intérêt métropolitain',
          en: 'Événement d’intérêt métropolitain',
        },
        options: [
          {
            id: 1,
            value: 'true',
            label: {
              fr: 'Ajouter mon événement à l’agenda de la Métropole Européenne de Lille',
              en: 'Ajouter mon événement à l’agenda de la Métropole Européenne de Lille',
            },
            info: null,
            display: true,
          },
        ],
        fieldType: 'checkbox',
      },
      value: [1],
    },
    {
      field: {
        field: 'recurringevent',
        label: {
          fr: 'Événement récurrent',
          en: 'Événement récurrent',
        },
        options: [
          {
            id: 2,
            value: 'true',
            label: {
              fr: 'Événement récurrent',
              en: 'Événement récurrent',
            },
            info: null,
            display: true,
          },
        ],
        fieldType: 'checkbox',
      },
      value: [],
    },
    {
      field: {
        field: 'categories-metropolitaines',
        label: {
          fr: 'Catégories Métropolitaines',
          en: 'Catégories Métropolitaines',
        },
        options: [
          {
            id: 3,
            value: 'atelier',
            label: {
              fr: 'Atelier',
              en: 'Workshop',
            },
            info: null,
            display: true,
          },
          {
            id: 4,
            value: 'braderie-brocante',
            label: {
              fr: 'Braderie - Brocante',
              en: 'Garage sale',
            },
            info: null,
            display: true,
          },
          {
            id: 5,
            value: 'ceremonie',
            label: {
              fr: 'Cérémonie',
              en: 'Ceremony',
            },
            info: null,
            display: true,
          },
          {
            id: 6,
            value: 'cinema',
            label: {
              fr: 'Cinéma',
              en: 'Movies',
            },
            info: null,
            display: true,
          },
        ],
        fieldType: 'checkbox',
      },
      value: [5],
    },
    {
      field: {
        field: 'label',
        label: {
          fr: 'Label',
          en: 'Label',
        },
        options: [
          {
            id: 25,
            value: 'design',
            label: {
              fr: 'Design',
              en: 'Design',
            },
            info: null,
            display: true,
          },
          {
            id: 33,
            value: 'espaces-naturels-metropolitains',
            label: {
              fr: 'Espaces Naturels Métropolitains',
              en: 'Espaces Naturels Métropolitains',
            },
            info: null,
            display: true,
          },
          {
            id: 30,
            value: 'espaces-naturels-sensibles',
            label: {
              fr: 'Espaces Naturels Sensibles',
              en: 'Espaces Naturels Sensibles',
            },
            info: null,
            display: true,
          },
          {
            id: 35,
            value: 'jeux-olympiques-2024',
            label: {
              fr: 'Jeux Olympiques 2024',
              en: 'Jeux Olympiques 2024',
            },
            info: null,
            display: true,
          },
          {
            id: 27,
            value: 'journees-europeennes-du-patrimoine',
            label: {
              fr: 'Journées Européennes du Patrimoine',
              en: 'Journées Européennes du Patrimoine',
            },
            info: null,
            display: true,
          },
          {
            id: 29,
            value: 'nuits-des-bibliotheques',
            label: {
              fr: 'Nuits des bibliothèques',
              en: 'Nuits des bibliothèques',
            },
            info: null,
            display: true,
          },
          {
            id: 36,
            value: 'fiesta-lille3000',
            label: {
              fr: 'Fiesta-lille3000',
              en: 'Fiesta-lille3000',
            },
            info: null,
            display: true,
          },
          {
            id: 39,
            value: 'tour-de-france-2025',
            label: {
              fr: 'Tour de France 2025',
              en: 'Tour de France 2025',
            },
            info: null,
            display: true,
          },
        ],
        fieldType: 'checkbox',
      },
      value: [],
    },
  ],
};

await addMultipageSegments(doc, [[column1]], {
  lang: 'fr',
  addHeader: (d, cursor, options = {}) =>
    addText(d, cursor, {
      ...options,
      content: 'Test des options sélectionnées',
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

'use strict';

const Prompt = require('prompt-input');
const generateDocument = require('./server/generateDocument');

const reducer = undefined;
// const reducer = [
//   {
//     childrenKey: 'cities'
//   },
//   {
//     key: 'location.city',
//     targetKey: 'city',
//     sortBy: 'city',
//     childrenKey: 'thematiques'
//   },
//   {
//     key: 'thematiqueGroup',
//     targetKey: 'thematiqueGroup',
//     sortBy: 'thematiqueGroup',
//     childrenKey: 'thematiqueValues'
//   },
//   {
//     key: 'thematiqueValue',
//     targetKey: 'thematiqueValue',
//     sortBy: 'thematiqueValue',
//     childrenKey: 'events',
//     sortChildrenBy: [ 'passed', 'diffWithNow', 'title' ],
//     hoist: [
//       {
//         source: 'location.name',
//         target: 'locationName'
//       },
//       {
//         source: 'location.address',
//         target: 'address'
//       },
//       {
//         source: 'location.description',
//         target: 'locationDescription'
//       },
//       {
//         source: 'location.access',
//         target: 'access'
//       },
//       {
//         source: 'location.tags',
//         target: 'tags'
//       },
//       {
//         source: 'location.phone',
//         target: 'phone'
//       },
//       {
//         source: 'location.website',
//         target: 'website'
//       }
//     ]
//   }
// ];

function _term(message, options = {}) {
  return new Prompt(Object.assign(options, { message })).run();
}

(async () => {
  try {
    const templatePath = await _term(
      'What is the path to the input docx template ?',
      {
        // default: '/home/bertho/Téléchargements/template4.docx'
        default: `${__dirname}/input.docx`,
      }
    );

    const localTmpPath = await _term(
      'Where should the generated file be placed?',
      {
        // default: '/home/bertho/Téléchargements'
        default: '/var/tmp/docx',
      }
    );

    const agendaUid = await _term('What is the uid of the agenda to export?', {
      // default: 59272362 // chatellerault
      // default: 1298686 // jnarchi-2018-auvergne-rhone-alpes
      default: 63106080, // jep 2018 guyane
    });

    console.log('generating output...');

    const { outputPath } = await generateDocument({
      agendaUid,
      localTmpPath,
      templatePath,
      language: 'fr',
      reducer,
      query: {
        // from: '2017-12-31T23:00:00.000Z',
        // to: '2018-12-31T22:59:59.999Z'
      },
    });

    console.log('output generated at %s', outputPath);

    process.exit();
  } catch (e) {
    console.log('generation failed', e);

    if (e.properties && e.properties.errors) {
      e.properties.errors.forEach(error => {
        console.log('Error:', error);
      });
    }
  }
})();

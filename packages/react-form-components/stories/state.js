export default {
  translation: {
    source: 'fr',
    sets: [
      {
        source: 'fr',
        target: ['de', 'en', 'es', 'it'],
        checked: ['en', 'es'],
      }, {
        source: 'en',
        target: ['de', 'fr', 'es', 'it'],
        checked: ['de', 'fr'],
      },
    ],
  },
  multiMd: [
    {
      lang: 'fr',
      label: 'eh ouais',
      placeholder: 'gros',
      markdown: 'Le truc pas évident est de pouvoir manipuler plusieurs éditeurs sur une même page.',
    }, {
      lang: 'en',
      label: 'ou non',
      placeholder: 'meh',
      markdown: 'En particulier pour la suppression.',
    },
  ],
  values: {
    name: 'Poney Vert',
    phone: +3365034302,
    email: 'billy@poneyland.com',
    contacts: ['jony@nointernet.com', '0981189550', 'fdqfdq'],
    link: 'poneyland.com',
    html: null,
    tags: [
      {
        id: 1,
        label: 'Musée de France',
      }, {
        id: 4,
        label: 'Edifice religieux',
      },
    ],
  },
  groupSet: {
    groups: [
      {
        name: 'Label',
        info: null,
        tags: [
          {
            id: 1,
            label: 'Musée de France',
          }, {
            id: 2,
            label: 'Jardin Remarquable',
          },
        ],
      }, {
        name: 'Types de lieu',
        info: null,
        tags: [
          {
            id: 3,
            label: 'Edifice commémoratif',
          }, {
            id: 4,
            label: 'Edifice religieux',
          }, {
            id: 5,
            label: 'Chateaux, hôtels',
          },
        ],
      }, {
        required: true,
        name: 'Particularité',
        info: null,
        tags: [
          {
            id: 6,
            label: 'Première participation',
          }, {
            id: 7,
            label: 'Ouverture exceptionnelle',
          },
        ],
      },
    ],
  },
};

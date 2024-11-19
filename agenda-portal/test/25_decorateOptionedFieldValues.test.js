import decorateOptionedFieldValues from '../utils/decorateOptionedFieldValues.js';

const event = {
  'type-devenement': 11,
};

const fields = [
  {
    field: 'type-devenement',
    options: [
      {
        id: 11,
        value: 'atelier-stage',
        label: { en: 'Atelier - Stage' },
        display: true,
      },
    ],
  },
];

describe('25 - decorateOptionedFieldValues', () => {
  test('function replaces option ids with an object containing id, label and link', () => {
    expect(
      decorateOptionedFieldValues(event, {
        agenda: { schema: { fields } },
        lang: 'en',
      }),
    ).toEqual({
      'type-devenement': [
        {
          id: 11,
          label: 'Atelier - Stage',
          link: '/?type-devenement=11',
        },
      ],
    });
  });
});

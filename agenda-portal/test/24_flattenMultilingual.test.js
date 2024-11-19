import flattenMultilingual from '../lib/events/flattenMultilingual.js';

describe('24 - lib/events - flattenMultilingual', () => {
  test('flattens shallow multilingual fields', () => {
    const flat = flattenMultilingual(['title'], 'fr', {
      title: {
        fr: 'Un titre',
      },
    });

    expect(flat.title).toBe('Un titre');
  });

  test('flattens deep multilingual fields', () => {
    const flat = flattenMultilingual(['location.access'], 'fr', {
      location: {
        access: {
          fr: 'Par ici',
        },
      },
    });

    expect(flat.location.access).toBe('Par ici');
  });
});

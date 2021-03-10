const _ = require('lodash');
const get = require('../server/lib/get');

describe('get', () => {
  test('simple get', () => {
    const object = { un: { test: 'simple' } };

    expect(get(object, 'un.test')).toEqual('simple');
  });

  test('complex get', () => {
    const object = {
      un: {
        test: [
          {
            name: 'unNom',
            prop: 12,
            tags: [
              {
                label: 'Un',
                slug: 'un',
              },
              {
                label: 'Deux',
                slug: 'deux',
              },
            ],
          },
          {
            name: 'other',
            prop: 42,
            tags: [
              {
                label: 'Deux',
                slug: 'deux',
              },
              {
                label: 'Trois',
                slug: 'trois',
              },
            ],
          },
          {
            name: 'unNom',
            prop: 6,
            tags: [
              {
                label: 'Un',
                slug: 'un',
              },
              {
                label: 'Trois',
                slug: 'trois',
              },
            ],
          },
        ],
      },
    };

    expect(
      get(object, 'un.test[name="unNom"]').map(o => _.omit(o, 'tags'))
    ).toEqual([
      {
        name: 'unNom',
        prop: 12,
      },
      {
        name: 'unNom',
        prop: 6,
      },
    ]);

    expect(get(object, 'un.test[name="unNom"].prop')).toEqual([12, 6]);

    expect(get(object, 'un.test[name="other"].tags[].label')).toEqual([
      'Deux',
      'Trois',
    ]);

    expect(get(object, 'un.test[name="unNom"].tags[].label')).toEqual([
      'Un',
      'Deux',
      'Un',
      'Trois',
    ]);

    expect(get(object, 'un.test[0].name')).toEqual('unNom');

    expect(get(object, 'un.test[name="unNom"][0].name')).toEqual('unNom');
  });
});

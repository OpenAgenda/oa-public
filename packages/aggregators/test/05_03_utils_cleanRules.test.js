import cleanRule from '../utils/rules/clean.js';
import dirtyLocationRule from './fixtures/dirtyLocationRule.json' with { type: 'json' };

describe('05 - utils - rules - clean', () => {
  test('transform object is parsed to list of actions', () => {
    const clean = cleanRule({
      query: {
        tags: 'Animation Jeune public',
      },
      transform: {
        tags: {
          $push: ['Animation'],
        },
      },
      required: false,
    });

    expect(clean.actions).toEqual([
      {
        field: 'tags',
        values: { $push: ['Animation'] },
      },
    ]);
  });

  test('clean copy action', () => {
    const clean = cleanRule({
      actions: [
        {
          aggregField: {
            $copy: 'sourceField',
          },
        },
      ],
    });
    expect(clean.actions).toEqual([
      {
        field: 'aggregField',
        values: { $copy: 'sourceField' },
      },
    ]);
  });

  test('state in value is converted to an action', () => {
    const clean = cleanRule({
      query: {
        location: {
          city: "Angles-sur-l'Anglin",
        },
      },
      value: {
        state: 2,
      },
    });

    expect(clean.actions).toEqual([
      {
        field: 'state',
        values: { $set: 2 },
      },
    ]);
  });

  test('geographic query list-values are reduced by geographic type', () => {
    const clean = cleanRule({
      query: {
        location: [
          {
            city: 'Lille',
          },
          {
            city: 'Anstaing',
          },
          {
            city: 'Armentières',
          },
          {
            city: 'Aubers',
          },
          {
            city: 'Baisieux',
          },
          {
            city: 'La Bassée',
          },
        ],
      },
    });

    expect(clean.query.location.city).toEqual([
      'Lille',
      'Anstaing',
      'Armentières',
      'Aubers',
      'Baisieux',
      'La Bassée',
    ]);
  });

  test('location terms are stripped of trailing tabs and spaces', () => {
    expect(cleanRule(dirtyLocationRule).query.location.city).toEqual([
      'Rennes',
      'La Chapelle-des-Fougeretz',
      'Corps-Nuds',
    ]);
  });

  test('timings rule is cleaned up', () => {
    const clean = cleanRule({
      query: {
        timings: {
          gte: '2019-09-21T00:00:00.000Z',
          lte: '2019-09-23T00:00:00.000Z',
        },
      },
      required: true,
    });

    expect(clean).toEqual({
      query: {
        timings: {
          gte: '2019-09-21T00:00:00.000Z',
          lte: '2019-09-23T00:00:00.000Z',
        },
      },
      actions: [],
      required: true,
    });
  });
});

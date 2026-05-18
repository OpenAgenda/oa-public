import _ from 'lodash';
import convertFieldOptionIdsToLabels from '../utils/rules/convertFieldOptionIdsToLabels.js';
import determineAggregationAction from '../utils/determineAggregationAction.js';
import pickReferenceValues from '../utils/pickReferenceValues.js';
import sourcesAdd from '../utils/sources/add.js';

const fixtures = {
  jepOToJEP: (
    await import('./fixtures/evaluate.jep-2019-occitanie.to.albi.json', {
      with: { type: 'json' },
    })
  ).default,
  eventBeforePublish: (
    await import('./fixtures/eventBeforePublish.json', {
      with: { type: 'json' },
    })
  ).default,
  eventNowPublish: (
    await import('./fixtures/eventNowPublish.json', { with: { type: 'json' } })
  ).default,
  eventBeforeUnpublish: (
    await import('./fixtures/eventBeforeUnpublish.json', {
      with: { type: 'json' },
    })
  ).default,
  eventNowUnpublish: (
    await import('./fixtures/eventNowUnpublish.json', {
      with: { type: 'json' },
    })
  ).default,
  eventBeforeChange: (
    await import('./fixtures/eventBeforeChange.json', {
      with: { type: 'json' },
    })
  ).default,
  eventNowChange: (
    await import('./fixtures/eventNowChange.json', { with: { type: 'json' } })
  ).default,
  simpleSourceSchema: (
    await import('./fixtures/simpleSourceSchema.json', {
      with: { type: 'json' },
    })
  ).default,
  simpleAggregatorSchema: (
    await import('./fixtures/simpleAggregatorSchema.json', {
      with: { type: 'json' },
    })
  ).default,
};

describe('05 - utils', () => {
  describe('convertFieldOptionIdsToLabels', () => {
    test('provides the list of labels corresponding to the option ids provided', () => {
      const field = _.find(fixtures.jepOToJEP.aggregatorSchema.fields, {
        field: 'conditions-de-participation',
      });
      const labels = convertFieldOptionIdsToLabels(field, [14]);

      expect(labels).toEqual(['Tarif habituel']);
    });
  });

  describe('pickReferenceValues', () => {
    test('returns values belonging to provided schema', () => {
      const picked = pickReferenceValues(fixtures.jepOToJEP.aggregatorSchema, {
        location: 'dqfdq',
        tags: ['Atelier / Démonstration / Savoir-faire'],
        'types-devenement': 3,
        'conditions-de-participation': [14],
        'diffusion-sur-le-pass-culture': [1],
      });

      expect(picked).toEqual({
        'types-devenement': 3,
        'conditions-de-participation': [14],
        'diffusion-sur-le-pass-culture': [1],
      });
    });

    test('state is returned when set', () => {
      const picked = pickReferenceValues(fixtures.jepOToJEP.aggregatorSchema, {
        state: 1,
      });

      expect(picked).toEqual({ state: 1 });
    });
  });

  describe('determineAggregationAction', () => {
    test('if type is remove, aggregationAction is remove', () => {
      expect(determineAggregationAction('removeEvent')).toBe('removeEvent');
    });

    test('if type is update and event is published action is evaluateEvent', () => {
      expect(
        determineAggregationAction(
          'updateEvent',
          fixtures.eventNowPublish,
          fixtures.eventNowPublish,
        ),
      ).toBe('evaluateEvent');
    });

    test('if type is update, state was not published and now is published, action is evaluate', () => {
      expect(
        determineAggregationAction(
          'updateEvent',
          fixtures.eventBeforePublish,
          fixtures.eventNowPublish,
        ),
      ).toBe('evaluateEvent');
    });

    test('if type is update, state was published and now is not published, action is remove', () => {
      expect(
        determineAggregationAction(
          'updateEvent',
          fixtures.eventBeforeUnpublish,
          fixtures.eventNowUnpublish,
        ),
      ).toBe('removeEvent');
    });

    test('if there are changes in event data on a unchanged state published event, action is evaluate', () => {
      expect(
        determineAggregationAction(
          'updateEvent',
          fixtures.eventBeforeChange,
          fixtures.eventNowChange,
        ),
      ).toBe('evaluateEvent');
    });
  });

  describe('sources/add', () => {
    test('source rules are cleaned, are required by default', async () => {
      const { source } = await sourcesAdd(
        /* mock knex */ () => ({
          insert: async () => [1],
          first: () => ({
            where: () => ({
              then: () => ({ id: 1 }),
            }),
          }),
        }),
        /* mock aggregator agenda */ { id: 1 },
        /* mock source agenda */ { id: 2 }, // mock
        /* source rules */ [
          {
            query: {
              location: {
                city: ['Lille'],
              },
            },
            actions: [
              {
                field: 'state',
                values: {
                  $set: 1,
                },
                automatic: false,
              },
            ],
          },
        ],
      );

      expect(source.rules[0].required).toEqual(true);
    });
  });
});

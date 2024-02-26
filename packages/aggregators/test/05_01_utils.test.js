'use strict';

const _ = require('lodash');

const convertFieldOptionIdsToLabels = require('../utils/rules/convertFieldOptionIdsToLabels');
const determineAggregationAction = require('../utils/determineAggregationAction');
const pickReferenceValues = require('../utils/pickReferenceValues');
const sourcesAdd = require('../utils/sources/add');

/* eslint-disable global-require */
const fixtures = {
  jepOToJEP: require('./fixtures/evaluate.jep-2019-occitanie.to.albi.json'),
  eventBeforePublish: require('./fixtures/eventBeforePublish.json'),
  eventNowPublish: require('./fixtures/eventNowPublish.json'),
  eventBeforeUnpublish: require('./fixtures/eventBeforeUnpublish.json'),
  eventNowUnpublish: require('./fixtures/eventNowUnpublish.json'),
  eventBeforeChange: require('./fixtures/eventBeforeChange.json'),
  eventNowChange: require('./fixtures/eventNowChange.json'),
  simpleSourceSchema: require('./fixtures/simpleSourceSchema.json'),
  simpleAggregatorSchema: require('./fixtures/simpleAggregatorSchema.json'),
};
/* eslint-enable */

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

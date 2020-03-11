'use strict';

const _ = require('lodash');

const convertFieldOptionIdsToLabels = require('../utils/rules/convertFieldOptionIdsToLabels');
const determineAggregationAction = require('../utils/determineAggregationAction');
const pickReferenceValues = require('../utils/pickReferenceValues');
const cleanRule = require('../utils/rules/clean');
const rules = require('../utils/rules');

const fixtures = {
  jepOToJEP: require('./fixtures/evaluate.jep-2019-occitanie.to.albi.json'),
  eventBeforePublish: require('./fixtures/eventBeforePublish.json'),
  eventNowPublish: require('./fixtures/eventNowPublish.json'),
  eventBeforeUnpublish: require('./fixtures/eventBeforeUnpublish'),
  eventNowUnpublish: require('./fixtures/eventNowUnpublish'),
  eventBeforeChange: require('./fixtures/eventBeforeChange'),
  eventNowChange: require('./fixtures/eventNowChange'),
  simpleSourceSchema: require('./fixtures/simpleSourceSchema.json'),
  simpleAggregatorSchema: require('./fixtures/simpleAggregatorSchema.json')
};

describe('05 - utils', () => {

  describe('convertFieldOptionIdsToLabels', () => {

    test(
      'provides the list of labels corresponding to the option ids provided',
      () => {
        const field = _.find(fixtures.jepOToJEP.aggregatorSchema.fields, { field: 'conditions-de-participation' });
        const labels = convertFieldOptionIdsToLabels(field, [14]);

        expect(labels).toEqual(['Tarif habituel']);
      }
    );

  });

  describe('pickReferenceValues', () => {

    test('returns values belonging to provided schema', () => {
      const picked = pickReferenceValues(fixtures.jepOToJEP.aggregatorSchema, {
        location: 'dqfdq',
        tags: ['Atelier / Démonstration / Savoir-faire'],
        'types-devenement': 3,
        'conditions-de-participation': [ 14 ],
        'diffusion-sur-le-pass-culture': [ 1 ]
      });

      expect(picked).toEqual({
        'types-devenement': 3,
        'conditions-de-participation': [ 14 ],
        'diffusion-sur-le-pass-culture': [ 1 ]
      });
    });

    test('state is returned when set', () => {
      const picked = pickReferenceValues(fixtures.jepOToJEP.aggregatorSchema, { state: 1 });

      expect(picked).toEqual({ state: 1 });
    });

  });

  describe('determineAggregationAction', () => {

    test('if type is remove, aggregationAction is remove', () => {
      expect(determineAggregationAction('removeEvent')).toBe('removeEvent');
    });

    test('if type is update but no change is observed, action is null', () => {
      expect(determineAggregationAction('updateEvent', fixtures.eventNowPublish, fixtures.eventNowPublish)).toBeNull();
    });

    test(
      'if type is update, state was not published and now is published, action is evaluate',
      () => {
        expect(
          determineAggregationAction('updateEvent', fixtures.eventBeforePublish, fixtures.eventNowPublish)
        ).toBe('evaluateEvent');
      }
    );

    test(
      'if type is update, state was published and now is not published, action is remove',
      () => {
        expect(
          determineAggregationAction('updateEvent', fixtures.eventBeforeUnpublish, fixtures.eventNowUnpublish)
        ).toBe('removeEvent');
      }
    );

    test(
      'if there are changes in event data on a unchanged state published event, action is evaluate',
      () => {
        expect(
          determineAggregationAction('updateEvent', fixtures.eventBeforeChange, fixtures.eventNowChange)
        ).toBe('evaluateEvent');
      }
    );

  });

  describe('cleanRule', () => {
    test('transform object is parsed to list of actions', () => {
      const clean = cleanRule({
        query: {
          tags: 'Animation Jeune public'
        },
        transform: {
          tags: {
            '$push': ['Animation']
          }
        },
        required : false
      });

      expect(clean.actions).toEqual([{
        field: 'tags',
        values: { '$push' : ['Animation'] }
      }]);
    });

    test('state in value is converted to an action', () => {
      const clean = cleanRule({
        query: {
          location: {
            city: 'Angles-sur-l\'Anglin'
          }
        },
        value: {
          state: 2
        }
      });

      expect(clean.actions).toEqual([{
        field: 'state',
        values: { '$set': 2 }
      }]);
    });

    test('geographic query list-values are reduced by geographic type', () => {
      const clean = cleanRule({
        query: {
          location: [{
            city: 'Lille'
          }, {
            city: 'Anstaing'
          }, {
            city: 'Armentières'
          }, {
            city: 'Aubers'
          }, {
            city: 'Baisieux'
          }, {
            city: 'La Bassée'
          }]
        }
      });

      expect(clean.query.location.city).toEqual([
        'Lille', 'Anstaing', 'Armentières', 'Aubers', 'Baisieux', 'La Bassée'
      ]);
    });
  });
});

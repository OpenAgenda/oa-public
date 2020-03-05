'use strict';

const _ = require('lodash');
const should = require('should');

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

    it('provides the list of labels corresponding to the option ids provided', () => {
      const field = _.find(fixtures.jepOToJEP.aggregatorSchema.fields, { field: 'conditions-de-participation' });
      const labels = convertFieldOptionIdsToLabels(field, [14]);

      labels.should.eql(['Tarif habituel']);
    });

  });

  describe('pickReferenceValues', () => {

    it('returns values belonging to provided schema', () => {
      const picked = pickReferenceValues(fixtures.jepOToJEP.aggregatorSchema, {
        location: 'dqfdq',
        tags: ['Atelier / Démonstration / Savoir-faire'],
        'types-devenement': 3,
        'conditions-de-participation': [ 14 ],
        'diffusion-sur-le-pass-culture': [ 1 ]
      });

      picked.should.eql({
        'types-devenement': 3,
        'conditions-de-participation': [ 14 ],
        'diffusion-sur-le-pass-culture': [ 1 ]
      });
    });

    it('state is returned when set', () => {
      const picked = pickReferenceValues(fixtures.jepOToJEP.aggregatorSchema, { state: 1 });

      picked.should.eql({ state: 1 });
    });

  });

  describe('determineAggregationAction', () => {

    it('if type is remove, aggregationAction is remove', () => {
      determineAggregationAction('removeEvent').should.equal('removeEvent');
    });

    it('if type is update but no change is observed, action is null', () => {
      should(determineAggregationAction('updateEvent', fixtures.eventNowPublish, fixtures.eventNowPublish)).equal(null);
    });

    it('if type is update, state was not published and now is published, action is evaluate', () => {
      determineAggregationAction('updateEvent', fixtures.eventBeforePublish, fixtures.eventNowPublish).should.equal('evaluateEvent');
    });

    it('if type is update, state was published and now is not published, action is remove', () => {
      determineAggregationAction('updateEvent', fixtures.eventBeforeUnpublish, fixtures.eventNowUnpublish).should.equal('removeEvent');
    });

    it('if there are changes in event data on a unchanged state published event, action is evaluate', () => {
      determineAggregationAction('updateEvent', fixtures.eventBeforeChange, fixtures.eventNowChange).should.equal('evaluateEvent');
    });

  });

  describe('cleanRule', () => {
    it('transform object is parsed to list of actions', () => {
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

      clean.actions.should.eql([{
        field: 'tags',
        values: { '$push' : ['Animation'] }
      }]);
    });

    it('state in value is converted to an action', () => {
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

      clean.actions.should.eql([{
        field: 'state',
        values: { '$set': 2 }
      }]);
    });

    it('geographic query list-values are reduced by geographic type', () => {
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

      clean.query.location.city.should.eql([
        'Lille', 'Anstaing', 'Armentières', 'Aubers', 'Baisieux', 'La Bassée'
      ]);
    });
  });
});

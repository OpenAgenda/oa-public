'use strict';

const should = require('should');

const convertTagsToSchemaOptionIds = require('../Aggregators/utils/convertTagsToSchemaOptionIds');
const convertSchemaOptionIdsToTags = require('../Aggregators/utils/convertSchemaOptionIdsToTags');
const determineAggregationAction = require('../Aggregators/utils/determineAggregationAction');
const pickSchemaValues = require('../Aggregators/utils/pickSchemaValues');

const fixtures = {
  jepOToJEP: require('./fixtures/evaluate.jep-2019-occitanie.to.albi.json'),
  eventBeforePublish: require('./fixtures/eventBeforePublish.json'),
  eventNowPublish: require('./fixtures/eventNowPublish.json'),
  eventBeforeUnpublish: require('./fixtures/eventBeforeUnpublish'),
  eventNowUnpublish: require('./fixtures/eventNowUnpublish'),
  eventBeforeChange: require('./fixtures/eventBeforeChange'),
  eventNowChange: require('./fixtures/eventNowChange')
};

describe('Aggregators utils', () => {

  describe('convertTagsToSchemaOptionIds', () => {

    it('provides an object with id selection per field matching provided list of labels', () => {
      const aggregatorSchemaSelectedOptionIds = convertTagsToSchemaOptionIds(fixtures.jepOToJEP.aggregatorSchema, [
        'Offre pass Culture : cet évènement est spécifiquement pensé pour les jeunes de 18 ans. Je souhaite qu’il soit référencé sur le pass Culture. En cochant cette case, j’accepte l’utilisation de ces données par le pass Culture ainsi que les conditions générales d’utilisation de la plateforme : https://docs.passculture.app',
        'Atelier / Démonstration / Savoir-faire',
        'Tarif habituel'
      ]);

      aggregatorSchemaSelectedOptionIds.should.eql({
        'types-devenement': 3,
        'conditions-de-participation': [ 14 ],
        'diffusion-sur-le-pass-culture': [ 1 ]
      });
    });

  });

  describe('convertSchemaOptionIdsToTags', () => {

    it('provides the list of labels corresponding to the option ids provided', () => {
      const tags = convertSchemaOptionIdsToTags(fixtures.jepOToJEP.aggregatorSchema, {
        'types-devenement': 3,
        'conditions-de-participation': [ 14 ],
        'diffusion-sur-le-pass-culture': [ 1 ]
      });

      tags.should.eql([
        'Atelier / Démonstration / Savoir-faire',
        'Tarif habituel',
        'Offre pass Culture : cet évènement est spécifiquement pensé pour les jeunes de 18 ans. Je souhaite qu’il soit référencé sur le pass Culture. En cochant cette case, j’accepte l’utilisation de ces données par le pass Culture ainsi que les conditions générales d’utilisation de la plateforme : https://docs.passculture.app'
      ]);
    });

  });

  describe('pickSchemaValues', () => {

    it('returns values belonging to provided schema', () => {
      const picked = pickSchemaValues(fixtures.jepOToJEP.aggregatorSchema, {
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

});

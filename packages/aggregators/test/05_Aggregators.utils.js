'use strict';

const should = require('should');

const convertTagsToSchemaOptionIds = require('../Aggregators/utils/convertTagsToSchemaOptionIds');
const convertSchemaOptionIdsToTags = require('../Aggregators/utils/convertSchemaOptionIdsToTags');
const determineAggregationAction = require('../Aggregators/utils/determineAggregationAction');
const pickSchemaValues = require('../Aggregators/utils/pickSchemaValues');
const cleanRule = require('../Aggregators/utils/rules/clean');
const rules = require('../Aggregators/utils/rules');

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

  describe('rules', () => {
    // the rules function takes a list of rules and an object against which
    // rules are evaluated. It returns null if the rules dictate that
    // the object does not meet their requirements, or a transformed object
    // deriving from the given input, transformed or not depending on the actions
    // optionnally defined in each provided rule.

    describe('basic usage', () => {

      it('a ruleset that matches a given value returns the value as result', () => {
        const input = {
          thematiques: 1
        };

        const ruleset = [{
          query: {
            thematiques: [1]
          }
        }];

        const result = rules(ruleset, input);

        result.should.eql(input);
      });

      it('a ruleset that does not match a given value return null', () => {
        const input = {
          thematiques: 12
        }

        const ruleset = [{
          query: {
            thematiques: [1]
          }
        }];

        const result = rules(ruleset, input);

        should(result).equal(null);
      });

      it('a non-required rule is not required for a result to be provided', () => {
        const input = {
          thematiques: 12
        }

        const ruleset = [{
          query: {
            thematiques: [1]
          },
          required: false
        }];

        const result = rules(ruleset, input);

        should(result).equal(input);
      });

      it('a matching rule with actions applies actions to provided values to generate result', () => {
        const input = {
          thematiques: 12
        };

        const ruleset = [{
          query: {
            thematiques: [12]
          },
          actions: [{
            categories: 3,
          }, {
            state: 2
          }]
        }];

        const result = rules(ruleset, input);

        result.should.eql({
          thematiques: 12,
          categories: 3,
          state: 2
        });
      });

      it('only matching rules apply their actions to the result', () => {
        const input = {
          thematiques: 12
        };

        const ruleset = [{
          query: {
            thematiques: [12]
          },
          actions: [{
            categories: 3
          }]
        }, {
          query: {
            thematiques: [13]
          },
          actions: [{
            categories: 2
          }],
          required: false
        }];

        const result = rules(ruleset, input);

        result.should.eql({
          thematiques: 12,
          categories: 3
        });
      });
    });

    describe('query', () => {

      it('a query matches if at least one of the defined values of the query is in the provided values', () => {
        const input = {
          thematiques: [12, 19, 20]
        };

        const ruleset = [{
          query: {
            thematiques: [20, 23, 30]
          }
        }];

        rules(ruleset, input).should.eql(input);
      });

      it('a query is required by default', () => {
        const input = {
          thematiques: 1
        };

        const ruleset = [{
          query: {
            thematiques: 2
          }
        }];

        should(rules(ruleset, input)).equal(null);
      });
    });

    describe('actions', () => {

      it('an action overwrites pre-existing values when they are already set', () => {
        const input = {
          thematiques: 12
        };

        const ruleset = [{
          actions: [{
            thematiques: 13
          }]
        }];

        const result = rules(ruleset, input);

        result.should.eql({
          thematiques: 13
        });
      });

      it('an action only overwrites pre-existing values if the corresponding query matches', () => {
        const input = {
          thematiques: [13, 19],
          categorie: 3
        };

        const ruleset = [{
          query: {
            thematiques: [20]
          },
          required: false,
          actions: [{
            thematiques: [22, 23]
          }]
        }, {
          query: {
            thematiques: [13]
          },
          required: false,
          actions: [{
            categorie: 9
          }]
        }];

        const result = rules(ruleset, input);

        result.should.eql({
          thematiques: [13, 19],
          categorie: 9
        });
      });

      it('multiple actions can apply values to same field', () => {
        const input = {};

        const ruleset = [{
          actions: [{
            thematiques: 12
          }, {
            thematiques: 13
          }]
        }];

        const result = rules(ruleset, input);

        result.should.eql({
          thematiques: [12, 13]
        });
      });

      it('operations may be explicited in actions', () => {
        rules([{
          actions: [{
            thematiques: {
              $set: 12
            }
          }, {
            thematiques: {
              $push: [13, 14]
            }
          }]
        }], {}).should.eql({
          thematiques: [12, 13, 14]
        });
      });

      it('$push operations are ignored when set in first action of given field', () => {
        rules([{
          actions: [{
            thematiques: {
              $push: 12
            }
          }, {
            thematiques: {
              $push: [13, 14]
            }
          }]
        }], {
          thematiques: 11
        }).should.eql({
          thematiques: [12, 13, 14]
        });
      });

      it('if a rule has a transform key, it is considered as an action', () => {
        rules([{
          transform: {
            thematiques: {
              $set: 12
            }
          }
        }, {
          actions: [{
            thematiques: {
              $push: [13, 14]
            }
          }]
        }], {
          thematiques: 11
        }).should.eql({
          thematiques: [12, 13, 14]
        });
      });
    });

    describe('tag filters', () => {

      describe('without actions', () => {
        const evaluate = rules.bind(null, [{
          query: {
            tags: ['Tag1']
          }
        }]);

        it('tag evaluate passes if data has tag specified in query', () => {
          evaluate({
            title: 'A thing',
            tags: ['Tag1', 'Tag2']
          }).should.eql({
            title: 'A thing',
            tags: ['Tag1', 'Tag2']
          });
        });

        it('tag evaluate does not pass if data does not have tag specified in query', () => {
          should(evaluate({
            title: 'A thing',
            tags: ['Tag3']
          })).eql(null);
        });

        it('tag evaluate passes event if query does not match if required is false', () => {
          rules({
            query: {
              tags: ['Tag1']
            },
            required: false
          }, {
            title: 'Another thing',
            tags: ['Tag3']
          }).should.eql({
            title: 'Another thing',
            tags: ['Tag3']
          });
        });
      });

      describe('with actions', () => {
        const evaluate = rules.bind(null, {
          query: {
            tags: ['Tag1']
          },
          transform: {
            tags: { $set: ['Tag4'] }
          },
          required: false
        });

        it('if data does not match rule, there is no transform', () => {
          evaluate({
            title: 'Line 77',
            tags: ['Tag2']
          }).should.eql({
            title: 'Line 77',
            tags: ['Tag2']
          });
        });

        it('if data matches rule and a transform is specified, it is applied', () => {
          evaluate({
            title: 'Transformed line 77',
            tags: [ 'Tag1', 'Tag77' ]
          }).should.eql({
            title: 'Transformed line 77',
            tags: [ 'Tag4' ]
          });
        });

        it('multiple transforms can be brought by multiple rules', () => {
          const r = rules([{
            transform: {
              tags: { $set: [] }
            }
          }, {
            query: {
              tags: 'Cinéma - projection'
            },
            transform: {
              tags: { $push: ['Cinéma'] }
            },
            required: false
          }, {
            query: {
              tags: 'Fête / festival'
            },
            transform: {
              tags: { $push: ['Fête - Festival'] }
            },
            required: false
          }], {
            title: 'Evénement de la ville de Lille',
            tags: [ 'Cinéma - projection', 'Fête / festival' ]
          }).should.eql({
            title: 'Evénement de la ville de Lille',
            tags: [ 'Cinéma', 'Fête - Festival' ]
          })
        });
      });

    });

    describe('location filters', () => {

      const evaluate = rules.bind(null, [{
        query: {
          location: {
            region: 'Ile-de-France',
            city: 'Courbevoie'
          }
        }
      }])

      it('if one location evaluated field does not match, the rule does not match', () => {
        should(evaluate({
          location: {
            name: 'La boutique',
            city: 'Paris',
            region: 'Ile-de-France'
          }
        })).equal(null);
      });

      it('evaluation passes if all specified location fields pass', () => {
        evaluate({
          location: {
            name: 'Chez oim',
            region: 'Ile-de-France',
            city: 'Courbevoie'
          }
        }).should.eql({
          location: {
            name: 'Chez oim',
            region: 'Ile-de-France',
            city: 'Courbevoie'
          }
        });
      });

      it('when multiple locations are specified in the same rule, operand is OR', () => {
        rules([{
          query: {
            location: [{
              city: 'Bordeaux'
            }, {
              city: 'Toulouse'
            }]
          }
        }], {
          location: {
            city: 'Toulouse'
          }
        }).should.eql({
          location: {
            city: 'Toulouse'
          }
        });
      });

      it('multiple values can be specified in the same filter field for an OR evaluation', () => {
        rules([{
          query: {
            location: {
              city: ['Bordeaux', 'Toulouse']
            }
          }
        }], {
          location: {
            city: 'Toulouse'
          }
        }).should.eql({
          location: {
            city: 'Toulouse'
          }
        });
      });

    });

    describe('legacy', () => {
      it('evaluation based on boolean value passes if boolean is same', () => {
        rules([{
          query: {
            intercommunal_interest: true
          }
        }], {
          intercommunal_interest: true
        }).should.eql({
          intercommunal_interest: true
        });
      });

      it('evaluation based on boolean value does not pass if boolean is different', () => {
        should(rules([{
          query: {
            intercommunal_interest: true
          }
        }], {
          intercommunal_interest: false
        })).equal(null);
      });
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
        tags: {
          '$push': ['Animation']
        }
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
        state: {
          $set: 2
        }
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

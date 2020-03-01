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

  describe('rules', () => {
    // the rules function takes a list of rules and an object against which
    // rules are evaluated. It returns null if the rules dictate that
    // the object does not meet their requirements, or a transformed object
    // deriving from the given input, transformed or not depending on the actions
    // optionnally defined in each provided rule.

    describe('basic usage', () => {

      it('a ruleset that matches a given value returns the data to be associated to the event when added to an aggregator', () => {
        const input = {
          thematiques: 1
        };

        const ruleset = [{
          query: {
            thematiques: [1]
          }
        }];

        const result = rules(ruleset, null, null, input);

        result.should.eql({});
      });

      it('a ruleset that does not match a given value return null', () => {
        const input = {
          thematiques: 12
        };

        const ruleset = [{
          query: {
            thematiques: [1]
          }
        }];

        const result = rules(ruleset, null, null, input);

        should(result).equal(null);
      });

      it('if provided schemas share the same fields, the values are maintained in response', () => {
        const input = {
          thematiques: 1
        }

        const ruleset = [{
          query: {
            thematiques: [1]
          }
        }];

        const field = {
          field: 'thematiques',
          fieldType: 'checkbox',
          schemaId: 1000
        };

        const sourceSchema = { fields: [field] };
        const aggregatorSchema = { fields: [field] };

        const result = rules(ruleset, sourceSchema, aggregatorSchema, input);

        result.should.eql({
          thematiques: 1
        });
      })

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

        const result = rules(ruleset, null, null, input);

        should(result).eql({});
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

        const result = rules(ruleset, null, null, input);

        result.should.eql({
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

        const result = rules(ruleset, null, null, input);

        result.should.eql({
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

        rules(ruleset, null, null, input).should.eql({});
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

        should(rules(ruleset, null, null, input)).equal(null);
      });
    });

    describe('actions', () => {

      it('an action overwrites pre-existing values when they are already set', () => {
        const input = {
          thematiques: 12
        };

        const ruleset = [{
          actions: [{
            field: 'thematiques',
            values: 13
          }]
        }];

        const result = rules(ruleset, null, null, input);

        result.should.eql({
          thematiques: 13
        });
      });

      it('same as previous, with legacy action structure (overwrite preexisting)', () => {
        const input = {
          thematiques: 12
        };

        const ruleset = [{
          actions: [{
            thematiques: 13
          }]
        }];

        const result = rules(ruleset, null, null, input);

        result.should.eql({
          thematiques: 13
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

        const result = rules(ruleset, null, null, input);

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
        }], null, null, {}).should.eql({
          thematiques: [12, 13, 14]
        });
      });

      it('if set is specified, previous values are overwritten', () => {
        rules([{
          actions: [{
            thematiques: {
              $push: 12
            }
          }, {
            thematiques: {
              $set: [13, 14]
            }
          }]
        }], null, null, {
          thematiques: 11
        }).should.eql({
          thematiques: [13, 14]
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
        }], null, null, {
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
        }], null, null, {
          thematiques: 11
        }).should.eql({
          thematiques: [12, 13, 14]
        });
      });
    });

    describe('automatic actions', () => {

      it('associates id by matching on label when automatic is true', () => {
        const result = rules([{
          actions: [{
            field: 'category',
            automatic: true
          }]
        }], fixtures.simpleSourceSchema, fixtures.simpleAggregatorSchema, {
          title: 'Mon event',
          category: 12,
          type: 1
        });

        result.should.eql({
          category: [22]
        });
      });

      it('label matching looks for match on all sources optioned fields', () => {
        const result = rules([{
          actions: [{
            field: 'category',
            automatic: true
          }]
        }], fixtures.simpleSourceSchema, fixtures.simpleAggregatorSchema, {
          title: 'Mon event',
          type: 3 // this option in agg has a label which matches one in some other field in source
        });

        result.should.eql({
          category: [39]
        });
      });

    });

    describe('label filters', () => {

      const sourceAgendaSchema = {
        fields: [{
          field: 'tags',
          fieldType: 'radio',
          options: [{
            id: 1,
            label: {
              fr: 'Tag1'
            }
          }, {
            id: 2,
            label: {
              fr: 'Tag2'
            }
          }, {
            id: 3,
            label: {
              fr: 'Tag3'
            }
          }, {
            id: 4,
            label: {
              fr: 'Tag4'
            }
          }]
        }]
      };

      const aggregatorAgendaSchema = {
        fields: [{
          field: 'type',
          fieldType: 'checkbox',
          options: [{
            id: 1,
            label: 'Type1'
          }, {
            id: 21,
            label: 'Type21'
          }]
        }]
      };

      describe('without actions', () => {

        const evaluate = rules.bind(null, [{
          query: {
            tags: ['Tag1']
          }
        }], sourceAgendaSchema, null);

        it('tag evaluate passes if data has tag specified in query', () => {
          evaluate({
            title: 'A thing',
            tags: [1, 2]
          }).should.eql({});
        });

        it('tag evaluate does not pass if data does not have tag specified in query', () => {
          should(evaluate({
            title: 'A thing',
            tags: [3]
          })).eql(null);
        });

        it('tag evaluate passes event if query does not match if required is false', () => {
          rules({
            query: {
              tags: ['Tag1']
            },
            required: false
          }, sourceAgendaSchema, null, {
            title: 'Another thing',
            tags: [3]
          }).should.eql({});
        });
      });

      describe('with actions', () => {
        const evaluate = rules.bind(null, {
          query: {
            tags: ['Tag1']
          },
          transform: {
            type: { $set: [1] }
          },
          required: false
        }, sourceAgendaSchema, aggregatorAgendaSchema);

        it('if data does not match rule, there is no transform', () => {
          evaluate({
            title: 'Line 77',
            tags: [2]
          }).should.eql({});
        });

        it('if data matches rule and a transform is specified, it is applied', () => {
          evaluate({
            title: 'Transformed line 77',
            tags: [1, 33]
          }).should.eql({
            type: [1]
          });
        });

        it('multiple transforms can be brought by multiple rules', () => {
          const r = rules([{
            transform: {
              type: { $set: [] }
            }
          }, {
            query: {
              tags: ['Tag2']
            },
            transform: {
              type: { $push: [1] }
            },
            required: false
          }, {
            query: {
              tags: ['Tag3']
            },
            transform: {
              type: { $push: [21] }
            },
            required: false
          }], sourceAgendaSchema, aggregatorAgendaSchema, {
            title: 'Evénement de la ville de Lille',
            tags: [2, 3]
          }).should.eql({
            type: [1, 21]
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
      }], null, null);

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
        }).should.eql({});
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
        }], null, null, {
          location: {
            city: 'Toulouse'
          }
        }).should.eql({});
      });

      it('multiple values can be specified in the same filter field for an OR evaluation', () => {
        rules([{
          query: {
            location: {
              city: ['Bordeaux', 'Toulouse']
            }
          }
        }], null, null, {
          location: {
            city: 'Toulouse'
          }
        }).should.eql({});
      });
    });

    describe('legacy', () => {
      it('evaluation based on boolean value passes if boolean is same', () => {
        rules([{
          query: {
            intercommunal_interest: true
          }
        }], null, null, {
          intercommunal_interest: true
        }).should.eql({});
      });

      it('evaluation based on boolean value does not pass if boolean is different', () => {
        should(rules([{
          query: {
            intercommunal_interest: true
          }
        }], null, null, {
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

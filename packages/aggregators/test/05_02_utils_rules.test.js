'use strict';

const rules = require('../utils/rules');

const { getJSON } = require('./utils');

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
  duplicates: getJSON('./fixtures/evaluateRules/duplicates'),
};
/* esint-enable */

describe('05_02 - utils - rules', () => {
  // the rules function takes a list of rules and an object against which
  // rules are evaluated. It returns null if the rules dictate that
  // the object does not meet their requirements, or a transformed object
  // deriving from the given input, transformed or not depending on the actions
  // optionnally defined in each provided rule.

  describe('basic usage', () => {
    test('a ruleset that matches a given value returns the data to be associated to the event when added to an aggregator', () => {
      const input = {
        thematiques: 1,
      };

      const ruleset = [
        {
          query: {
            thematiques: [1],
          },
        },
      ];

      const result = rules(ruleset, null, null, input);

      expect(result).toEqual({});
    });

    test('a ruleset that does not match a given value return null', () => {
      const input = {
        thematiques: 12,
      };

      const ruleset = [
        {
          query: {
            thematiques: [1],
          },
          required: true,
        },
      ];

      const result = rules(ruleset, null, null, input);

      expect(result).toBeNull();
    });

    test('if provided schemas share the same fields, the values are maintained in response', () => {
      const input = {
        thematiques: 1,
      };

      const ruleset = [
        {
          query: {
            thematiques: [1],
          },
        },
      ];

      const field = {
        field: 'thematiques',
        fieldType: 'checkbox',
        schemaId: 1000,
      };

      const sourceSchema = { fields: [field] };
      const aggregatorSchema = { fields: [field] };

      const result = rules(ruleset, sourceSchema, aggregatorSchema, input);

      expect(result).toEqual({
        thematiques: 1,
      });
    });

    test('a non-required rule is not required for a result to be provided', () => {
      const input = {
        thematiques: 12,
      };

      const ruleset = [
        {
          query: {
            thematiques: [1],
          },
          required: false,
        },
      ];

      const result = rules(ruleset, null, null, input);

      expect(result).toEqual({});
    });

    test('a matching rule with actions applies actions to provided values to generate result', () => {
      const input = {
        thematiques: 12,
      };

      const ruleset = [
        {
          query: {
            thematiques: [12],
          },
          actions: [
            {
              categories: 3,
            },
            {
              state: 2,
            },
          ],
        },
      ];

      const result = rules(ruleset, null, null, input);

      expect(result).toEqual({
        categories: 3,
        state: 2,
      });
    });

    test('if state is set multiple actions, last state is applied state only if $set is used', () => {
      const ruleset = [
        {
          actions: [
            {
              state: 1,
            },
            {
              state: {
                $set: 2,
              },
            },
          ],
        },
      ];

      const result = rules(ruleset, null, null, {});

      expect(result.state).toBe(2);
    });

    test('only matching rules apply their actions to the result', () => {
      const input = {
        thematiques: 12,
      };

      const ruleset = [
        {
          query: {
            thematiques: [12],
          },
          actions: [
            {
              categories: 3,
            },
          ],
        },
        {
          query: {
            thematiques: [13],
          },
          actions: [
            {
              categories: 2,
            },
          ],
          required: false,
        },
      ];

      const result = rules(ruleset, null, null, input);

      expect(result).toEqual({
        categories: 3,
      });
    });
  });

  describe('query', () => {
    test('a query matches if at least one of the defined values of the query is in the provided values', () => {
      const input = {
        thematiques: [12, 19, 20],
      };

      const ruleset = [
        {
          query: {
            thematiques: [20, 23, 30],
          },
        },
      ];

      expect(rules(ruleset, null, null, input)).toEqual({});
    });

    test('a query is required by default', () => {
      const input = {
        thematiques: 1,
      };

      const ruleset = [
        {
          query: {
            thematiques: 2,
          },
        },
      ];

      expect(rules(ruleset, null, null, input)).toBeNull();
    });
  });

  describe('actions', () => {
    test('an action overwrites pre-existing values when they are already set', () => {
      const input = {
        thematiques: 12,
      };

      const ruleset = [
        {
          actions: [
            {
              field: 'thematiques',
              values: 13,
            },
          ],
        },
      ];

      const result = rules(ruleset, null, null, input);

      expect(result).toEqual({
        thematiques: 13,
      });
    });

    test('same as previous, with legacy action structure (overwrite preexisting)', () => {
      const input = {
        thematiques: 12,
      };

      const ruleset = [
        {
          actions: [
            {
              thematiques: 13,
            },
          ],
        },
      ];

      const result = rules(ruleset, null, null, input);

      expect(result).toEqual({
        thematiques: 13,
      });
    });

    test('multiple actions can apply values to same field', () => {
      const input = {};

      const ruleset = [
        {
          actions: [
            {
              thematiques: 12,
            },
            {
              thematiques: 13,
            },
          ],
        },
      ];

      const result = rules(ruleset, null, null, input);

      expect(result).toEqual({
        thematiques: [12, 13],
      });
    });

    test('operations may be explicited in actions', () => {
      expect(
        rules(
          [
            {
              actions: [
                {
                  thematiques: {
                    $set: 12,
                  },
                },
                {
                  thematiques: {
                    $push: [13, 14],
                  },
                },
              ],
            },
          ],
          null,
          null,
          {}
        )
      ).toEqual({
        thematiques: [12, 13, 14],
      });
    });

    test('if set is specified, previous values are overwritten', () => {
      expect(
        rules(
          [
            {
              actions: [
                {
                  thematiques: {
                    $push: 12,
                  },
                },
                {
                  thematiques: {
                    $set: [13, 14],
                  },
                },
              ],
            },
          ],
          null,
          null,
          {
            thematiques: 11,
          }
        )
      ).toEqual({
        thematiques: [13, 14],
      });
    });

    test('$push operations are ignored when set in first action of given field', () => {
      expect(
        rules(
          [
            {
              actions: [
                {
                  thematiques: {
                    $push: 12,
                  },
                },
                {
                  thematiques: {
                    $push: [13, 14],
                  },
                },
              ],
            },
          ],
          null,
          null,
          {
            thematiques: 11,
          }
        )
      ).toEqual({
        thematiques: [12, 13, 14],
      });
    });

    test('if a rule has a transform key, it is considered as an action', () => {
      expect(
        rules(
          [
            {
              transform: {
                thematiques: {
                  $set: 12,
                },
              },
            },
            {
              actions: [
                {
                  thematiques: {
                    $push: [13, 14],
                  },
                },
              ],
            },
          ],
          null,
          null,
          {
            thematiques: 11,
          }
        )
      ).toEqual({
        thematiques: [12, 13, 14],
      });
    });

    test('action on text Field', () => {
      const input = {
        content: 'test',
      };

      const ruleset = [
        {
          actions: [
            {
              field: 'content',
              values: 'test2',
            },
          ],
        },
      ];

      const result = rules(ruleset, null, null, input);

      expect(result).toEqual({
        content: 'test2',
      });
    });
  });

  describe('automatic actions', () => {
    test('associates id by matching on label when automatic is true', () => {
      const result = rules(
        [
          {
            actions: [
              {
                field: 'category',
                automatic: true,
              },
            ],
          },
        ],
        fixtures.simpleSourceSchema,
        fixtures.simpleAggregatorSchema,
        {
          title: 'Mon event',
          category: 12,
          type: 1,
        }
      );

      expect(result).toEqual({
        category: [22],
      });
    });

    test('label matching looks for match on all sources optioned fields', () => {
      const result = rules(
        [
          {
            actions: [
              {
                field: 'category',
                automatic: true,
              },
            ],
          },
        ],
        fixtures.simpleSourceSchema,
        fixtures.simpleAggregatorSchema,
        {
          title: 'Mon event',
          type: 3, // this option in agg has a label which matches one in some other field in source
        }
      );

      expect(result).toEqual({
        category: [39],
      });
    });
  });

  describe('label filters', () => {
    const sourceAgendaSchema = {
      fields: [
        {
          field: 'tags',
          fieldType: 'radio',
          options: [
            {
              id: 1,
              label: {
                fr: 'Tag1',
              },
            },
            {
              id: 2,
              label: {
                fr: 'Tag2',
              },
            },
            {
              id: 3,
              label: {
                fr: 'Tag3',
              },
            },
            {
              id: 4,
              label: {
                fr: 'Tag4',
              },
            },
          ],
        },
      ],
    };

    const aggregatorAgendaSchema = {
      fields: [
        {
          field: 'type',
          fieldType: 'checkbox',
          options: [
            {
              id: 1,
              label: 'Type1',
            },
            {
              id: 21,
              label: 'Type21',
            },
          ],
        },
      ],
    };

    describe('without actions', () => {
      const evaluate = rules.bind(
        null,
        [
          {
            query: {
              tags: ['Tag1'],
            },
          },
        ],
        sourceAgendaSchema,
        null
      );

      test('tag evaluate passes if data has tag specified in query', () => {
        expect(
          evaluate({
            title: 'A thing',
            tags: [1, 2],
          })
        ).toEqual({});
      });

      test('tag evaluate does not pass if data does not have tag specified in query', () => {
        expect(
          evaluate({
            title: 'A thing',
            tags: [3],
          })
        ).toBe(null);
      });

      test('tag evaluate passes event if query does not match if required is false', () => {
        expect(
          rules(
            {
              query: {
                tags: ['Tag1'],
              },
              required: false,
            },
            sourceAgendaSchema,
            null,
            {
              title: 'Another thing',
              tags: [3],
            }
          )
        ).toEqual({});
      });
    });

    describe('with actions', () => {
      const evaluate = rules.bind(
        null,
        {
          query: {
            tags: ['Tag1'],
          },
          transform: {
            type: { $set: [1] },
          },
          required: false,
        },
        sourceAgendaSchema,
        aggregatorAgendaSchema
      );

      test('if data does not match rule, there is no transform', () => {
        expect(
          evaluate({
            title: 'Line 77',
            tags: [2],
          })
        ).toEqual({});
      });

      test('if data matches rule and a transform is specified, it is applied', () => {
        expect(
          evaluate({
            title: 'Transformed line 77',
            tags: [1, 33],
          })
        ).toEqual({
          type: [1],
        });
      });

      test('multiple transforms can be brought by multiple rules', () => {
        expect(
          rules(
            [
              {
                transform: {
                  type: { $set: [] },
                },
              },
              {
                query: {
                  tags: ['Tag2'],
                },
                transform: {
                  type: { $push: [1] },
                },
                required: false,
              },
              {
                query: {
                  tags: ['Tag3'],
                },
                transform: {
                  type: { $push: [21] },
                },
                required: false,
              },
            ],
            sourceAgendaSchema,
            aggregatorAgendaSchema,
            {
              title: 'Evénement de la ville de Lille',
              tags: [2, 3],
            }
          )
        ).toEqual({
          type: [1, 21],
        });
      });
    });
  });

  describe('location filters', () => {
    const evaluate = rules.bind(
      null,
      [
        {
          query: {
            location: {
              region: 'Ile-de-France',
              city: 'Courbevoie',
            },
          },
        },
      ],
      null,
      null
    );

    test('if one location evaluated field does not match, the rule does not match', () => {
      expect(
        evaluate({
          location: {
            name: 'La boutique',
            city: 'Paris',
            region: 'Ile-de-France',
          },
        })
      ).toBeNull();
    });

    test('evaluation passes if all specified location fields pass', () => {
      expect(
        evaluate({
          location: {
            name: 'Chez oim',
            region: 'Ile-de-France',
            city: 'Courbevoie',
          },
        })
      ).toEqual({});
    });

    test('when multiple locations are specified in the same rule, operand is OR', () => {
      expect(
        rules(
          [
            {
              query: {
                location: [
                  {
                    city: 'Bordeaux',
                  },
                  {
                    city: 'Toulouse',
                  },
                ],
              },
            },
          ],
          null,
          null,
          {
            location: {
              city: 'Toulouse',
            },
          }
        )
      ).toEqual({});
    });

    test('multiple values can be specified in the same filter field for an OR evaluation', () => {
      expect(
        rules(
          [
            {
              query: {
                location: {
                  city: ['Bordeaux', 'Toulouse'],
                },
              },
            },
          ],
          null,
          null,
          {
            location: {
              city: 'Toulouse',
            },
          }
        )
      ).toEqual({});
    });

    test('rule on location name', () => {
      expect(
        rules(
          [
            {
              query: {
                location: [
                  {
                    name: 'Palais tokyo',
                  },
                ],
              },
            },
          ],
          null,
          null,
          {
            location: {
              name: 'Palais tokyo',
            },
          }
        )
      ).toEqual({});
    });
  });

  describe('legacy', () => {
    test('evaluation based on boolean value passes if boolean is same', () => {
      expect(
        rules(
          [
            {
              query: {
                intercommunal_interest: true,
              },
            },
          ],
          null,
          null,
          {
            intercommunal_interest: true,
          }
        )
      ).toEqual({});
    });

    test('evaluation based on boolean value does not pass if boolean is different', () => {
      expect(
        rules(
          [
            {
              query: {
                intercommunal_interest: true,
              },
            },
          ],
          null,
          null,
          {
            intercommunal_interest: false,
          }
        )
      ).toBeNull();
    });
  });

  describe('text filter', () => {
    test('simple string', () => {
      expect(
        rules(
          [
            {
              query: {
                text: {
                  title: '92ORG',
                },
              },
            },
          ],
          null,
          null,
          {
            title: '092ORG',
          }
        )
      ).toEqual({});
    });
    test('simple string no match', () => {
      expect(
        rules(
          [
            {
              query: {
                text: {
                  organisateur: '92ORG',
                },
              },
            },
          ],
          null,
          null,
          {
            orga: '92ORG',
            organisateur: '92RG92',
          }
        )
      ).toBeNull();
    });
    test('array string', () => {
      expect(
        rules(
          [
            {
              query: {
                text: {
                  organisateur: '92ORG',
                },
              },
            },
          ],
          null,
          null,
          {
            organisateur: ['92ORG920', '10'], // ['92ORG920'] <- ça plutot
          }
        )
      ).toEqual({});
    });
    test('multilang string', () => {
      expect(
        rules(
          [
            {
              query: {
                text: {
                  organisateur: '92ORG',
                },
              },
            },
          ],
          null,
          null,
          {
            organisateur: { fr: '92ORG_2020', en: '2020-921ORG' },
          }
        )
      ).toEqual({});
    });
    test('multilang array string', () => {
      expect(
        rules(
          [
            {
              query: {
                text: {
                  organisateur: '92ORG',
                },
              },
            },
          ],
          null,
          null,
          {
            organisateur: { fr: ['92ORG_2020'], en: ['2020-921ORG', '10'] },
          }
        )
      ).toEqual({});
    });
    test('simple string, case option true', () => {
      expect(
        rules(
          [
            {
              query: {
                text: {
                  title: '92ORG',
                  caseSensitive: true,
                },
              },
            },
          ],
          null,
          null,
          {
            title: '092org',
          }
        )
      ).toEqual(null);
    });
    test('simple string, case option false', () => {
      expect(
        rules(
          [
            {
              query: {
                text: {
                  title: '92ORG',
                  caseSensitive: false,
                },
              },
            },
          ],
          null,
          null,
          {
            title: '092org',
          }
        )
      ).toEqual({});
    });
    test('longDesc', () => {
      expect(
        rules(
          [
            {
              query: {
                text: {
                  longDescription: 'description Longue',
                  caseSensitive: false,
                },
              },
            },
          ],
          null,
          null,
          {
            longDescription: { fr: 'ceci est dans la description longue' },
          }
        )
      ).toEqual({});
    });

    test('wholeValue valid', () => {
      expect(
        rules(
          [
            {
              query: {
                text: {
                  fdldf: null,
                  caseSensitive: false,
                  wholeValue: true,
                },
              },
            },
          ],
          null,
          null,
          {
            fdldf: null,
          },
        ),
      ).toEqual({});
    });

    test('wholeValue invalid', () => {
      expect(
        rules(
          [
            {
              query: {
                text: {
                  fdldf: null,
                  caseSensitive: false,
                  wholeValue: true,
                },
              },
            },
          ],
          null,
          null,
          {
            fdldf: 're',
          },
        ),
      ).toEqual(null);
    });
  });

  describe('attendanceMode', () => {
    test('attendanceMode match', () => {
      expect(
        rules(
          [
            {
              query: {
                attendanceMode: [1, 3],
              },
            },
          ],
          null,
          null,
          {
            attendanceMode: 3,
          }
        )
      ).toEqual({});
    });
    test('attendanceMode no match', () => {
      expect(
        rules(
          [
            {
              query: {
                attendanceMode: [1, 3],
              },
            },
          ],
          null,
          null,
          {
            attendanceMode: 2,
          }
        )
      ).toBeNull();
    });
  });

  describe('fix', () => {
    test('avoid piling up duplicates', () => {
      const {
        rules: listOfRules,
        sourceAgendaFormSchema,
        aggregatorSchema,
        event,
      } = fixtures.duplicates;

      const result = rules(
        listOfRules,
        sourceAgendaFormSchema,
        aggregatorSchema,
        event
      );

      expect(result.intermunicipal_interest).toEqual([1]);
    });
  });
});

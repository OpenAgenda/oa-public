'use strict';

const { ruleToValues, valuesToRule } = require('../src/utils/rules');

const aggregatorAgendaSchema = require('./fixtures/aggregatorAgendaSchema.json');
const aggAgendaSchema2 = require('./fixtures/aggregatorAgendaSchema.2.json');

describe('utils - rules', () => {
  describe('ruleToValues', () => {
    it('simple', () => {
      const values = ruleToValues(
        {
          query: {},
          required: false,
          actions: [
            {
              field: 'categories-metropolitaines',
              values: [28],
              automatic: false
            },
            {
              field: 'state',
              values: {
                $set: 0
              },
              automatic: false
            }
          ]
        },
        aggregatorAgendaSchema
      );

      expect(values).toEqual({
        withFilter: false,
        withActions: true,
        required: false,
        actions: [
          {
            id: '1',
            field: 'categories-metropolitaines',
            values: [28],
            set: false
          },
          { id: '2', field: 'state', values: 0 }
        ]
      });
    });

    it('if values of an action are wrapped in a $set, set boolean in matching result is true', () => {
      const values = ruleToValues(
        {
          query: {},
          required: false,
          actions: [
            {
              field: 'categories-metropolitaines',
              values: { $set: [28] },
              automatic: false
            }
          ]
        },
        aggregatorAgendaSchema
      );

      expect(values.actions[0].set).toEqual(true);
    });

    it('withActions bool is true when actions are defined', () => {
      const values = ruleToValues(
        {
          query: {
            location: {
              department: ['Loiret']
            }
          },
          actions: [
            {
              field: 'categorie-principale',
              values: [93],
              automatic: false
            },
            {
              field: 'state',
              values: {
                $set: 2
              },
              automatic: false
            }
          ],
          required: true
        },
        aggAgendaSchema2
      );

      expect(values.withActions).toBe(true);
    });
  });

  describe('valuesToRule', () => {
    it('simple', () => {
      const rule = valuesToRule(
        {
          withFilter: false,
          withActions: true,
          required: false,
          actions: [
            { id: '1', field: 'categories-metropolitaines', values: [28] },
            { id: '2', field: 'state', values: 0 }
          ]
        },
        aggregatorAgendaSchema
      );

      expect(rule).toEqual({
        query: {},
        required: false,
        actions: [
          {
            field: 'categories-metropolitaines',
            values: [28],
            automatic: false
          },
          {
            field: 'state',
            values: { $set: 0 },
            automatic: false
          }
        ]
      });
    });

    it('if set boolean is set, values are wrapped with $set clause', () => {
      const rule = valuesToRule(
        {
          withFilter: false,
          withActions: true,
          required: false,
          actions: [
            {
              id: '1',
              field: 'categories-metropolitaines',
              values: [28],
              set: true
            }
          ]
        },
        aggregatorAgendaSchema
      );

      expect(rule.actions[0].values).toEqual({ $set: [28] });
    });
  });
});

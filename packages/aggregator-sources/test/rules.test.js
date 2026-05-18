import { ruleToValues, valuesToRule } from '../src/utils/rules.js';
import aggregatorAgendaSchema from './fixtures/aggregatorAgendaSchema.json' with { type: 'json' };
import aggAgendaSchema2 from './fixtures/aggregatorAgendaSchema.2.json' with { type: 'json' };

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
              automatic: false,
            },
            {
              field: 'state',
              values: {
                $set: 0,
              },
              automatic: false,
            },
          ],
        },
        aggregatorAgendaSchema,
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
            set: false,
          },
          { id: '2', field: 'state', values: 0 },
        ],
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
              automatic: false,
            },
          ],
        },
        aggregatorAgendaSchema,
      );

      expect(values.actions[0].set).toEqual(true);
    });

    it('withActions bool is true when actions are defined', () => {
      const values = ruleToValues(
        {
          query: {
            location: {
              department: ['Loiret'],
            },
          },
          actions: [
            {
              field: 'categorie-principale',
              values: [93],
              automatic: false,
            },
            {
              field: 'state',
              values: {
                $set: 2,
              },
              automatic: false,
            },
          ],
          required: true,
        },
        aggAgendaSchema2,
      );

      expect(values.withActions).toBe(true);
    });

    it('with text query', () => {
      const values = ruleToValues(
        {
          query: {
            text: {
              organisateur: '92ORG',
            },
          },
          actions: [],
          required: true,
        },
        aggAgendaSchema2,
      );
      expect(values).toEqual({
        withFilter: true,
        withActions: false,
        required: true,
        actions: [],
        caseSensitive: false,
        type: 'text',
        textField: 'organisateur',
        textValue: '92ORG',
        wholeValue: false,
      });
    });

    it('with text copy action', () => {
      const values = ruleToValues(
        {
          query: {},
          actions: [
            {
              automatic: false,
              field: 'customtextField',
              values: {
                $copy: 'another-text-field',
              },
            },
          ],
          required: false,
        },
        aggregatorAgendaSchema,
      );
      expect(values.actions[0].copyValues).toEqual('another-text-field');
    });

    it('with language filter', () => {
      const values = ruleToValues(
        {
          query: {
            languages: ['es', 'en'],
          },
          actions: [],
          required: true,
        },
        aggregatorAgendaSchema,
      );
      expect(values).toEqual({
        actions: [],
        withActions: false,
        withFilter: true,
        required: true,
        type: 'languages',
        languages: ['es', 'en'],
      });
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
            { id: '2', field: 'state', values: 0 },
          ],
        },
        aggregatorAgendaSchema,
      );

      expect(rule).toEqual({
        query: {},
        required: false,
        actions: [
          {
            field: 'categories-metropolitaines',
            values: [28],
            automatic: false,
          },
          {
            field: 'state',
            values: { $set: 0 },
            automatic: false,
          },
        ],
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
              set: true,
            },
          ],
        },
        aggregatorAgendaSchema,
      );

      expect(rule.actions[0].values).toEqual({ $set: [28] });
    });

    it('if required is not specified, defaults to false', () => {
      const rule = valuesToRule(
        {
          withFilter: false,
          withActions: true,
          actions: [
            {
              id: '1',
              field: 'categories-metropolitaines',
              values: [28],
              set: true,
            },
          ],
        },
        aggregatorAgendaSchema,
      );

      expect(rule.required).toEqual(false);
    });
    it('with text filter', () => {
      const rule = valuesToRule({
        withFilter: true,
        withActions: false,
        required: true,
        actions: [],
        type: 'text',
        textField: 'organisateur',
        textValue: '92ORG',
      });
      expect(rule).toEqual({
        query: { text: { organisateur: '92ORG' } },
        required: true,
        actions: [],
      });
    });
    it('with text copy action', () => {
      const rule = valuesToRule(
        {
          withFilter: false,
          withActions: true,
          actions: [
            {
              id: '1',
              field: 'customtextField',
              copyValues: 'another-text-field',
            },
          ],
        },
        aggregatorAgendaSchema,
      );
      expect(rule).toEqual({
        actions: [
          {
            automatic: false,
            field: 'customtextField',
            values: {
              $copy: 'another-text-field',
            },
          },
        ],
        query: {},
        required: false,
      });
    });
    it('with language filter', () => {
      const rule = valuesToRule(
        {
          withFilter: true,
          type: 'languages',
          languages: ['es', 'de'],
          required: true,
        },
        aggregatorAgendaSchema,
      );
      expect(rule).toEqual({
        query: {
          languages: ['es', 'de'],
        },
        actions: [],
        required: true,
      });
    });
  });
});

import _ from 'lodash';
import { getLocaleValue } from '@openagenda/intl';

export function hasFilter(rule) {
  if (!rule.query) return false;
  if (!Object.keys(rule.query).length) return false;
  return true;
}

export function hasValues(rule) {
  return rule.actions && rule.actions.length;
}

export function ruleToValues(rule, aggregatorAgendaSchema) {
  if (!rule) {
    return {};
  }

  const {
    query, required, transform = [], actions = transform
  } = rule;

  const result = {
    withFilter: false,
    withActions: false,
    required: Boolean(required),
    actions: [],
  };

  if (!query) {
    // legacy rule
    return result;
  }

  if (aggregatorAgendaSchema) {
    [].concat(actions).forEach(action => {
      if (!action) {
        return;
      }

      const hasSet = action.values?.$set !== undefined;

      const ids = hasSet ? action.values.$set : action.values;

      if (action.field === 'state') {
        result.actions.push({
          id: _.uniqueId(),
          field: 'state',
          values: ids,
        });
      }

      const fieldSchema = aggregatorAgendaSchema.fields.find(
        v => v.field === action.field
      );

      if (!fieldSchema) {
        return;
      }

      result.actions.push(
        action.automatic
          ? {
            id: _.uniqueId(),
            field: fieldSchema.field,
            automatic: action.automatic,
          }
          : {
            id: _.uniqueId(),
            field: fieldSchema.field,
            values: ids,
            set: hasSet,
          }
      );
    });

    if (result.actions.length) {
      result.withActions = true;
    }
  }

  // Location
  if (query.location) {
    const [key] = Object.keys(query.location);

    if (!key) {
      return result;
    }

    Object.assign(result, {
      withFilter: true,
      type: 'location',
      subdivision: key,
      locationValues: [].concat(query.location[key]),
    });

    return result;
  }

  // Tags
  if (query.tags) {
    Object.assign(result, {
      withFilter: true,
      type: 'tags',
      tagValues: [].concat(query.tags).map(getLocaleValue),
    });

    return result;
  }

  // Text
  if (query.text) {
    const keys = Object.keys(query.text);
    if (!keys) {
      return result;
    }

    Object.assign(result, {
      withFilter: true,
      type: 'text',
      textField: keys[0],
      textValue: query.text[keys[0]],
      caseSensitive: keys.length > 1 ? query.text[keys[1]] : false,
    });
    return result;
  }

  const [key] = Object.keys(query);

  // Choice filter
  if (key) {
    return Object.assign(result, {
      withFilter: true,
      type: 'choice',
      choiceField: key,
      choiceValues: query[key],
    });
  }

  return result;
}

export function valuesToRule(values, aggregatorAgendaSchema) {
  const { withActions, withFilter, required } = {
    required: false,
    ...values,
  };

  const actions = !withActions
    ? []
    : values.actions?.map(action => {
      if (action.field === 'state') {
        return {
          field: 'state',
          values: { $set: action.values },
          automatic: false,
        };
      }

      const fieldSchema = aggregatorAgendaSchema.fields.find(
        v => v.field === action.field
      );

      if (!fieldSchema) {
        return;
      }

      if (action.automatic) {
        return {
          field: action.field,
          values: null,
          automatic: true,
        };
      }

      const actionValues = action.values;

      return {
        field: fieldSchema.field,
        values: action.set ? { $set: actionValues } : actionValues,
        automatic: false,
      };
    });

  if (!withFilter) {
    return {
      query: {},
      required,
      actions,
    };
  }

  switch (values.type) {
    case 'location':
      return {
        query: {
          location: {
            [values.subdivision]: values.locationValues,
          },
        },
        required,
        actions,
      };
    case 'tags':
      return {
        query: {
          tags: values.tagValues,
        },
        required,
        actions,
      };
    case 'text':
      return {
        query: {
          text: {
            [values.textField]: values.textValue,
            caseSensitive: values.caseSensitive,
          },
        },
        required,
        actions,
      };
    case 'choice': {
      return {
        query: {
          [values.choiceField]: values.choiceValues,
        },
        required,
        actions,
      };
    }
    default:
      return null;
  }
}

import _ from 'lodash';
import getMultiLanguageLabel from './getMultiLanguageLabel';

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
    actions: []
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

      const ids = action.values?.$set !== undefined ? action.values.$set : action.values;

      if (action.field === 'state') {
        result.actions.push({
          id: _.uniqueId(),
          field: 'state',
          values: ids
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
            automatic: action.automatic
          }
          : {
            id: _.uniqueId(),
            field: fieldSchema.field,
            values: ids
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
      locationValues: [].concat(query.location[key])
    });

    return result;
  }

  // Tags
  if (query.tags) {
    Object.assign(result, {
      withFilter: true,
      type: 'tags',
      tagValues: [].concat(query.tags).map(getMultiLanguageLabel)
    });

    return result;
  }

  const [key] = Object.keys(query);

  // Extended
  if (key) {
    return Object.assign(result, {
      withFilter: true,
      type: 'extended',
      field: key,
      extendedValues: query[key]
    });
  }

  return result;
}

export function valuesToRule(values, schema) {
  const { withActions, withFilter, required } = values;

  const actions = !withActions
    ? []
    : values.actions?.map(action => {
      if (action.field === 'state') {
        return {
          field: 'state',
          values: action.values,
          automatic: false
        };
      }

      const fieldSchema = schema.fields.find(v => v.field === action.field);

      if (!fieldSchema) {
        return;
      }

      if (action.automatic) {
        return {
          field: action.field,
          values: null,
          automatic: true
        };
      }

      return {
        field: fieldSchema.field,
        values: action.values,
        automatic: false
      };
    });

  if (!withFilter) {
    return {
      query: {},
      required,
      actions
    };
  }

  switch (values.type) {
    case 'location':
      return {
        query: {
          location: {
            [values.subdivision]: values.locationValues
          }
        },
        required,
        actions
      };
    case 'tags':
      return {
        query: {
          tags: values.tagValues
        },
        required,
        actions
      };
    case 'extended': {
      return {
        query: {
          [values.field]: values.extendedValues
        },
        required,
        actions
      };
    }
    default:
      return null;
  }
}

import getMultiLanguageLabel from './getMultiLanguageLabel';
import stateMessages from './stateMessages';

const stateTolabelId = state => ({
  0: 'stateToControl',
  1: 'stateControlled',
  2: 'statePublished'
}[state]);

export function ruleToValues(rule, schema, intl) {
  if (!rule) {
    return {};
  }

  const { query, required, actions = [] } = rule;

  const result = {
    type: 'all',
    required: Boolean(required),
    actions: []
  };

  if (!query) {
    // legacy rule
    return result;
  }

  if (schema) {
    actions.forEach(action => {
      if (!action) {
        return;
      }

      const actionKeys = Object.keys(action);
      const ids = action[actionKeys[0]]?.$set;

      if (actionKeys[0] === 'state') {
        result.actions.push({
          field: {
            value: 'state',
            label: intl.formatMessage(stateMessages.state)
          },
          values: {
            value: ids,
            label: intl.formatMessage(stateMessages[stateTolabelId(ids)])
          }
        });
      }

      const fieldSchema = schema.fields.find(v => v.field === actionKeys[0]);

      if (!fieldSchema) {
        return;
      }

      const findOption = optId => {
        if (!optId || !fieldSchema?.options) {
          return optId;
        }

        const foundOpt = fieldSchema.options.find(
          option => option.id === optId
        );

        return {
          value: foundOpt.id,
          label: getMultiLanguageLabel(foundOpt.label, intl.locale)
        };
      };

      const actionValues = Array.isArray(ids)
        ? ids.map(findOption).filter(v => v !== undefined)
        : findOption(ids);

      result.actions.push({
        field: {
          value: fieldSchema.field,
          label: getMultiLanguageLabel(fieldSchema.label, intl.locale)
        },
        values: actionValues
      });
    });
  }

  // Location
  if (query.location) {
    const [key] = Object.keys(query.location);

    if (!key) {
      return result;
    }

    Object.assign(result, {
      type: 'location',
      subdivision: key,
      values: query.location[key]
    });

    return result;
  }

  // Tags
  if (query.tags) {
    Object.assign(result, {
      type: 'tags',
      values: query.tags
    });

    return result;
  }

  const [key] = Object.keys(query);

  // Extended
  if (key) {
    Object.assign(result, {
      type: 'extended',
      field: key,
      values: query[key]
    });

    return result;
  }

  return result;
}

export function valuesToRule(values, schema) {
  const { required } = values;

  const actions = values.actions?.map(action => {
    if (action.field.value === 'state') {
      return {
        state: {
          $set: action.values.value
        }
      };
    }

    const fieldSchema = schema.fields.find(v => v.field === action.field.value);

    if (!fieldSchema) {
      return;
    }

    let $set = action.values;

    if (fieldSchema.options) {
      const findOption = opt => {
        if (!opt) {
          return opt;
        }

        const foundOpt = fieldSchema.options.find(
          option => option.id === opt.value
        );

        return foundOpt.id;
      };

      $set = Array.isArray(action.values)
        ? action.values.map(findOption).filter(v => v !== undefined)
        : findOption(action.values);
    }

    return {
      [fieldSchema.field]: {
        $set
      }
    };
  });

  switch (values.type) {
    case 'all':
      return {
        query: {},
        required,
        actions
      };
    case 'location':
      return {
        query: {
          location: {
            [values.subdivision]: values.values
          }
        },
        required,
        actions
      };
    case 'tags':
      return {
        query: {
          tags: values.values
        },
        required,
        actions
      };
    case 'extended':
      return {
        query: {
          [values.field]: values.values
        },
        required,
        actions
      };
    default:
      return null;
  }
}

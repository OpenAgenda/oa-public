import { defineMessages } from 'react-intl';
import getMultiLanguageLabel from './getMultiLanguageLabel';
import stateMessages from './stateMessages';

const messages = defineMessages({
  inexistentOption: {
    id: 'aggregator-sources.utils.rules.inexistentOption',
    defaultMessage: '*Removed option*'
  }
});

const stateTolabelId = state => ({
  0: 'stateToControl',
  1: 'stateControlled',
  2: 'statePublished'
}[state]);

export function ruleToValues(rule, aggregatorSchema, sourceSchema, intl) {
  if (!rule) {
    return {};
  }

  const {
    query, required, transform = [], actions = transform
  } = rule;

  const result = {
    type: 'all',
    required: Boolean(required),
    actions: []
  };

  if (!query) {
    // legacy rule
    return result;
  }

  const findOption = (fSchema, optId) => {
    if ([null, undefined].includes(optId) || !fSchema?.options) {
      return optId;
    }

    const foundOpt = fSchema.options.find(option => option.id === optId);

    return {
      value: foundOpt ? foundOpt.id : optId,
      label: foundOpt
        ? getMultiLanguageLabel(foundOpt.label, intl.locale)
        : intl.formatMessage(messages.inexistentOption)
    };
  };

  if (aggregatorSchema) {
    [].concat(actions).forEach(action => {
      if (!action) {
        return;
      }

      const actionKeys = Object.keys(action);
      const ids = action[actionKeys[0]]?.$set !== undefined
        ? action[actionKeys[0]].$set
        : action[actionKeys[0]];

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

      const fieldSchema = aggregatorSchema.fields.find(
        v => v.field === actionKeys[0]
      );

      if (!fieldSchema) {
        return;
      }

      const actionValues = Array.isArray(ids)
        ? ids
          .map(id => findOption(fieldSchema, id, intl.locale))
          .filter(v => v !== undefined)
        : findOption(fieldSchema, ids, intl.locale);

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
      values: [].concat(query.tags)
    });

    return result;
  }

  const [key] = Object.keys(query);

  // Extended
  if (key) {
    const ids = query[key];
    const fieldSchema = sourceSchema?.fields.find(v => v.field === key);

    // just for RuleSummary in SourcesList
    if (!fieldSchema) {
      return Object.assign(result, {
        type: 'extended',
        field: key,
        values: ids
      });
    }

    const fieldOption = {
      value: fieldSchema.field,
      label: getMultiLanguageLabel(fieldSchema.label, intl.locale)
    };
    const valuesOptions = Array.isArray(ids)
      ? ids.map(id => findOption(fieldSchema, id))
      : findOption(fieldSchema, ids);

    Object.assign(result, {
      type: 'extended',
      field: fieldOption,
      values: valuesOptions
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
        state: action.values.value
      };
    }

    const fieldSchema = schema.fields.find(v => v.field === action.field.value);

    if (!fieldSchema) {
      return;
    }

    let actionValues = action.values;

    if (fieldSchema.options) {
      const findOption = opt => {
        if (!opt) {
          return opt;
        }

        const foundOpt = fieldSchema.options.find(
          option => option.id === opt.value
        );

        return foundOpt?.id;
      };

      actionValues = Array.isArray(action.values)
        ? action.values.map(findOption).filter(v => v !== undefined)
        : findOption(action.values);
    }

    return {
      [fieldSchema.field]: actionValues
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
    case 'extended': {
      return {
        query: {
          [values.field.value]: Array.isArray(values.values)
            ? values.values.map(v => v.value)
            : values.values.value // WTF
        },
        required,
        actions
      };
    }
    default:
      return null;
  }
}

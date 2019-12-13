import getMultiLanguageLabel from './getMultiLanguageLabel';

export function ruleToValues(rule, schema, lang) {
  if (!rule) {
    return {};
  }

  const { query, required, actions = [] } = rule;
  const result = {
    type: 'all',
    required: Boolean(required),
    actions: []
  };

  if (schema) {
    actions.forEach(action => {
      const actionKeys = Object.keys(action);
      const ids = action[actionKeys[0]]?.$set;
      const fieldSchema = schema.fields.find(v => v.field === actionKeys[0]);

      if (!fieldSchema) {
        return;
      }

      let actionValues = ids;

      if (fieldSchema.options) {
        const findOption = optId => {
          if (!optId) {
            return optId;
          }

          const foundOpt = fieldSchema.options.find(
            option => option.id === optId
          );

          return {
            value: foundOpt.id,
            label: getMultiLanguageLabel(foundOpt.label, lang)
          };
        };

        actionValues = Array.isArray(ids)
          ? ids.map(findOption).filter(v => v !== undefined)
          : findOption(ids);
      }

      result.actions.push({
        field: {
          value: fieldSchema.field,
          label: getMultiLanguageLabel(fieldSchema.label, lang)
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

  const actions = values.actions?.filter(Boolean).map(action => {
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

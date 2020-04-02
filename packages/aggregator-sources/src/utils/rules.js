import _ from 'lodash';
import getMultiLanguageLabel from './getMultiLanguageLabel';

export function hasFilter(rule) {
  if (!rule.query) return false;
  if (!Object.keys(rule.query).length) return false;
  return true;
}

export function getFilterType(rule) {
  if (!hasFilter(rule)) return null;

  const key = Object.keys(rule.query)[0];

  return ['location', 'tags'].includes(key) ? key : 'extended';
}

export function getFilterLocationType(rule) {
  return Object.keys(rule.query.location)[0];
}

export function getFilterField(rule) {
  return Object.keys(rule.query)[0];
}

export function hasValues(rule) {
  return rule.actions && rule.actions.length;
}

export function getActionValues(action) {
  if (action.values instanceof Object) {
    return [].concat(action.values[Object.keys(action.values)[0]]);
  }
  return [].concat(action.values);
}

export function isActionSet(action) {
  if (action.values instanceof Object) {
    return Object.keys(action.values)[0] === '$set';
  }
  return false;
}

export function getActionKey(action) {
  return 'action-' + JSON.stringify(action);
}

export function getActionStateBadgeType(value) {
  switch (value) {
    case -1:
      return 'badge-danger';
    case 0:
      return 'badge-default';
    case 1:
      return 'badge-warning';
    case 2:
      return 'badge-success';
    default:
      return '';
  }
}

export function getActionStateLabel(intl, messages, value) {
  return intl.formatMessage(messages[[
    'refused',
    'toModerate',
    'readyToPublish',
    'published'
  ][value + 1]]);
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

      const hasSet = action.values?.$set !== undefined;

      const ids = hasSet ? action.values.$set : action.values;

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
            values: ids,
            set: hasSet
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

export function valuesToRule(values, aggregatorAgendaSchema) {
  const { withActions, withFilter, required } = values;

  const actions = !withActions
    ? []
    : values.actions?.map(action => {
      if (action.field === 'state') {
        return {
          field: 'state',
          values: { $set: action.values },
          automatic: false
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
          automatic: true
        };
      }

      const actionValues = action.values;

      return {
        field: fieldSchema.field,
        values: action.set ? { $set: actionValues } : actionValues,
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

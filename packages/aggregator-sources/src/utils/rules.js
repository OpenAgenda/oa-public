import _ from 'lodash';
import { getLocaleValue } from '@openagenda/intl';
import { combineDateTime, extractDateAndTime } from './timings.js';

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

  const { query, required, transform = [], actions = transform } = rule;

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
    [].concat(actions).forEach((action) => {
      if (!action) {
        return;
      }

      const hasSet = action.values?.$set !== undefined;

      const isCopy = action.values?.$copy !== undefined;

      const ids = hasSet ? action.values.$set : action.values;

      if (action.field === 'state') {
        result.actions.push({
          id: _.uniqueId(),
          field: 'state',
          values: ids,
        });
      }

      // `featured` is an abstract agenda-event field, not present in the schema,
      // so it is handled explicitly like `state`.
      if (action.field === 'featured') {
        result.actions.push({
          id: _.uniqueId(),
          field: 'featured',
          values: ids,
        });
      }

      const fieldSchema = aggregatorAgendaSchema.fields.find(
        (v) => v.field === action.field,
      );

      if (!fieldSchema) {
        return;
      }

      if (isCopy) {
        result.actions.push({
          id: _.uniqueId(),
          field: fieldSchema.field,
          copyValues: action.values.$copy,
          set: hasSet,
        });
      } else {
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
            },
        );
      }
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

    // Handle allowOnlineEvent three-value system
    // Fix: Handle case where allowOnlineEvent is stored as an array
    let allowOnlineEventValue = query.location.allowOnlineEvent || false;

    // If it's an array, take the first value
    if (Array.isArray(allowOnlineEventValue)) {
      allowOnlineEventValue = allowOnlineEventValue[0] || false;
    }

    const allowOnlineEventChecked = allowOnlineEventValue !== false;
    const allowOnlineEventMode = allowOnlineEventValue === false ? 'all' : allowOnlineEventValue;

    Object.assign(result, {
      withFilter: true,
      type: 'location',
      subdivision: key,
      locationValues: [].concat(query.location[key]),
      caseSensitive: key ? query.location.caseSensitive : false,
      allowOnlineEvent: allowOnlineEventChecked,
      allowOnlineEventMode,
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
      caseSensitive:
        keys.length > 1 && keys.includes('caseSensitive')
          ? query.text.caseSensitive
          : false,
      wholeValue:
        keys.length > 1 && keys.includes('wholeValue')
          ? query.text.wholeValue
          : false,
    });
    return result;
  }

  if (query.languages) {
    Object.assign(result, {
      type: 'languages',
      languages: query.languages,
      withFilter: true,
    });
    return result;
  }

  if (query.timings) {
    const { date: minDate, time: minTime } = extractDateAndTime(
      new Date(query.timings.gte),
    );
    const { date: maxDate, time: maxTime } = extractDateAndTime(
      new Date(query.timings.lte),
    );

    Object.assign(result, {
      type: 'timings',
      timings: {
        minDate: new Date(minDate),
        minTime,
        maxDate: new Date(maxDate),
        maxTime,
      },
      withFilter: true,
    });
    return result;
  }

  // Featured filter (abstract agenda-event field, handled before the generic
  // choice fallback below)
  if (typeof query.featured !== 'undefined') {
    return Object.assign(result, {
      withFilter: true,
      type: 'featured',
      featuredValue: [].concat(query.featured)[0],
    });
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
    : values.actions?.map((action) => {
      if (action.field === 'state') {
        return {
          field: 'state',
          values: { $set: action.values },
          automatic: false,
        };
      }

      if (action.field === 'featured') {
        return {
          field: 'featured',
          values: { $set: action.values },
          automatic: false,
        };
      }

      const fieldSchema = aggregatorAgendaSchema.fields.find(
        (v) => v.field === action.field,
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

      if (action.copyValues) {
        return {
          field: action.field,
          values: { $copy: action.copyValues },
          automatic: false,
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
    case 'location': {
      // Convert form values back to rule format
      // Ensure allowOnlineEvent is treated as boolean, not array
      const allowOnlineEventBoolean = Array.isArray(values.allowOnlineEvent)
        ? values.allowOnlineEvent.length > 0
        : !!values.allowOnlineEvent;

      const allowOnlineEventValue = allowOnlineEventBoolean
        ? values.allowOnlineEventMode || 'all'
        : false;

      return {
        query: {
          location: {
            [values.subdivision]: values.locationValues,
            caseSensitive: values.caseSensitive,
            allowOnlineEvent: allowOnlineEventValue,
          },
        },
        required,
        actions,
      };
    }
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
            [values.textField]: values.textValue || null,
            caseSensitive: values.caseSensitive,
            wholeValue: values.wholeValue,
          },
        },
        required,
        actions,
      };
    case 'choice': {
      return {
        query: {
          [values.choiceField]: values.choiceValues.map((v) =>
            (v === 'null' ? null : v)),
        },
        required,
        actions,
      };
    }
    case 'languages': {
      return {
        query: {
          languages: values.languages,
        },
        required,
        actions,
      };
    }
    case 'featured': {
      return {
        query: {
          featured: values.featuredValue,
        },
        required,
        actions,
      };
    }
    case 'timings': {
      return {
        query: {
          timings: {
            gte: combineDateTime(
              values.timings.minDate,
              values.timings.minTime,
            ),
            lte: combineDateTime(
              values.timings.maxDate,
              values.timings.maxTime,
            ),
          },
        },
        required,
        actions,
      };
    }
    default:
      return null;
  }
}

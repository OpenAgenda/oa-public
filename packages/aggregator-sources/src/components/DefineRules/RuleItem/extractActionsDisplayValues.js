import { getLocaleValue } from '@openagenda/intl';
import messages from './messages.js';

function isSet(action) {
  if (action.values instanceof Object) {
    return Object.keys(action.values)[0] === '$set';
  }
  return false;
}

function isCopy(action) {
  if (action.values instanceof Object) {
    return Object.keys(action.values)[0] === '$copy';
  }
  return false;
}

function getKey(action) {
  return `action-${JSON.stringify(action)}`;
}

function getType(action, aggregatorAgendaSchema) {
  if (action.field === 'state') {
    return 'state';
  }

  if (action.field === 'featured') {
    return 'featured';
  }

  // Check if the field is a boolean type
  const field = (aggregatorAgendaSchema?.fields || [])
    .filter((f) => f.field === action.field)
    .pop();

  if (field && field.fieldType === 'boolean') {
    return 'boolean';
  }

  return null;
}

function getValues(action, sourceAgendaSchema, local) {
  if (
    action.values instanceof Object
    && action.values.$copy
    && sourceAgendaSchema?.fields.find((f) => f.field === action.values.$copy)
  ) {
    const label = sourceAgendaSchema?.fields.find(
      (f) => f.field === action.values.$copy,
    ).label;
    return [].concat(label[local] || label);
  }
  if (action.values instanceof Object) {
    if (Array.isArray(action.values)) return action.values;
    return [].concat(action.values[Object.keys(action.values)[0]]);
  }
  return [].concat(action.values);
}

export function getStateBadgeType(value) {
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

function getStateLabel(intl, value) {
  return intl.formatMessage(
    messages[
      ['refused', 'toModerate', 'readyToPublish', 'published'][value + 1]
    ],
  );
}

function stateAction({ intl, action }) {
  const state = getValues(action).pop();
  const stateLabel = getStateLabel(intl, state);

  return {
    label: intl.formatMessage(messages.state),
    value: (
      <span className={`badge badge-pill ${getStateBadgeType(state)}`}>
        {stateLabel}
      </span>
    ),
    detail: intl.formatMessage(messages.actionStateDetail, {
      state: stateLabel,
    }),
  };
}

function featuredAction({ intl, action }) {
  const value = getValues(action).pop();
  const booleanValue = value === true || value === 'true';
  const messageId = booleanValue ? 'selected' : 'notSelected';

  return {
    label: intl.formatMessage(messages.featured),
    value: intl.formatMessage(messages[messageId]),
    detail: intl.formatMessage(messages.actionFeaturedDetail),
  };
}

function booleanAction({ intl, action, field, aggregatorAgenda }) {
  const value = getValues(action).pop();
  const booleanValue = value === true || value === 'true';
  const messageId = booleanValue ? 'selected' : 'notSelected';

  return {
    label: getLocaleValue(field.label, intl.locale),
    value: intl.formatMessage(messages[messageId]),
    detail: intl.formatMessage(
      messages.aggregatorAgendaChoiceFieldValueDetail,
      {
        agendaTitle: aggregatorAgenda?.title || '',
      },
    ),
  };
}

export default ({
  intl,
  aggregatorAgendaSchema,
  aggregatorAgenda,
  action,
  sourceAgendaSchema,
}) => {
  const type = getType(action, aggregatorAgendaSchema);

  const base = {
    type,
    key: getKey(action),
    set: isSet(action),
    copy: isCopy(action),
  };

  if (type === 'state') {
    return {
      ...base,
      ...stateAction({ intl, action }),
    };
  }

  if (type === 'featured') {
    return {
      ...base,
      ...featuredAction({ intl, action }),
    };
  }

  if (type === 'boolean') {
    const field = (aggregatorAgendaSchema?.fields || [])
      .filter((f) => f.field === action.field)
      .pop();

    if (field) {
      return {
        ...base,
        ...booleanAction({ intl, action, field, aggregatorAgenda }),
      };
    }
  }

  const field = (aggregatorAgendaSchema?.fields || [])
    .filter((f) => f.field === action.field)
    .pop();

  if (!field) {
    return {
      ...base,
      label: action.field,
      value: 'undefined',
      detail: null,
    };
  }

  const label = getLocaleValue(field.label, intl.locale);

  if (action.automatic) {
    return {
      ...base,
      label,
      value: (
        <span className="badge badge-pill badge-default">
          {intl.formatMessage(messages.automatic)}
        </span>
      ),
      detail: intl.formatMessage(messages.automaticDetail),
    };
  }
  const values = getValues(action);

  const matchingOptions = values.map((value) =>
    field.options?.filter((o) => o.id === value).pop());

  return {
    ...base,
    label,
    value:
      matchingOptions[0] !== undefined
        ? matchingOptions
          .map((o) => getLocaleValue(o?.label, intl.locale))
          .join(', ')
        : getValues(action, sourceAgendaSchema, intl.locale)[0],
    detail: intl.formatMessage(
      messages.aggregatorAgendaChoiceFieldValueDetail,
      {
        agendaTitle: aggregatorAgenda.title,
      },
    ),
  };
};

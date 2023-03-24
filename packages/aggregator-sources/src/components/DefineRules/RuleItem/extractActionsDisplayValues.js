import React from 'react';
import { getLocaleValue } from '@openagenda/intl';
import messages from './messages';

function isSet(action) {
  if (action.values instanceof Object) {
    return Object.keys(action.values)[0] === '$set';
  }
  return false;
}

function getKey(action) {
  return `action-${JSON.stringify(action)}`;
}

function getType(action) {
  if (action.field === 'state') {
    return 'state';
  }
  return null;
}

function getValues(action) {
  if (action.values instanceof Object) {
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
    ]
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

export default ({
  intl, aggregatorAgendaSchema, aggregatorAgenda, action
}) => {
  const type = getType(action);
  const base = {
    type,
    key: getKey(action),
    set: isSet(action),
  };

  if (type === 'state') {
    return {
      ...base,
      ...stateAction({ intl, action }),
    };
  }

  const field = (aggregatorAgendaSchema?.fields || [])
    .filter(f => f.field === action.field)
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

  const matchingOptions = getValues(action).map(value => field.options?.filter(o => o.id === value).pop());

  return {
    ...base,
    label,
    value:
      matchingOptions[0] !== undefined
        ? matchingOptions
          .map(o => getLocaleValue(o?.label, intl.locale))
          .join(', ')
        : getValues(action)[0],
    detail: intl.formatMessage(
      messages.aggregatorAgendaChoiceFieldValueDetail,
      {
        agendaTitle: aggregatorAgenda.title,
      }
    ),
  };
};

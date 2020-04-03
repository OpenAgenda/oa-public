import React from 'react';

import getMultiLanguageLabel from '../../../utils/getMultiLanguageLabel';
import messages from './messages';

import {
  hasFilter,
  getActionValues,
  isActionSet,
  getActionStateLabel,
  getActionStateBadgeType,
  getActionKey
} from '../../../utils/rules';


function extractActionLabel({ intl, aggregatorAgendaSchema, action }) {
  if (action.field === 'state') {
    return intl.formatMessage(messages.state);
  }

  const field = (aggregatorAgendaSchema?.fields || []).filter(f => f.field === action.field).pop();

  if (!field) {
    return action.field;
  }

  return getMultiLanguageLabel(field.label);
}

function extractActionValue({ intl, aggregatorAgendaSchema, action }) {
  if (action.field === 'state') {
    const state = getActionValues(action).pop();
    return <span className={`badge badge-pill ${getActionStateBadgeType(state)}`}>{getActionStateLabel(intl, messages, state)}</span>
  }

  const field = (aggregatorAgendaSchema?.fields || []).filter(f => f.field === action.field).pop();

  if (!field || !field.options) {
    return intl.formatMessage(messages.editForDetails);
  }

  if (action.automatic) {
    return <span
      className="badge badge-pill badge-default"
      title={intl.formatMessage(messages.automaticDetail)}>
      {intl.formatMessage(messages.automatic)}
    </span>;
  }
  const matchingOptions = getActionValues(action).map(value => field.options.filter(o => o.id === value).pop());

  return matchingOptions.map(o => getMultiLanguageLabel(o.label)).join(', ');
}

export default ({ intl, rule, aggregatorAgendaSchema }) => (<div>
  {hasFilter(rule) ? <span
    title={intl.formatMessage(messages.actionsAfterFilterDetail)}
    className="pull-left actions-icon">↳
  </span> : <span
    className="badge badge-pill badge-default pull-left"
    title={intl.formatMessage(messages.actionsDetail)}><i className="fa fa-arrow-right"></i></span>}
  <ul className="padding-left-md margin-bottom-z list-unstyled">
    {rule.actions.map(action => <li
      key={getActionKey(action)}
      className="padding-left-xs padding-bottom-xs">
        <label className="margin-right-xs">{extractActionLabel({ intl, aggregatorAgendaSchema, action })}:</label>
        {isActionSet(action)?<span
          className="badge badge-pill badge-default margin-right-xs"
          title={intl.formatMessage(messages.replacingActionDetail)}>↦</span>:null}
        {extractActionValue({ intl, aggregatorAgendaSchema, action })}
    </li>)}
  </ul>
</div>)

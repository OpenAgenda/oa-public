import React from 'react';

import getMultiLanguageLabel from '../../../utils/getMultiLanguageLabel';
import messages from './messages';
import { getFilterType, getFilterLocationType, getFilterField } from '../../../utils/rules';

const pickField = (schema, field) => schema.fields.filter(f => f.field === field).pop();

const extractTypeLabel = ({ intl, sourceAgendaSchema, rule }) => {
  const type = getFilterType(rule);
  if (type === 'location') {
    return intl.formatMessage(messages[getFilterLocationType(rule)]);
  } else if (type === 'extended') {
    return getMultiLanguageLabel(pickField(sourceAgendaSchema, getFilterField(rule)).label);
  }
  return intl.formatMessage(messages[type]);
}

const extractValue = ({ intl, sourceAgendaSchema, rule }) => {
  const type = getFilterType(rule);
  if (type === 'location') {
    return [].concat(rule.query.location[getFilterLocationType(rule)]).join(', ');
  } else if (type === 'tags') {
    return rule.query.tags.join(', ');
  } else if (type === 'extended') {
    const filterField = getFilterField(rule);
    return pickField(sourceAgendaSchema, filterField)
      .options.filter(o => [].concat(rule.query[filterField]).includes(o.id))
      .map(o => getMultiLanguageLabel(o.label))
      .join(', ');
  }
  return intl.formatMessage(messages.editForDetails);
}

export default ({
  rule,
  intl,
  sourceAgendaSchema
}) => (<div className="padding-v-xs">
  <span title={intl.formatMessage(rule.required ? messages.requiredFilterDetail : messages.filterDetail)} className={`pull-left badge badge-pill badge-${rule.required ? 'danger' : 'default'}`}>
    <i className="fa fa-filter"></i>
  </span>
  <div className="padding-left-md">
    <div className="padding-left-xs"><label className="margin-right-xs">{extractTypeLabel({ intl, sourceAgendaSchema, rule })}:</label>{extractValue({ intl, sourceAgendaSchema, rule })}</div>
  </div>
</div>)

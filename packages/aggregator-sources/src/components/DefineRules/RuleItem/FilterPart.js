import React from 'react';
import messages from './messages';
import extract from './extractFilterDisplayValues';

export default ({
  rule, intl, sourceAgendaSchema, sourceAgenda
}) => {
  const {
    label, value, detail, casse
  } = extract({
    intl,
    rule,
    sourceAgendaSchema,
    sourceAgenda,
  });
  return (
    <div className="padding-v-xs">
      <span
        title={intl.formatMessage(
          rule.required ? messages.requiredFilterDetail : messages.filterDetail
        )}
        className={`pull-left badge badge-pill badge-${
          rule.required ? 'danger' : 'default'
        }`}
      >
        <i className="fa fa-filter" />
      </span>
      <div className="padding-left-md">
        <div className="padding-left-xs" title={detail}>
          <label className="margin-right-xs" htmlFor={rule.id}>
            {label}:
          </label>
          {value}
          {rule.query.text ? (
            <span
              className={`badge badge-pill margin-right-xs badge-${
                casse ? 'info' : 'default'
              }`}
              title={intl.formatMessage(
                casse ? messages.caseSensitive : messages.caseInsensitive
              )}
            >
              aA
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

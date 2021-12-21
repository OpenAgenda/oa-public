import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { MoreInfo } from '@openagenda/react-shared';
import externalLinks from '../utils/externalLinks';

const messages = defineMessages({
  rulesSummary: {
    id: 'aggregator-sources.RulesSummary.rulesSummary',
    defaultMessage:
      '{count, plural, =0 {No general rule is defined} =1 {1 general rule is defined} other {# general rules are defined}}',
  },
  add: {
    id: 'aggregator-sources.add',
    defaultMessage: 'Add',
  },
  edit: {
    id: 'aggregator-sources.edit',
    defaultMessage: 'Edit',
  },
});

export default function AggregatorRules({ rules, showModal }) {
  const intl = useIntl();

  return (
    <div className="padding-top-sm padding-bottom-xs">
      <span>
        {intl.formatMessage(messages.rulesSummary, {
          count: rules ? rules.length : 0,
        })}
      </span>
      <button
        type="button"
        className="btn btn-link-inline margin-h-sm"
        onClick={showModal}
      >
        {intl.formatMessage(rules?.length ? messages.edit : messages.add)}
      </button>
      <MoreInfo id="doc-popover" link={externalLinks.helpRules} />
    </div>
  );
}

import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { MoreInfo } from '@openagenda/react-components';
import externalLinks from '../utils/externalLinks';

const messages = defineMessages({
  extendedFiltersSummary: {
    id: 'aggregator-sources.RulesSummary.extendedFiltersSummary',
    defaultMessage:
      '{extendedCount, plural, =0 {0 extended filter} =1 {1 extended filter} other {# extended filters}}'
  },
  rulesSummary: {
    id: 'aggregator-sources.RulesSummary.rulesSummary',
    defaultMessage:
      '{count, plural, =0 {No general rule is defined} =1 {1 general rule is defined} other {# general rules are defined}}'
  },
  add: {
    id: 'aggregator-sources.add',
    defaultMessage: 'Add'
  },
  edit: {
    id: 'aggregator-sources.edit',
    defaultMessage: 'Edit'
  }
});

export default function AggregatorRules({ rules }) {
  const intl = useIntl();

  return (
    <div className="padding-top-sm padding-bottom-xs">
      <span>
        {intl.formatMessage(messages.rulesSummary, {
          count: rules ? rules.length : 0
        })}
      </span>
      <button type="button" className="btn btn-link">
        {rules?.length ? 'Modifier' : 'Ajouter'}
      </button>
      <MoreInfo id="doc-popover" link={externalLinks.helpRules} />
    </div>
  );
}

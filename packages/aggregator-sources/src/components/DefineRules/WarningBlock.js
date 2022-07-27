import React from 'react';
import { defineMessages } from 'react-intl';
import { MoreInfo, useMemoOne } from '@openagenda/react-shared';
import { getLocaleValue } from '@openagenda/intl';
import externalLinks from '../../utils/externalLinks';

const messages = defineMessages({
  requiredFieldsWarning: {
    id: 'aggregator-sources.DefineRules.requiredFieldsWarning',
    defaultMessage:
      '{fieldsCount, plural, =1 {The field {fields} is required} other {The fields {fields} are required}}.',
  },
  requiredFieldsWarningDetail: {
    id: 'aggregator-sources.DefineRules.requiredFieldsWarningDetail',
    defaultMessage:
      'The agenda "{agendaTitle}" has required fields. Event aggregation will only occur for events associated to at least one value of each required field. Use aggregation rules to attribute values to the event at aggregation.',
  },
  displayAggregatorRulesExist: {
    id: 'aggregator-sources.DefineRules.displayAggregatorRulesExist',
    defaultMessage:
      '{count, plural, =1 {One general rule exists} other {{count} general rules exist}}',
  },
  displayAggregatorRulesExistDetail: {
    id: 'aggregator-sources.DefineRules.displayAggregatorRulesExistDetail',
    defaultMessage:
      'General rules apply on all events before source-specific rules are evaluated.',
  },
});

export default function WarningBlock({
  top,
  aggregator,
  aggregatorAgenda,
  isAggregator,
  aggregatorAgendaSchema,
  sourceSchema,
  intl,
}) {
  const requiredFields = useMemoOne(
    () => aggregatorAgendaSchema.fields.filter(field => {
      if (isAggregator) {
        return false;
      }

      const sourceField = sourceSchema?.fields?.find(
          v => v.schemaId
            && v.field === field.field
            && v.schemaId === field.schemaId
        );

      if (sourceField) {
        return false;
      }

      return field.fieldType !== 'abstract' && field.optional === false;
    }),
    [aggregatorAgendaSchema.fields, isAggregator, sourceSchema]
  );

  const displayRequiredFieldsMessage = sourceSchema && requiredFields.length;
  const displayAggregatorRulesExist = (aggregator?.rules || []).length;

  if (!displayRequiredFieldsMessage && !displayAggregatorRulesExist) {
    return null;
  }

  const requiredFieldList = requiredFields.map(field => (
    <em key={field.field}>{getLocaleValue(field.label, intl.locale)}</em>
  ));

  return (
    <div className={`warning-block${top ? ' top' : ''}`}>
      {displayRequiredFieldsMessage ? (
        <div
          title={intl.formatMessage(messages.requiredFieldsWarningDetail, {
            agendaTitle: aggregatorAgenda.title,
          })}
        >
          <b>
            {intl.formatMessage(messages.requiredFieldsWarning, {
              fields: intl.formatList(requiredFieldList),
              fieldsCount: requiredFields.length,
            })}
            <MoreInfo
              className="margin-left-xs"
              id="doc-popover-required"
              link={externalLinks.helpRequiredAdditional}
            />
          </b>
        </div>
      ) : null}
      {displayAggregatorRulesExist ? (
        <div
          className={displayRequiredFieldsMessage ? 'margin-top-sm' : ''}
          title={intl.formatMessage(messages.displayAggregatorRulesExistDetail)}
        >
          <b>
            {intl.formatMessage(messages.displayAggregatorRulesExist, {
              count: aggregator.rules.length,
            })}
            <MoreInfo
              className="margin-left-xs"
              id="doc-popover-rules"
              link={externalLinks.helpRules}
            />
          </b>
        </div>
      ) : null}
    </div>
  );
}

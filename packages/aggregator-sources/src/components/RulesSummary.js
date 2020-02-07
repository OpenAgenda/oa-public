import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ruleToValues } from '../utils/rules';
import getMultiLanguageLabel from '../utils/getMultiLanguageLabel';
import stateMessages from '../utils/stateMessages';

const messages = defineMessages({
  geoFiltersSummary: {
    id: 'aggregator-sources.RulesSummary.geoFiltersSummary',
    defaultMessage:
      '{geoCount, plural, =0 {0 geographical filter} =1 {1 geographical filter} other {# geographical filters}}'
  },
  labelFiltersSummary: {
    id: 'aggregator-sources.RulesSummary.labelFiltersSummary',
    defaultMessage:
      '{labelCount, plural, =0 {0 label filter} =1 {1 label filter} other {# label filters}}'
  },
  extendedFiltersSummary: {
    id: 'aggregator-sources.RulesSummary.extendedFiltersSummary',
    defaultMessage:
      '{extendedCount, plural, =0 {0 extended filter} =1 {1 extended filter} other {# extended filters}}'
  },
  noFilter: {
    id: 'aggregator-sources.RulesSummary.noFilter',
    defaultMessage: 'No filter'
  },
  actionsSummary: {
    id: 'aggregator-sources.RulesSummary.actionsSummary',
    defaultMessage:
      '{actionCount, plural, =1 {1 action} other {# actions}} on {actionFields}'
  },
  noAction: {
    id: 'aggregator-sources.RulesSummary.noAction',
    defaultMessage: 'No action'
  }
});

export default function RulesSummary({ rules, schema }) {
  const intl = useIntl();

  const info = useMemo(() => {
    const result = (rules || []).reduce(
      (accu, rule) => {
        const values = ruleToValues(rule, schema);

        if (values.type === 'location') {
          accu.geoCount += 1;
        }

        if (values.type === 'tags') {
          accu.labelCount += 1;
        }

        if (values.type === 'extended') {
          accu.extendedCount += 1;
        }

        if (values.actions?.length) {
          accu.actionCount += values.actions.length;

          Array.prototype.push.apply(
            accu.actionFields,
            values.actions.map(action => {
              if (action.field === 'state') {
                return {
                  value: 'state',
                  label: intl.formatMessage(stateMessages.state)
                };
              }

              return schema.fields?.find(w => w.field === action.field);
            })
          );
        }

        return accu;
      },
      {
        geoCount: 0,
        labelCount: 0,
        extendedCount: 0,
        actionCount: 0,
        actionFields: []
      }
    );

    result.actionList = [
      ...new Map(
        result.actionFields.map(item => [
          item.field,
          <em key={item.field}>{getMultiLanguageLabel(item.label)}</em>
        ])
      ).values()
    ];

    return result;
  }, [intl, rules, schema]);

  const hasFilter = info.geoCount + info.labelCount + info.extendedCount !== 0;

  return (
    <>
      {hasFilter
        ? intl.formatList(
          [
            info.geoCount
                && intl.formatMessage(messages.geoFiltersSummary, info),
            info.labelCount
                && intl.formatMessage(messages.labelFiltersSummary, info),
            info.extendedCount
                && intl.formatMessage(messages.extendedFiltersSummary, info)
          ].filter(Boolean)
        )
        : intl.formatMessage(messages.noFilter)}

      <br />

      {info.actionCount > 0
        ? intl.formatMessage(messages.actionsSummary, {
          ...info,
          actionFields: intl.formatList(info.actionList)
        })
        : intl.formatMessage(messages.noAction)}
    </>
  );
}

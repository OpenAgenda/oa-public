import _ from 'lodash';
import { defineMessages, useIntl } from 'react-intl';
import React, { useMemo } from 'react';
import { Spinner } from '@openagenda/react-components';
import getLocaleValue from '../utils/getLocaleValue';
import IntervalSelect from '../components/basics/IntervalSelect';
import titleMessages from '../titleMessages';

const messages = defineMessages({
  withSelector: {
    id: 'AgendaStats.useChartTitle.withSelector',
    defaultMessage: '{message} by {selector}'
  }
});

function statToTitleMessageKey(aggregation) {
  let messageKey = '';

  if (Array.isArray(aggregation)) {
    for (const agg of aggregation) {
      messageKey += messageKey === '' ? agg.type : _.upperFirst(agg.type);
    }
  } else {
    messageKey += aggregation.type;
  }

  return messageKey;
}

export default function useChartTitle({
  stat,
  interval,
  setInterval,
  loading
}) {
  const intl = useIntl();

  const messageKey = useMemo(() => statToTitleMessageKey(stat.aggregation), [
    stat.aggregation
  ]);

  return useMemo(() => {
    let result;

    if (stat.fieldSchema) {
      result = getLocaleValue(stat.fieldSchema.label, intl.locale);
    } else if (titleMessages[messageKey]) {
      result = intl.formatMessage(titleMessages[messageKey]);
    } else {
      result = messageKey;
    }

    if (stat.chart.intervalSelector && interval) {
      result = intl.formatMessage(messages.withSelector, {
        message: result,
        selector: (
          <>
            <IntervalSelect value={interval} onChange={setInterval} />

            {loading ? (
              <span className="margin-left-xs">
                <Spinner mode="inline" />
              </span>
            ) : null}
          </>
        )
      });
    }

    return result;
  }, [
    interval,
    intl,
    loading,
    messageKey,
    setInterval,
    stat.chart.intervalSelector,
    stat.fieldSchema
  ]);
}

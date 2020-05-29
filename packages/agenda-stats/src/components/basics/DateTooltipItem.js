import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { getValueByDataKey } from 'recharts/lib/util/ChartUtils';

const messages = defineMessages({
  tooltipDay: {
    id: 'AgendaStats.DateTooltipItem.tooltipDay',
    defaultMessage: '{value, time, ::yyyyMMMMddeeeee}'
  },
  tooltipWeek: {
    id: 'AgendaStats.DateTooltipItem.tooltipWeek',
    defaultMessage: '{value, time, ::yyyyMMdd}'
  },
  tooltipMonth: {
    id: 'AgendaStats.DateTooltipItem.tooltipMonth',
    defaultMessage: '{value, time, ::yyyyMMMM}'
  }
});

export default function DateTooltipItem({
  message,
  entry,
  dataKey,
  interval,
  hideLabel
}) {
  const intl = useIntl();

  // const dateFormatOptions = useMemo(() => {
  //   if (interval === 'day') {
  //     return {
  //       weekday: 'long',
  //       year: 'numeric',
  //       month: 'long',
  //       day: 'numeric'
  //     }; // ::yyyyMMMMddeeee
  //   }
  //
  //   if (interval === 'week') {
  //     return {
  //       year: 'numeric',
  //       month: 'numeric',
  //       day: 'numeric'
  //     }; // ::yyyyMMdd
  //   }
  //
  //   if (interval === 'month') {
  //     return {
  //       year: 'numeric',
  //       month: 'long'
  //     }; // ::yyyyMMMM
  //   }
  // }, interval);

  const label = getValueByDataKey(entry.payload, dataKey);
  const date = new Date(label);

  return (
    <li className="recharts-tooltip-item">
      <span>
        {!hideLabel ? (
          <>
            <b>
              {interval === 'day'
                ? intl.formatMessage(messages.tooltipDay, { date })
                : null}
              {interval === 'week'
                ? intl.formatMessage(messages.tooltipWeek, { date })
                : null}
              {interval === 'month'
                ? intl.formatMessage(messages.tooltipMonth, { date })
                : null}
            </b>
            <br />
          </>
        ) : null}
        {intl.formatMessage(message, {
          value: entry.value,
          dataKey: entry.dataKey
        })}
      </span>
    </li>
  );
}

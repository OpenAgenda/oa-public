import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { getValueByDataKey } from 'recharts/lib/util/ChartUtils';
import endOfWeek from 'date-fns/endOfWeek';
import getWeekNumber from '../../utils/getWeekNumber';

const messages = defineMessages({
  day: {
    id: 'AgendaStats.DateTooltipItem.tooltipDay',
    defaultMessage: '{value, time, ::yyyyMMMMddeeeee}',
  },
  week: {
    id: 'AgendaStats.DateTooltipItem.tooltipWeek',
    defaultMessage: '{value, time, ::yyyyMMdd}',
  },
  month: {
    id: 'AgendaStats.DateTooltipItem.tooltipMonth',
    defaultMessage: '{value, time, ::yyyyMMMM}',
  },
});

export default function DateTooltipItem({
  message,
  entry,
  dataKey,
  interval,
  hideLabel,
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
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const [weekNumber, yearOfWeekNumber] = getWeekNumber(date);

  return (
    <li className="recharts-tooltip-item">
      <span>
        {!hideLabel ? (
          <>
            <b>
              {intl.formatMessage(messages[interval || 'day'], {
                date,
                weekEnd,
                weekNumber,
                yearOfWeekNumber,
                br: <br />,
              })}
            </b>
            <br />
          </>
        ) : null}
        {intl.formatMessage(message, {
          value: entry.value,
          dataKey: entry.dataKey,
        })}
      </span>
    </li>
  );
}

import _ from 'lodash';
import React, { useMemo } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Text } from 'recharts';
import HorizontalBarChart from './HorizontalBarChart';

const messages = defineMessages({
  timingsTooltip: {
    id: 'AgendaStats.TimingsChart.timingsTooltip',
    defaultMessage: '{value, number} timings'
  },
  tooltipDay: {
    id: 'AgendaStats.TimingsChart.tooltipDay',
    defaultMessage: '{value, time, ::yyyyMMMMddeeeee}'
  },
  tooltipWeek: {
    id: 'AgendaStats.TimingsChart.tooltipWeek',
    defaultMessage: '{value, time, ::yyyyMMdd}'
  },
  tooltipMonth: {
    id: 'AgendaStats.TimingsChart.tooltipMonth',
    defaultMessage: '{value, time, ::yyyyMMMM}'
  }
});

function TimingsTooltipItem({ entry, labelKey, interval }) {
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

  const date = new Date(_.get(entry.payload, labelKey));

  return (
    <li className="recharts-tooltip-item">
      <span>
        <b>
          {interval === 'day' ? intl.formatMessage(messages.tooltipDay, { date }) : null}
          {interval === 'week' ? intl.formatMessage(messages.tooltipWeek, { date }) : null}
          {interval === 'month' ? intl.formatMessage(messages.tooltipMonth, { date }) : null}
        </b>
        <br />
        {intl.formatMessage(messages.timingsTooltip, { value: entry.value })}
      </span>
    </li>
  );
}

function TimingsAxisTick({ interval, payload, ...rest }) {
  const intl = useIntl();

  const dateFormatOptions = useMemo(() => {
    if (interval === 'day') {
      return {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      };
    }

    if (interval === 'week') {
      return {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      };
    }

    if (interval === 'month') {
      return {
        month: 'numeric',
        year: 'numeric'
      };
    }
  }, [interval]);

  return (
    <Text {...rest}>
      {intl.formatDate(new Date(payload.value), dateFormatOptions)}
    </Text>
  );
}

export default function TimingsChart({
  data,
  totalEvents,
  interval
}) {
  return (
    <HorizontalBarChart
      data={data}
      total={totalEvents}
      dataKey="timingCount"
      labelKey="key"
      renderTooltipItem={<TimingsTooltipItem interval={interval} />}
      xAxisTick={<TimingsAxisTick interval={interval} />}
    />
  );
}

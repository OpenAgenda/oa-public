import React from 'react';
import { defineMessages } from 'react-intl';
import HorizontalBarChart from './HorizontalBarChart';
import DateTooltipItem from './DateTooltipItem';
import DateAxisTick from './DateAxisTick';

const messages = defineMessages({
  tooltipContent: {
    id: 'AgendaStats.TimingsChart.tooltipContent',
    defaultMessage: '{value, number} timings'
  }
});

export default function TimingsChart({ data, totalEvents, interval }) {
  return (
    <HorizontalBarChart
      data={data}
      total={totalEvents}
      dataKey="timingCount"
      labelKey="key"
      renderTooltipItem={(
        <DateTooltipItem
          interval={interval}
          message={messages.tooltipContent}
        />
      )}
      xAxisTick={<DateAxisTick interval={interval} />}
    />
  );
}

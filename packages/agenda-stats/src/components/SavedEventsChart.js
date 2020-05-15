import React, { useMemo } from 'react';
import { defineMessages } from 'react-intl';
import HorizontalBarChart from './HorizontalBarChart';
import DateTooltipItem from './DateTooltipItem';
import DateAxisTick from './DateAxisTick';

const messages = defineMessages({
  tooltipContent: {
    id: 'AgendaStats.SavedEventsChart.tooltipContent',
    defaultMessage: '{value, number} events'
  }
});

function mergeCreatedAndUpdated(createdData, updatedData) {
  const data = createdData.reduce(
    (res, next) => [
      ...res,
      {
        updatedCount: 0,
        ...next,
        createdCount: next.eventCount
      }
    ],
    []
  );

  return updatedData.reduce((res, next) => {
    const foundIndex = res.findIndex(v => v.key === next.key);

    if (foundIndex !== -1) {
      return [
        ...res.slice(0, foundIndex - 1),
        {
          createdCount: 0,
          ...res[foundIndex],
          updatedCount: next.eventCount
        },
        ...res.slice(foundIndex)
      ];
    }

    return [
      ...res,
      {
        createdCount: 0,
        ...next,
        updatedCount: next.eventCount
      }
    ];
  }, data);
}

export default function SavedEventsCharts({
  createdData,
  updatedData,
  totalEvents,
  interval
}) {
  const data = useMemo(() => {
    if (createdData && updatedData) {
      return mergeCreatedAndUpdated(createdData, updatedData);
    }

    if (createdData) {
      return createdData;
    }

    if (updatedData) {
      return updatedData;
    }
  }, [createdData, updatedData]);

  return (
    <HorizontalBarChart
      data={data}
      total={totalEvents}
      dataKey={createdData && updatedData ? 'createdCount' : 'eventCount'}
      dataKey1={createdData && updatedData ? 'updatedCount' : undefined}
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

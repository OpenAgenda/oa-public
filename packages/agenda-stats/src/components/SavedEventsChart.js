import React, {
  useMemo,
  useState,
  useLayoutEffect,
  useEffect,
  useRef
} from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Spinner } from '@openagenda/react-components';
import rangeToCalendarInterval from '../utils/rangeToCalendarInterval';
import HorizontalBarChart from './basics/HorizontalBarChart';
import DateTooltipItem from './basics/DateTooltipItem';
import DateAxisTick from './basics/DateAxisTick';
import IntervalSelect from './IntervalSelect';

const messages = defineMessages({
  savedEventsBySelector: {
    id: 'AgendaStats.SavedEventsChart.savedEventsBySelector',
    defaultMessage: 'Saved events by {selector}'
  },
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
  createdAggregation,
  updatedAggregation,
  totalEvents,
  range,
  loadAggregation
}) {
  const latestData = useRef({ createdData, updatedData });
  useEffect(() => {
    latestData.current = { createdData, updatedData };
  });

  const intl = useIntl();

  const [interval, setInterval] = useState(() => rangeToCalendarInterval(range));
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    setInterval(rangeToCalendarInterval(range));
  }, [range]);

  // Reload the graph with changed `interval` option
  useEffect(() => {
    const promises = [];

    setLoading(true);

    if (latestData.current.createdData) {
      promises.push(
        loadAggregation('createdAt', previousOptions => ({
          ...previousOptions,
          interval
        }))
      );
    }

    if (latestData.current.updatedData) {
      promises.push(
        loadAggregation('updatedAt', previousOptions => ({
          ...previousOptions,
          interval
        }))
      );
    }

    Promise.allSettled(promises).then(() => setLoading(false));
  }, [interval, loadAggregation]);

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

  const displayedInterval = useMemo(
    () => createdAggregation?.interval || updatedAggregation?.interval,
    [createdAggregation, updatedAggregation]
  );

  return (
    <>
      <h3 className="text-center">
        {intl.formatMessage(messages.savedEventsBySelector, {
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
        })}
      </h3>

      <HorizontalBarChart
        data={data}
        total={totalEvents}
        dataKey={createdData && updatedData ? 'createdCount' : 'eventCount'}
        dataKey1={createdData && updatedData ? 'updatedCount' : undefined}
        labelKey="key"
        renderTooltipItem={(
          <DateTooltipItem
            interval={displayedInterval}
            message={messages.tooltipContent}
          />
        )}
        xAxisTick={<DateAxisTick interval={displayedInterval} />}
      />
    </>
  );
}

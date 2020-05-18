import React, {
  useState, useLayoutEffect, useEffect, useMemo
} from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Spinner } from '@openagenda/react-components';
import rangeToCalendarInterval from '../utils/rangeToCalendarInterval';
import HorizontalBarChart from './basics/HorizontalBarChart';
import DateTooltipItem from './basics/DateTooltipItem';
import DateAxisTick from './basics/DateAxisTick';
import IntervalSelect from './IntervalSelect';

const messages = defineMessages({
  timingsBySelector: {
    id: 'AgendaStats.TimingsChart.timingsBySelector',
    defaultMessage: 'Timings by {selector}'
  },
  tooltipContent: {
    id: 'AgendaStats.TimingsChart.tooltipContent',
    defaultMessage: '{value, number} timings'
  }
});

export default function TimingsChart({
  data,
  totalEvents,
  range,
  aggregation,
  loadAggregation
}) {
  const intl = useIntl();

  const [interval, setInterval] = useState(() => rangeToCalendarInterval(range));
  const [loading, setLoading] = useState(false);

  const diplayedInterval = useMemo(() => aggregation.interval);

  useLayoutEffect(() => {
    setInterval(rangeToCalendarInterval(range));
  }, [range]);

  // Reload the graph with changed `interval` option
  useEffect(() => {
    setLoading(true);
    loadAggregation(aggregation.key, previousOptions => ({
      ...previousOptions,
      interval
    })).finally(() => setLoading(false));
  }, [aggregation.key, interval, loadAggregation]);

  return (
    <>
      <h3 className="text-center">
        {intl.formatMessage(messages.timingsBySelector, {
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
        dataKey="timingCount"
        labelKey="key"
        renderTooltipItem={(
          <DateTooltipItem
            interval={diplayedInterval}
            message={messages.tooltipContent}
          />
        )}
        xAxisTick={<DateAxisTick interval={diplayedInterval} />}
      />
    </>
  );
}

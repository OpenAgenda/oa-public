import _ from 'lodash';
import React, {
  useMemo,
  useCallback,
  useState,
  useLayoutEffect,
  useEffect,
  useRef
} from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Spinner } from '@openagenda/react-components';
import * as statsActions from '../reducers/stats';
import rangeToCalendarInterval from '../utils/rangeToCalendarInterval';
import ComposedChart from './ComposedChart';
import IntervalSelect from './IntervalSelect';
import LoadMore from './LoadMore';
// import OriginAgendasPieChart from './OriginAgendasPieChart';

const messages = defineMessages({
  withSelector: {
    id: 'AgendaStats.AggregationCharts.withSelector',
    defaultMessage: '{message} by {selector}'
  },

  regions: {
    id: 'AgendaStats.AggregationCharts.titles.regions',
    defaultMessage: 'Regions'
  },
  departments: {
    id: 'AgendaStats.AggregationCharts.titles.departments',
    defaultMessage: 'Departments'
  },
  cities: {
    id: 'AgendaStats.AggregationCharts.titles.cities',
    defaultMessage: 'Cities'
  },
  timings: {
    id: 'AgendaStats.AggregationCharts.titles.timings',
    defaultMessage: 'Timings'
  },
  createdAtUpdatedAt: {
    id: 'AgendaStats.AggregationCharts.titles.createdAtUpdatedAt',
    defaultMessage: 'Saved events'
  },
  members: {
    id: 'AgendaStats.AggregationCharts.titles.members',
    defaultMessage: 'Members'
  },
  originAgendas: {
    id: 'AgendaStats.AggregationCharts.titles.originAgendas',
    defaultMessage: 'Origin agendas'
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

function ChartWrapper({
  stat, range, totalEvents, loadStat, children
}) {
  const intl = useIntl();

  const [interval, setInterval] = useState(() => rangeToCalendarInterval(range));
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

  const loadMore = useCallback(
    () => loadStat(stat.id, (options, actualData) => ({
      ...options,
      size: (actualData.length || 0) + 5
    })),
    [loadStat, stat.id]
  );

  const titleMessage = useMemo(() => {
    let message = intl.formatMessage(
      messages[statToTitleMessageKey(stat.aggregation)]
    );

    if (stat.chart.intervalSelector) {
      message = intl.formatMessage(messages.withSelector, {
        message,
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

    return message;
  }, [interval, intl, loading, stat.aggregation, stat.chart.intervalSelector]);

  useLayoutEffect(() => {
    setInterval(rangeToCalendarInterval(range));
  }, [range]);

  // Reload the graph with changed `interval` option
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setLoading(true);
    loadStat(stat.id, previousOptions => ({
      ...previousOptions,
      interval
    })).finally(() => setLoading(false));
  }, [stat.aggregation.key, interval, loadStat, stat.id]);

  return (
    <div className="col-md-12 col-lg-6 margin-top-md">
      <h3 className="text-center">{titleMessage}</h3>

      {children}

      {stat.chart.loadMore ? (
        <LoadMore stat={stat} total={totalEvents} loadMore={loadMore} />
      ) : null}
    </div>
  );
}

export default function AggregationCharts({
  agenda,
  // agendaSchema,
  stats,
  totalEvents,
  range
}) {
  const dispatch = useDispatch();

  const loadStat = useCallback(
    (statId, getOptions) => dispatch(statsActions.loadStat(agenda, statId, getOptions)),
    [agenda, dispatch]
  );

  const result = [];

  let sepCount = 0;
  let chartsFromLastSep = 0;
  const pushSeparator = () => {
    result.push(<div key={`sep-${sepCount}`} className="clearfix" />);
    sepCount += 1;
    chartsFromLastSep = 0;
  };
  const pushSeparatorIfEven = () => {
    if (chartsFromLastSep > 0 && chartsFromLastSep % 2 === 0) {
      pushSeparator();
    }
  };
  const pushChart = chart => {
    pushSeparatorIfEven();
    result.push(chart);
    chartsFromLastSep += 1;
  };

  stats.forEach(stat => {
    if (stat.separator) {
      pushSeparator();
    }

    if (!stat.chart) {
      return null;
    }

    const multiData = Array.isArray(stat.aggregation);
    const hasData = multiData
      ? stat.data?.some(v => v.length)
      : stat.data?.length;

    if (hasData) {
      pushChart(
        <ComposedChart
          key={stat.id}
          wrapperComponent={<ChartWrapper />}
          stat={stat}
          total={totalEvents}
          range={range}
          loadStat={loadStat}
        />
      );
    }
  });

  /* if (data.additionalFields) {
    for (const field in data.additionalFields) {
      if ({}.hasOwnProperty.call(data.additionalFields, field)) {
        const additionalFieldData = data.additionalFields[field];

        pushChart(
          <div key={field} className="col-md-12 col-lg-6 margin-top-md">
            <h3 className="text-center">
              {getLocaleValue(additionalFieldData.label, intl.locale)}
            </h3>
            <VerticalBarChart
              data={additionalFieldData.values}
              total={totalEvents}
              dataKey="eventCount"
              labelKey={additionalFieldLabelKey}
              // withRest
              // noValueRest
            />
          </div>
        );
      }
    }
  } */

  return <div className="row">{result}</div>;
}

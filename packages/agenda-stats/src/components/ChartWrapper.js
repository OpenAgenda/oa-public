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
import { Spinner } from '@openagenda/react-components';
import rangeToCalendarInterval from '../utils/rangeToCalendarInterval';
import getLocaleValue from '../utils/getLocaleValue';
import IntervalSelect from './basics/IntervalSelect';
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

export default function ChartWrapper({
  stat,
  range,
  totalEvents,
  loadStat,
  children
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

  // const additionalField = useMemo(
  //   () => stat.fieldSchema?.find(v => v.field === stat.aggregation.field),
  //   [agendaSchema.fields, stat.aggregation.field]
  // );

  // console.log('additionalField', additionalField);

  const titleMessage = useMemo(() => {
    const messageKey = statToTitleMessageKey(stat.aggregation);
    let message = messageKey === 'additionalFields'
      ? getLocaleValue(stat.fieldSchema.label, intl.locale)
      : intl.formatMessage(messages[messageKey]);

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

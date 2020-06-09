import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { useUpdateEffect, usePrevious } from 'react-use';
import { useIntl, defineMessages } from 'react-intl';
import { Spinner } from '@openagenda/react-components';
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
  createdAt: {
    id: 'AgendaStats.AggregationCharts.titles.createdAt',
    defaultMessage: 'Created events'
  },
  updatedAt: {
    id: 'AgendaStats.AggregationCharts.titles.updatedAt',
    defaultMessage: 'Updated events'
  },
  members: {
    id: 'AgendaStats.AggregationCharts.titles.members',
    defaultMessage: 'Members'
  },
  originAgendas: {
    id: 'AgendaStats.AggregationCharts.titles.originAgendas',
    defaultMessage: 'Origin agendas'
  },
  keywords: {
    id: 'AgendaStats.AggregationCharts.titles.keywords',
    defaultMessage: 'Keywords'
  },
  states: {
    id: 'AgendaStats.AggregationCharts.titles.states',
    defaultMessage: 'States'
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
  stat, totalEvents, loadStat, children
}) {
  const intl = useIntl();

  const [interval, setInterval] = useState(stat.aggregation.interval);
  const previousInterval = usePrevious(interval);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(
    () => loadStat(stat.id, (options, actualData) => ({
      ...options,
      size: (actualData.length || 0) + 5
    })),
    [loadStat, stat.id]
  );

  const titleMessage = (() => {
    const messageKey = statToTitleMessageKey(stat.aggregation);

    let message;

    if (stat.fieldSchema) {
      message = getLocaleValue(stat.fieldSchema.label, intl.locale);
    } else if (messages[messageKey]) {
      message = intl.formatMessage(messages[messageKey]);
    } else {
      message = messageKey;
    }

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
  })();

  // Reload the graph with changed `interval` option
  useUpdateEffect(() => {
    if (interval === previousInterval) {
      return;
    }

    setLoading(true);
    loadStat(stat.id, previousOptions => ({
      ...previousOptions,
      interval
    })).finally(() => setLoading(false));
  }, [interval, loadStat, previousInterval, stat.id]);

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

export default ChartWrapper;

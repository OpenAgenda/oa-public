import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { isSameDay } from 'date-fns';
import { Spinner } from '@openagenda/react-components';
import { useApiClient, useModal } from '@openagenda/react-shared';
import * as statsActions from '../reducers/stats';
import PeriodModal from '../components/PeriodModal';
import AggregationCharts from '../components/AggregationCharts';
import determineDefaultRange from '../utils/determineDefaultRange';
import rangeToCalendarInterval from '../utils/rangeToCalendarInterval';
import DEFAULT_STATS from '../common/defaultStats';

const messages = defineMessages({
  title: {
    id: 'AgendaStats.Dashboard.title',
    defaultMessage: 'Statistics'
  },
  sameDayRange: {
    id: 'AgendaStats.Dashboard.sameDayRange',
    defaultMessage: 'The {startDate, date}'
  },
  range: {
    id: 'AgendaStats.Dashboard.range',
    defaultMessage: 'From {startDate, date} to {endDate, date}'
  },
  update: {
    id: 'AgendaStats.Dashboard.update',
    defaultMessage: 'Update'
  }
});

function getStatsToLoad(agendaSchema) {
  return DEFAULT_STATS.concat({ separator: true })
    .concat(
      agendaSchema.fields.map(fieldSchema => ({
        aggregation: {
          type: 'additionalFields',
          field: fieldSchema.field
        },
        chart: {
          orientation: 'vertical',
          dataKey: 'eventCount',
          labelKey: 'label'
        },
        fieldSchema
      }))
    )
    .map(v => ({ id: _.uniqueId(), ...v }));
}

function Dashboard({ agenda, agendaSchema }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const apiClient = useApiClient();

  const res = useSelector(state => state.res);
  const loading = useSelector(state => _.get(state, 'stats.loading', true));
  const loaded = useSelector(state => _.get(state, 'stats.loaded'));
  const stats = useSelector(state => state.stats.data);
  const totalEvents = useSelector(state => state.stats.totalEvents);

  const [range, setRange] = useState(undefined);
  const dateRangeModal = useModal();

  // Load timespan & aggregations
  useEffect(() => {
    if (loaded) {
      return;
    }

    const query = {};
    const url = res.jsonExport
      .replace(':slug', agenda.slug)
      .replace(':uid', agenda.uid);

    const params = {
      oaq: { passed: 1 },
      size: 0,
      aggregations: ['timespan']
    };

    apiClient.get(url, { params }).then(result => {
      const { first, last } = result.data.aggregations.timespan;

      const defaultRange = determineDefaultRange({ first, last });

      setRange(defaultRange);
      _.set(query, 'date.gte', defaultRange.startDate);
      _.set(query, 'date.lte', defaultRange.endDate);

      return dispatch(
        statsActions.load(
          agenda,
          getStatsToLoad(agendaSchema),
          query,
          rangeToCalendarInterval(defaultRange)
        )
      );
    });
  }, [agenda, agendaSchema, apiClient, dispatch, loaded, res.jsonExport]);

  if (loading && !loaded) {
    return (
      <div className="padding-v-md" css={{ position: 'relative' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h2>{intl.formatMessage(messages.title)}</h2>

      <div className="margin-top-sm">
        {range ? (
          <>
            {isSameDay(range.startDate, range.endDate) ? (
              <>{intl.formatMessage(messages.sameDayRange, range)}</>
            ) : (
              <>{intl.formatMessage(messages.range, range)}</>
            )}

            <button
              type="button"
              className="btn btn-link-inline margin-left-sm"
              onClick={() => dateRangeModal.open()}
            >
              {intl.formatMessage(messages.update)}
            </button>
          </>
        ) : null}
      </div>

      {typeof totalEvents === 'number' ? (
        <div className="margin-top-xs">
          <FormattedMessage
            id="AgendaStats.Dashboard.totalEvents"
            defaultMessage="{total, number} {total, plural, =0 {event} one {event} other {events}}"
            values={{
              total: totalEvents
            }}
          />
        </div>
      ) : null}

      {stats ? (
        <AggregationCharts
          agenda={agenda}
          stats={stats}
          totalEvents={totalEvents}
          range={range}
        />
      ) : null}

      {dateRangeModal.isOpen ? (
        <PeriodModal
          initialValues={[range]}
          onSubmit={value => dispatch(
            statsActions.load(
              agenda,
              getStatsToLoad(agendaSchema),
              {
                date: {
                  gte: value[0].startDate,
                  lte: value[0].endDate
                }
              },
              rangeToCalendarInterval(value[0])
            )
          ).then(() => {
            setRange(value[0]);
          })}
          onClose={() => dateRangeModal.close()}
        />
      ) : null}
    </div>
  );
}

export default hot(Dashboard);

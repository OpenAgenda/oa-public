import _ from 'lodash';
import React, {
  useEffect,
  useState,
  useRef
} from 'react';
import { hot } from 'react-hot-loader/root';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import {
  isSameDay,
  getOverlappingDaysInIntervals,
  startOfYear,
  endOfYear,
  addYears,
  isAfter
} from 'date-fns';
import { Spinner } from '@openagenda/react-components';
import { useModal, useApiClient } from '@openagenda/react-shared';
import * as statsActions from '../reducers/stats';
import PeriodModal from '../components/PeriodModal';
import AggregationCharts from '../components/AggregationCharts';

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

function Dashboard({ agenda }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const apiClient = useApiClient();

  const res = useSelector(state => state.res);
  const loading = useSelector(state => _.get(state, 'stats.loading', true));
  const loaded = useSelector(state => _.get(state, 'stats.loaded'));
  const aggregations = useSelector(state => state.stats.data);
  const totalEvents = useSelector(state => state.stats.totalEvents);

  const [range, setRange] = useState(undefined);
  const dateRangeModal = useModal();

  const aggregationChartsRef = useRef(null);

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

    apiClient.get(url, { params })
      .then(result => {
        const { first, last } = result.data.aggregations.timespan;

        if (!first) {
          // Nothing to display
          return;
        }

        const now = new Date();
        const datePlusOneYear = addYears(now, 1);
        const thisYear = { start: startOfYear(now), end: endOfYear(now) };
        const nextYear = { start: startOfYear(datePlusOneYear), end: endOfYear(datePlusOneYear) };
        const interval = { start: new Date(first), end: new Date(last) };

        const selectRange = value => {
          setRange(value);
          _.set(query, 'date.gte', value.startDate);
          _.set(query, 'date.lte', value.endDate);
        };

        if (getOverlappingDaysInIntervals(interval, thisYear)) {
          selectRange({
            startDate: thisYear.start,
            endDate: thisYear.end
          });
        } else if (getOverlappingDaysInIntervals(interval, nextYear)) {
          selectRange({
            startDate: nextYear.start,
            endDate: nextYear.end
          });
        } else if (isAfter(interval.start, now)) {
          selectRange({ startDate: startOfYear(interval.start), endDate: endOfYear(interval.start) });
        } else {
          selectRange({ startDate: startOfYear(interval.end), endDate: endOfYear(interval.end) });
        }

        return dispatch(statsActions.load(agenda, query));
      });
  }, [agenda, apiClient, dispatch, loaded, res.jsonExport]);

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

      {aggregations ? (
        <AggregationCharts
          ref={aggregationChartsRef}
          aggregations={aggregations}
          totalEvents={totalEvents}
          range={range}
        />
      ) : null}

      {/* {charts?.length ? <div className="row">{charts}</div> : null} */}

      {/* <pre>{JSON.stringify(Object.keys(aggregations), null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(aggregations.originAgendas, null, 2)}</pre> */}

      {dateRangeModal.isOpen ? (
        <PeriodModal
          initialValues={[range]}
          onSubmit={value => dispatch(statsActions.load(agenda, {
            date: {
              gte: value[0].startDate,
              lte: value[0].endDate
            }
          }))
            .then(() => {
              setRange(value[0]);
            })}
          onClose={() => dateRangeModal.close()}
        />
      ) : null}
    </div>
  );
}

export default hot(Dashboard);

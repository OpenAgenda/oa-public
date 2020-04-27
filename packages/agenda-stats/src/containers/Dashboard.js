import _ from 'lodash';
import React, { useEffect, useState, useMemo } from 'react';
import { hot } from 'react-hot-loader/root';
import { useIntl, defineMessages } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { isSameDay } from 'date-fns';
import { Spinner } from '@openagenda/react-components';
import { useModal } from '@openagenda/react-shared';
import * as statsActions from '../reducers/stats';
// import OriginAgendasPieChart from '../components/OriginAgendasPieChart';
import VerticalBarChart from '../components/VerticalBarChart';
import HorizontalBarChart from '../components/HorizontalBarChart';
import PeriodModal from '../components/PeriodModal';
import dateRanges from '../dateRanges';

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
  originAgendas: {
    id: 'AgendaStats.Dashboard.originAgendas',
    defaultMessage: 'Origin agendas'
  },
  regions: {
    id: 'AgendaStats.Dashboard.regions',
    defaultMessage: 'Regions'
  },
  cities: {
    id: 'AgendaStats.Dashboard.cities',
    defaultMessage: 'Cities'
  },
  departments: {
    id: 'AgendaStats.Dashboard.departments',
    defaultMessage: 'Departments'
  },
  members: {
    id: 'AgendaStats.Dashboard.members',
    defaultMessage: 'Members'
  },
  timingsByMonth: {
    id: 'AgendaStats.Dashboard.timingsByMonth',
    defaultMessage: 'Timings by month'
  },
  timingsByDay: {
    id: 'AgendaStats.Dashboard.timingsByDay',
    defaultMessage: 'Timings by day'
  }
});

function Dashboard({ user, agenda }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  // const apiClient = useApiClient();

  const loading = useSelector(state => _.get(state, 'stats.loading', true));
  const loaded = useSelector(state => _.get(state, 'stats.loaded'));
  const aggregations = useSelector(state => state.stats.data);
  const totalEvents = useSelector(state => state.stats.totalEvents);

  const { staticRanges } = useMemo(() => dateRanges(intl), [intl]);
  const [range, setRange] = useState({
    ...staticRanges[2].range(),
    key: 'selection'
  });
  const dateRangeModal = useModal();

  const charts = useMemo(() => {
    if (!aggregations) {
      return null;
    }

    const result = [];

    let sepCount = 0;
    const pushSeparator = () => {
      result.push(<div key={`sep-${sepCount}`} className="col-md-12" />);
      sepCount += 1;
    };

    if (aggregations.regions?.length) {
      result.push(
        <div key="regions" className="col-md-12 col-lg-6 margin-top-md">
          <h3 className="text-center">
            {intl.formatMessage(messages.regions)}
          </h3>
          <VerticalBarChart
            data={aggregations.regions}
            total={totalEvents}
            dataKey="eventCount"
            labelKey="key"
          />
        </div>
      );
    }

    if (aggregations.departments?.length) {
      result.push(
        <div key="departments" className="col-md-12 col-lg-6 margin-top-md">
          <h3 className="text-center">
            {intl.formatMessage(messages.departments)}
          </h3>
          <VerticalBarChart
            data={aggregations.departments}
            total={totalEvents}
            dataKey="eventCount"
            labelKey="key"
          />
        </div>
      );
    }

    if (aggregations.cities?.length) {
      result.push(
        <div key="cities" className="col-md-12 col-lg-6 margin-top-md">
          <h3 className="text-center">{intl.formatMessage(messages.cities)}</h3>
          <VerticalBarChart
            data={aggregations.cities}
            total={totalEvents}
            dataKey="eventCount"
            labelKey="key"
          />
        </div>
      );
    }

    pushSeparator();

    if (aggregations.members?.length) {
      result.push(
        <div key="members" className="col-md-12 col-lg-6 margin-top-md">
          <h3 className="text-center">
            {intl.formatMessage(messages.members)}
          </h3>
          <VerticalBarChart
            data={aggregations.members}
            total={totalEvents}
            dataKey="eventCount"
            labelKey="member.name"
          />
        </div>
      );
    }

    if (aggregations.originAgendas?.length) {
      // result.push(
      //   <div key="originAgendasPie" className="col-md-12 col-lg-6 margin-top-md">
      //     <h3 className="text-center">{intl.formatMessage(messages.originAgendas)}</h3>
      //     <OriginAgendasPieChart data={aggregations.originAgendas} total={totalEvents} />
      //   </div>
      // );
      result.push(
        <div
          key="originAgendasBar"
          className="col-md-12 col-lg-6 margin-top-md"
        >
          <h3 className="text-center">
            {intl.formatMessage(messages.originAgendas)}
          </h3>
          <VerticalBarChart
            data={aggregations.originAgendas}
            total={totalEvents}
            dataKey="eventCount"
            labelKey="agenda.title"
          />
        </div>
      );
    }

    pushSeparator();

    if (aggregations.timingsByMonth?.length) {
      result.push(
        <div key="timingsByMonth" className="col-md-12 col-lg-6 margin-top-md">
          <h3 className="text-center">
            {intl.formatMessage(messages.timingsByMonth)}
          </h3>
          <HorizontalBarChart
            data={aggregations.timingsByMonth}
            total={totalEvents}
            dataKey="timingCount"
            labelKey="key"
          />
        </div>
      );
    }

    if (aggregations.timingsByDay?.length) {
      result.push(
        <div key="timingsByDay" className="col-md-12 col-lg-6 margin-top-md">
          <h3 className="text-center">
            {intl.formatMessage(messages.timingsByDay)}
          </h3>
          <HorizontalBarChart
            data={aggregations.timingsByDay}
            total={totalEvents}
            dataKey="timingCount"
            labelKey="key"
          />
        </div>
      );
    }

    pushSeparator();

    return result;
  }, [aggregations, totalEvents, intl]);

  useEffect(() => {
    const query = {};

    if (range) {
      _.set(query, 'date.gte', range.startDate);
      _.set(query, 'date.lte', range.endDate);
    }

    dispatch(statsActions.load(agenda, query));
  }, [dispatch, user, agenda, range]);

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

      <div>
        {range ? (
          <>
            {isSameDay(range.startDate, range.endDate) ? (
              <>{intl.formatMessage(messages.sameDayRange, range)}</>
            ) : (
              <>{intl.formatMessage(messages.range, range)}</>
            )}
          </>
        ) : null}

        <button
          type="button"
          className="btn btn-link-inline margin-left-sm"
          onClick={() => dateRangeModal.open()}
        >
          Modifier
        </button>
      </div>

      {charts?.length ? <div className="row">{charts}</div> : null}

      {/* <pre>{JSON.stringify(Object.keys(aggregations), null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(aggregations.originAgendas, null, 2)}</pre> */}

      {dateRangeModal.isOpen ? (
        <PeriodModal
          initialValues={[range]}
          onSubmit={value => {
            setRange(value[0]);
            dateRangeModal.close();
          }}
          onClose={() => dateRangeModal.close()}
        />
      ) : null}
    </div>
  );
}

export default hot(Dashboard);

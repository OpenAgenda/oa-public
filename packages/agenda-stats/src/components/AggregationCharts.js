import _ from 'lodash';
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect
} from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { useIntl, defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { ReactSelectInput } from '@openagenda/react-shared';
import * as statsActions from '../reducers/stats';
import getLocaleValue from '../utils/getLocaleValue';
import VerticalBarChart from './VerticalBarChart';
import TimingsChart from './TimingsChart';
import SavedEventsChart from './SavedEventsChart';
import LoadMore from './LoadMore';
// import OriginAgendasPieChart from './OriginAgendasPieChart';

const messages = defineMessages({
  originAgendas: {
    id: 'AgendaStats.AggregationCharts.originAgendas',
    defaultMessage: 'Origin agendas'
  },
  regions: {
    id: 'AgendaStats.AggregationCharts.regions',
    defaultMessage: 'Regions'
  },
  cities: {
    id: 'AgendaStats.AggregationCharts.cities',
    defaultMessage: 'Cities'
  },
  departments: {
    id: 'AgendaStats.AggregationCharts.departments',
    defaultMessage: 'Departments'
  },
  members: {
    id: 'AgendaStats.AggregationCharts.members',
    defaultMessage: 'Members'
  },
  month: {
    id: 'AgendaStats.AggregationCharts.month',
    defaultMessage: 'month'
  },
  week: {
    id: 'AgendaStats.AggregationCharts.week',
    defaultMessage: 'week'
  },
  day: {
    id: 'AgendaStats.AggregationCharts.day',
    defaultMessage: 'day'
  },
  timingsBySelector: {
    id: 'AgendaStats.AggregationCharts.timingsBySelector',
    defaultMessage: 'Timings by {selector}'
  },
  savedEventsBySelector: {
    id: 'AgendaStats.AggregationCharts.savedEventsBySelector',
    defaultMessage: 'Saved events by {selector}'
  }
});

function rangeToTimingInterval(range) {
  if (!range) {
    return null;
  }

  const rangeDurationInDays = differenceInCalendarDays(
    range.endDate,
    range.startDate
  );

  if (rangeDurationInDays <= 31) {
    return 'day';
  }

  if (rangeDurationInDays > 31 && rangeDurationInDays <= 183) {
    return 'week';
  }

  return 'month';
}

const intervalSelectStyles = {
  container: provided => ({
    ...provided,
    maxWidth: '150px',
    width: '150px',
    display: 'inline-block'
  }),
  option: provided => ({
    ...provided,
    textAlign: 'left'
  })
};

function IntervalSelect({ value, onChange }) {
  const intl = useIntl();

  const intervalOptions = useMemo(
    () => [
      { value: 'day', label: intl.formatMessage(messages.day) },
      { value: 'week', label: intl.formatMessage(messages.week) },
      { value: 'month', label: intl.formatMessage(messages.month) }
    ],
    [intl]
  );

  const valueOption = useMemo(
    () => intervalOptions.find(opt => opt.value === value),
    [intervalOptions, value]
  );
  const handleChange = useCallback(opt => onChange(opt.value), [onChange]);

  return (
    <ReactSelectInput
      options={intervalOptions}
      value={valueOption}
      onChange={handleChange}
      styles={intervalSelectStyles}
    />
  );
}

export default function AggregationCharts({
  agenda,
  aggregations,
  totalEvents,
  range
}) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [timingsInterval, setTimingsInterval] = useState(() => rangeToTimingInterval(range));
  const [savedEventsInterval, setSavedEventsInterval] = useState(() => rangeToTimingInterval(range));

  useLayoutEffect(() => {
    setTimingsInterval(rangeToTimingInterval(range));
    setSavedEventsInterval(rangeToTimingInterval(range));
  }, [range]);

  const getLocaleLabel = useCallback(
    labelPath => payload => getLocaleValue(_.get(payload, labelPath), intl.locale),
    [intl.locale]
  );

  const additionalFieldLabelKey = useMemo(() => getLocaleLabel('label'), [
    getLocaleLabel
  ]);

  const timingsData = useMemo(() => {
    if (timingsInterval === 'day') {
      return aggregations.timingsByDay;
    }

    if (timingsInterval === 'week') {
      return aggregations.timingsByWeek;
    }

    if (timingsInterval === 'month') {
      return aggregations.timingsByMonth;
    }
  }, [
    aggregations.timingsByDay,
    aggregations.timingsByMonth,
    aggregations.timingsByWeek,
    timingsInterval
  ]);

  const createdEventsData = useMemo(() => {
    if (savedEventsInterval === 'day') {
      return aggregations.createdAtByDay;
    }

    if (savedEventsInterval === 'week') {
      return aggregations.createdAtByWeek;
    }

    if (savedEventsInterval === 'month') {
      return aggregations.createdAtByMonth;
    }
  }, [
    aggregations.createdAtByDay,
    aggregations.createdAtByWeek,
    aggregations.createdAtByMonth,
    savedEventsInterval
  ]);

  const updatedEventsData = useMemo(() => {
    if (savedEventsInterval === 'day') {
      return aggregations.updatedAtByDay;
    }

    if (savedEventsInterval === 'week') {
      return aggregations.updatedAtByWeek;
    }

    if (savedEventsInterval === 'month') {
      return aggregations.updatedAtByMonth;
    }
  }, [
    aggregations.updatedAtByDay,
    aggregations.updatedAtByWeek,
    aggregations.updatedAtByMonth,
    savedEventsInterval
  ]);

  const loadMore = useCallback(
    aggregation => dispatch(statsActions.loadMore(agenda, aggregation)),
    [agenda, dispatch]
  );

  // TODO on timingsInterval change: reload the aggregation
  useEffect(() => {}, []);

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

  if (aggregations.regions?.length) {
    pushChart(
      <div key="regions" className="col-md-12 col-lg-6 margin-top-md">
        <h3 className="text-center">{intl.formatMessage(messages.regions)}</h3>
        <VerticalBarChart
          data={aggregations.regions}
          total={totalEvents}
          dataKey="eventCount"
          labelKey="key"
        />
        <LoadMore
          data={aggregations.regions}
          total={totalEvents}
          dataKey="eventCount"
          aggregation="regions"
          loadMore={loadMore}
        />
      </div>
    );
  }

  if (aggregations.departments?.length) {
    pushChart(
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
        <LoadMore
          data={aggregations.departments}
          total={totalEvents}
          dataKey="eventCount"
          aggregation="departments"
          loadMore={loadMore}
        />
      </div>
    );
  }

  if (aggregations.cities?.length) {
    pushChart(
      <div key="cities" className="col-md-12 col-lg-6 margin-top-md">
        <h3 className="text-center">{intl.formatMessage(messages.cities)}</h3>
        <VerticalBarChart
          data={aggregations.cities}
          total={totalEvents}
          dataKey="eventCount"
          labelKey="key"
        />
        <LoadMore
          data={aggregations.cities}
          total={totalEvents}
          dataKey="eventCount"
          aggregation="cities"
          loadMore={loadMore}
        />
      </div>
    );
  }

  pushSeparator();

  if (aggregations.members?.length) {
    pushChart(
      <div key="members" className="col-md-12 col-lg-6 margin-top-md">
        <h3 className="text-center">{intl.formatMessage(messages.members)}</h3>
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
    pushChart(
      <div key="originAgendasBar" className="col-md-12 col-lg-6 margin-top-md">
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

  if (timingsData) {
    pushChart(
      <div key="timings" className="col-md-12 col-lg-6 margin-top-md">
        <h3 className="text-center">
          {intl.formatMessage(messages.timingsBySelector, {
            selector: (
              <IntervalSelect
                value={timingsInterval}
                onChange={setTimingsInterval}
              />
            )
          })}
        </h3>

        <TimingsChart
          data={timingsData}
          totalEvents={totalEvents}
          interval={timingsInterval}
        />
      </div>
    );
  }

  pushSeparator();

  if (createdEventsData || updatedEventsData) {
    pushChart(
      <div key="savedEvents" className="col-md-12 col-lg-6 margin-top-md">
        <h3 className="text-center">
          {intl.formatMessage(messages.savedEventsBySelector, {
            selector: (
              <IntervalSelect
                value={savedEventsInterval}
                onChange={setSavedEventsInterval}
              />
            )
          })}
        </h3>

        <SavedEventsChart
          createdData={createdEventsData}
          updatedData={updatedEventsData}
          totalEvents={totalEvents}
          interval={savedEventsInterval}
        />
      </div>
    );
  }

  pushSeparator();

  if (aggregations.additionalFields) {
    for (const field in aggregations.additionalFields) {
      if ({}.hasOwnProperty.call(aggregations.additionalFields, field)) {
        const additionalFieldData = aggregations.additionalFields[field];

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
  }

  return <div className="row">{result}</div>;
}

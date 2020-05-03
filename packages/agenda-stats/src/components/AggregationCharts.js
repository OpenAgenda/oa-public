import React, {
  useState,
  useMemo,
  useCallback,
  useLayoutEffect
} from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { useIntl, defineMessages } from 'react-intl';
import { ReactSelectInput } from '@openagenda/react-shared';
import VerticalBarChart from './VerticalBarChart';
import TimingsChart from './TimingsChart';
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
  }
});

function rangeToTimingInterval(range) {
  if (!range) {
    return null;
  }

  const rangeDurationInDays = differenceInCalendarDays(range.endDate, range.startDate);

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

  const intervalOptions = useMemo(() => ([
    { value: 'day', label: intl.formatMessage(messages.day) },
    { value: 'week', label: intl.formatMessage(messages.week) },
    { value: 'month', label: intl.formatMessage(messages.month) },
  ]), [intl]);

  const valueOption = useMemo(() => intervalOptions.find(opt => opt.value === value), [intervalOptions, value]);
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
  aggregations,
  totalEvents,
  range
}) {
  const intl = useIntl();

  const [timingsAggregationInterval, setTimingsAggregationInterval] = useState(() => rangeToTimingInterval(range));

  useLayoutEffect(() => {
    setTimingsAggregationInterval(rangeToTimingInterval(range));
  }, [range]);

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
      </div>
    );
  }

  pushSeparator();

  if (aggregations.members?.length) {
    pushChart(
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
    pushChart(
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

  pushChart(
    <div key="timings" className="col-md-12 col-lg-6 margin-top-md">
      <h3 className="text-center">
        {intl.formatMessage(messages.timingsBySelector, {
          selector: (
            <IntervalSelect
              value={timingsAggregationInterval}
              onChange={setTimingsAggregationInterval}
            />
          )
        })}
      </h3>

      {timingsAggregationInterval === 'day' ? (
        <TimingsChart
          data={aggregations.timingsByDay}
          totalEvents={totalEvents}
          interval={timingsAggregationInterval}
        />
      ) : null}
      {timingsAggregationInterval === 'week' ? (
        <TimingsChart
          data={aggregations.timingsByWeek}
          totalEvents={totalEvents}
          interval={timingsAggregationInterval}
        />
      ) : null}
      {timingsAggregationInterval === 'month' ? (
        <TimingsChart
          data={aggregations.timingsByMonth}
          totalEvents={totalEvents}
          interval={timingsAggregationInterval}
        />
      ) : null}
    </div>
  );

  pushSeparator();

  return (
    <div className="row">
      {result}
    </div>
  );
}

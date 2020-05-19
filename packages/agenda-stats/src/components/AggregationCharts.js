import _ from 'lodash';
import React, { useMemo, useCallback } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import * as statsActions from '../reducers/stats';
import getLocaleValue from '../utils/getLocaleValue';
import VerticalBarChart from './basics/VerticalBarChart';
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
  }
});

export default function AggregationCharts({
  agenda,
  aggregations,
  data,
  totalEvents,
  range
}) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const getLocaleLabel = useCallback(
    labelPath => payload => getLocaleValue(_.get(payload, labelPath), intl.locale),
    [intl.locale]
  );

  const additionalFieldLabelKey = useMemo(() => getLocaleLabel('label'), [
    getLocaleLabel
  ]);

  const createdAggregation = useMemo(
    () => aggregations.find(v => v.key === 'createdAt'),
    [aggregations]
  );
  const updatedAggregation = useMemo(
    () => aggregations.find(v => v.key === 'updatedAt'),
    [aggregations]
  );
  const timingsAggregation = useMemo(
    () => aggregations.find(v => v.key === 'timings'),
    [aggregations]
  );

  const loadMore = useCallback(
    aggregationKey => dispatch(
      statsActions.loadAggregation(
        agenda,
        aggregationKey,
        (options, actualData) => ({
          ...options,
          size: (actualData.length || 0) + 5
        })
      )
    ),
    [agenda, dispatch]
  );

  const loadAggregation = useCallback(
    (aggregationKey, options) => dispatch(statsActions.loadAggregation(agenda, aggregationKey, options)),
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

  if (data.regions?.length) {
    pushChart(
      <div key="regions" className="col-md-12 col-lg-6 margin-top-md">
        <h3 className="text-center">{intl.formatMessage(messages.regions)}</h3>
        <VerticalBarChart
          data={data.regions}
          total={totalEvents}
          dataKey="eventCount"
          labelKey="key"
        />
        <LoadMore
          data={data.regions}
          total={totalEvents}
          dataKey="eventCount"
          aggregationKey="regions"
          loadMore={loadMore}
        />
      </div>
    );
  }

  if (data.departments?.length) {
    pushChart(
      <div key="departments" className="col-md-12 col-lg-6 margin-top-md">
        <h3 className="text-center">
          {intl.formatMessage(messages.departments)}
        </h3>
        <VerticalBarChart
          data={data.departments}
          total={totalEvents}
          dataKey="eventCount"
          labelKey="key"
        />
        <LoadMore
          data={data.departments}
          total={totalEvents}
          dataKey="eventCount"
          aggregationKey="departments"
          loadMore={loadMore}
        />
      </div>
    );
  }

  if (data.cities?.length) {
    pushChart(
      <div key="cities" className="col-md-12 col-lg-6 margin-top-md">
        <h3 className="text-center">{intl.formatMessage(messages.cities)}</h3>
        <VerticalBarChart
          data={data.cities}
          total={totalEvents}
          dataKey="eventCount"
          labelKey="key"
        />
        <LoadMore
          data={data.cities}
          total={totalEvents}
          dataKey="eventCount"
          aggregationKey="cities"
          loadMore={loadMore}
        />
      </div>
    );
  }

  pushSeparator();

  if (data.members?.length) {
    pushChart(
      <div key="members" className="col-md-12 col-lg-6 margin-top-md">
        <h3 className="text-center">{intl.formatMessage(messages.members)}</h3>
        <VerticalBarChart
          data={data.members}
          total={totalEvents}
          dataKey="eventCount"
          labelKey="member.name"
        />
      </div>
    );
  }

  if (data.originAgendas?.length) {
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
          data={data.originAgendas}
          total={totalEvents}
          dataKey="eventCount"
          labelKey="agenda.title"
        />
      </div>
    );
  }

  pushSeparator();

  if (data.timings?.length) {
    pushChart(
      <div key="timings" className="col-md-12 col-lg-6 margin-top-md">
        <TimingsChart
          range={range}
          data={data.timings}
          aggregation={timingsAggregation}
          totalEvents={totalEvents}
          loadAggregation={loadAggregation}
        />
      </div>
    );
  }

  pushSeparator();

  if (data.createdAt?.length || data.updatedAt?.length) {
    pushChart(
      <div key="savedEvents" className="col-md-12 col-lg-6 margin-top-md">
        <SavedEventsChart
          range={range}
          createdData={data.createdAt}
          updatedData={data.updatedAt}
          createdAggregation={createdAggregation}
          updatedAggregation={updatedAggregation}
          totalEvents={totalEvents}
          loadAggregation={loadAggregation}
        />
      </div>
    );
  }

  pushSeparator();

  if (data.additionalFields) {
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
  }

  return <div className="row">{result}</div>;
}

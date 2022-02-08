import _ from 'lodash';
import React, { useCallback } from 'react';
import { useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { useLatest, useUpdateEffect } from 'react-use';
import qs from 'qs';
import {
  Filters,
  DateRangeFilter,
  ChoiceFilter,
} from '@openagenda/react-filters';
import { useApiClient } from '@openagenda/react-shared';
import validateQuery from '@openagenda/event-search/utils/validateQuery';
import getEvents from '../api/getEvents';

export default function FiltersPart({
  agenda,
  agendaSchema,
  filters,
  filtersFormRef,
  initialQuery,
}) {
  const apiClient = useApiClient();
  const dispatch = useDispatch();
  const location = useLocation();

  const stats = useSelector(state => state.stats.data);
  const loading = useSelector(state => state.stats.loading);
  const query = useSelector(state => state.stats.query);
  const res = useSelector(state => state.res);
  const latestStats = useLatest(stats);
  const latestQuery = useLatest(query);

  const filtersQuery = useQuery(
    ['agenda-stats', 'filtersBase'],
    () => getEvents(
      apiClient,
      res.jsonExport,
      agenda,
      filters.filter(filter => filter.type !== 'dateRange'),
      { size: 0 }
    ),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isFetching'],
    }
  );

  const { aggregations: filterAggs } = filtersQuery.data;

  const getTotal = useCallback(
    (filter, option) => {
      const stat = stats.find(s => _.isMatch(s.aggregation, {
        type: filter.name,
        ...filter.aggregation,
      }));

      if (!stat) return 0;

      const { data } = stat.state;

      if (!data) return 0;

      const dataKey = 'id' in option ? 'id' : 'key';
      const optionKey = 'id' in option ? 'id' : 'value';

      const optionValue = data.find(v => v[dataKey] === option[optionKey]);

      if (optionValue) {
        return optionValue.eventCount || 0;
      }

      return 0;
    },
    [stats]
  );

  const getOptions = useCallback(
    filter => {
      if (filter.options) return filter.options;

      const aggregation = filterAggs[`${filter.name}-${filter.id}`];

      if (!aggregation) return [];

      return aggregation.map(v => ({
        label: v.key,
        value: v.key,
      }));
    },
    [filterAggs]
  );

  useUpdateEffect(() => {
    const search = qs.stringify(latestQuery.current, {
      addQueryPrefix: true,
      arrayFormat: 'brackets',
    });

    if (location.search !== search) {
      const baseQuery = qs.parse(location.search, {
        ignoreQueryPrefix: true,
      });
      const cleanQuery = _.pick(
        validateQuery(baseQuery, agendaSchema),
        Object.keys(baseQuery)
      );

      if (!Object.keys(cleanQuery).length) {
        return filtersFormRef.current.initialize(initialQuery);
      }

      filtersFormRef.current.initialize(cleanQuery);
    }
  }, [
    filters,
    agenda,
    agendaSchema,
    dispatch,
    filtersFormRef,
    location,
    initialQuery,
    latestQuery,
    latestStats,
  ]);

  return (
    <div className="oa-collapse">
      <Filters
        filters={filters}
        disabled={loading}
        dateRangeComponent={DateRangeFilter.Collapsable}
        choiceComponent={ChoiceFilter.Collapsable}
        getTotal={getTotal}
        getOptions={getOptions}
      />
    </div>
  );
}

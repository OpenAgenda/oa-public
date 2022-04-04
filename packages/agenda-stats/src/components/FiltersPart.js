import _ from 'lodash';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { useLatest, useUpdateEffect } from 'react-use';
import qs from 'qs';
import {
  Filters,
  DateRangeFilter,
  ChoiceFilter,
} from '@openagenda/react-filters';
import { useLayoutData } from '@openagenda/react-shared';
import validateQuery from '@openagenda/event-search/utils/validateQuery';

export default function FiltersPart({
  filters,
  filtersFormRef,
  initialQuery,
  getOptions,
}) {
  const dispatch = useDispatch();
  const location = useLocation();

  const { agenda, agendaSchema } = useLayoutData();

  const stats = useSelector(state => state.stats.data);
  const loading = useSelector(state => state.stats.loading);
  const query = useSelector(state => state.stats.query);
  const latestStats = useLatest(stats);
  const latestQuery = useLatest(query);

  const getTotal = useCallback(
    (filter, option) => {
      const stat = stats.find(s => _.isMatch(
        s.aggregation,
        _.omit(
          {
            type: filter.name,
            ...filter.aggregation,
          },
          'size'
        )
      ));

      if (!stat) return 0;

      const { data } = stat.state;

      if (!data) return 0;

      const dataKey = 'id' in option ? 'id' : 'key';
      const optionKey = 'id' in option ? 'id' : 'value';

      const optionValue = data.find(
        v => String(v[dataKey]) === String(option[optionKey])
      );

      if (optionValue) {
        return optionValue.eventCount || 0;
      }

      return 0;
    },
    [stats]
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
        baseQuery,
        Object.keys(validateQuery(baseQuery, agendaSchema))
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

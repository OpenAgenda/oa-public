import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useLatest, useUpdateEffect } from 'react-use';
import qs from 'qs';
import {
  Filters,
  DateRangeFilter,
  MultiChoiceFilter,
} from '@openagenda/react-filters';
import { useApiClient } from '@openagenda/react-shared';
import validateQuery from '@openagenda/event-search/utils/validateQuery';
import getEvents from '../api/getEvents';

const messages = defineMessages({
  moreFilters: {
    id: 'AgendaStats.Dashboard.moreFilters',
    defaultMessage: 'Display more filters',
  },
  lessFilters: {
    id: 'AgendaStats.Dashboard.lessFilters',
    defaultMessage: 'Display less filters',
  },
});

export default function FiltersPart({
  agenda,
  agendaSchema,
  standardsFilters,
  additionalsFilters,
  filtersFormRef,
  initialQuery,
}) {
  const intl = useIntl();
  const apiClient = useApiClient();
  const dispatch = useDispatch();
  const history = useHistory();

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
      [...standardsFilters, ...additionalsFilters].filter(
        filter => filter.type !== 'dateRange'
      ),
      { size: 0 }
    ),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isFetching'],
    }
  );

  const { aggregations: filterAggs } = filtersQuery.data;

  const [moreFilters, setMoreFilters] = useState(() => {
    const names = additionalsFilters.map(v => v.name);

    for (const key in query) {
      if (
        Object.prototype.hasOwnProperty.call(query, key)
        && names.includes(key)
      ) {
        return true;
      }
    }

    return false;
  });

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

  const toggleMoreFilters = useCallback(
    () => setMoreFilters(prevState => !prevState),
    []
  );

  useUpdateEffect(() => {
    const search = qs.stringify(latestQuery.current, {
      addQueryPrefix: true,
      arrayFormat: 'brackets',
    });

    if (history.location.search !== search) {
      const baseQuery = qs.parse(history.location.search, {
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
    additionalsFilters,
    agenda,
    agendaSchema,
    dispatch,
    filtersFormRef,
    history.location,
    initialQuery,
    latestQuery,
    latestStats,
    standardsFilters,
  ]);

  return (
    <div className="oa-collapse">
      <Filters
        filters={standardsFilters}
        disabled={loading}
        dateRangeComponent={DateRangeFilter}
        checkboxComponent={MultiChoiceFilter}
        radioComponent={MultiChoiceFilter}
        getTotal={getTotal}
        getOptions={getOptions}
      />
      {moreFilters ? (
        <Filters
          filters={additionalsFilters}
          disabled={loading}
          dateRangeComponent={DateRangeFilter}
          checkboxComponent={MultiChoiceFilter}
          radioComponent={MultiChoiceFilter}
          getTotal={getTotal}
          getOptions={getOptions}
        />
      ) : null}
      {additionalsFilters.length ? (
        <div className="margin-v-xs">
          <button
            type="button"
            className="btn btn-link-inline"
            onClick={toggleMoreFilters}
          >
            {intl.formatMessage(
              moreFilters ? messages.lessFilters : messages.moreFilters
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}

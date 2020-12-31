import _ from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { useLatest, useUpdateEffect } from 'react-use';
import { useHistory } from 'react-router';
import { useInfiniteQuery, useQuery } from 'react-query';
import qs from 'qs';
import validateQuery from '@openagenda/event-search/utils/validateQuery';
import {
  DateRangeFilter,
  Filters,
  FiltersProvider,
  MultiChoiceFilter,
} from '@openagenda/react-filters';
import { useApiClient } from '@openagenda/react-shared';
import getEvents from '../api/getEvents';

const messages = defineMessages({
  moreFilters: {
    id: 'EventAdminApp.FiltersPart.moreFilters',
    defaultMessage: 'Display more filters',
  },
  lessFilters: {
    id: 'EventAdminApp.FiltersPart.lessFilters',
    defaultMessage: 'Display less filters',
  },
});

function FiltersPart({
  agenda,
  agendaSchema,
  standardsFilters,
  additionalsFilters,
  onFilterChange,
  query,
}) {
  const intl = useIntl();
  const history = useHistory();
  const apiClient = useApiClient();
  const res = useSelector(state => state.res);

  const filtersFormRef = useRef();

  const filtersQuery = useQuery(
    'filters-base',
    () => getEvents(
      apiClient,
      res.jsonExport,
      agenda,
      [...standardsFilters, ...additionalsFilters],
      { size: 0 }
    ),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isFetching'],
    }
  );

  const { data, isFetching } = useInfiniteQuery(
    ['events', query],
    ({ pageParam }) => getEvents(
      apiClient,
      res.jsonExport,
      agenda,
      [...standardsFilters, ...additionalsFilters],
      query,
      pageParam
    ),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isFetching'],
      keepPreviousData: true, // because query change
    }
  );

  const { aggregations: filterAggs } = filtersQuery.data;
  const { aggregations } = data.pages[0];

  const [initialQuery] = useState(query);
  const latestQuery = useLatest(query);

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
      const aggregation = aggregations[`${filter.name}-${filter.id}`];

      if (!aggregation) return 0;

      const dataKey = 'id' in option ? 'id' : 'key';
      const optionKey = 'id' in option ? 'id' : 'value';

      const optionValue = aggregation.find(
        v => v[dataKey] === option[optionKey]
      );

      if (optionValue) {
        return optionValue.eventCount || 0;
      }

      return 0;
    },
    [aggregations]
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

  // TODO moreOptions

  const toggleMoreFilters = useCallback(
    () => setMoreFilters(prevState => !prevState),
    []
  );

  const validate = useCallback(
    values => {
      try {
        validateQuery(values, agendaSchema);
      } catch (e) {
        console.log('Filters validation error:', e);
      }
    },
    [agendaSchema]
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

      filtersFormRef.current.initialize(cleanQuery);
    }
  }, [
    additionalsFilters,
    agenda,
    agendaSchema,
    history.location,
    latestQuery,
    standardsFilters,
  ]);

  return (
    <FiltersProvider
      onSubmit={onFilterChange}
      initialValues={initialQuery}
      validate={validate}
      locale={intl.locale}
      ref={filtersFormRef}
    >
      <div className="oa-collapse">
        <Filters
          filters={standardsFilters}
          disabled={isFetching || filtersQuery.isFetching}
          dateRangeComponent={DateRangeFilter}
          checkboxComponent={MultiChoiceFilter}
          radioComponent={MultiChoiceFilter}
          getTotal={getTotal}
          getOptions={getOptions}
        />
        {moreFilters ? (
          <Filters
            filters={additionalsFilters}
            disabled={isFetching || filtersQuery.isFetching}
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
    </FiltersProvider>
  );
}

export default FiltersPart;

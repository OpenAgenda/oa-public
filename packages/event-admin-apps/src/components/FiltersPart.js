import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { useInfiniteQuery, useQuery } from 'react-query';
import {
  DateRangeFilter,
  Filters,
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
  agenda, standardsFilters, additionalsFilters, query
}) {
  const intl = useIntl();
  const apiClient = useApiClient();
  const res = useSelector(state => state.res);

  const filtersQuery = useQuery(
    'filters-base',
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

  const { data, isFetching } = useInfiniteQuery(
    ['events', query],
    ({ pageParam }) => getEvents(
      apiClient,
      res.jsonExport,
      agenda,
      [...standardsFilters, ...additionalsFilters].filter(
        filter => filter.type !== 'dateRange'
      ),
      {
        ...query,
        sort: 'updatedAt.desc',
        detailed: true,
      },
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

  const toggleMoreFilters = useCallback(
    () => setMoreFilters(prevState => !prevState),
    []
  );

  return (
    <>
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
    </>
  );
}

export default FiltersPart;

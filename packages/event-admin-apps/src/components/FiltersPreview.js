import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useInfiniteQuery, useQuery } from 'react-query';
import { useApiClient } from '@openagenda/react-shared';
import {
  Filters,
  DateRangeFilter,
  MultiChoiceFilter,
  ValueBadge,
  useFilterTitle
} from '@openagenda/react-filters';
import getEvents from '../api/getEvents';

function DateRangePreview({
  name,
  filter,
  label,
  onRemove,
  disabled,
  className
}) {
  const title = useFilterTitle(name, filter.fieldSchema);

  return (
    <span className={className} title={title}>
      <ValueBadge
        label={label}
        onRemove={onRemove}
        disabled={disabled}
      />
    </span>
  );
}

function MultiChoicePreview({
  name,
  filter,
  valueOptions,
  onRemove,
  disabled,
  className
}) {
  const title = useFilterTitle(name, filter.fieldSchema);

  return (
    <span className={className} title={title}>
      {valueOptions.map(option => (
        <ValueBadge
          key={option.value}
          label={option.label}
          onRemove={onRemove(option)}
          disabled={disabled}
        />
      ))}
    </span>
  );
}

export default function FilterPreview({
  agenda,
  query,
  standardsFilters,
  additionalsFilters
}) {
  const apiClient = useApiClient();
  const res = useSelector(state => state.res);

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

  const { isFetching } = useInfiniteQuery(
    ['events', query],
    ({ pageParam }) => getEvents(
      apiClient,
      res.jsonExport,
      agenda,
      [...standardsFilters, ...additionalsFilters],
      {
        ...query,
        sort: 'updatedAt.desc',
        detailed: true,
      },
      pageParam
    ),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['isFetching'],
      keepPreviousData: true, // because query change
    }
  );

  const filters = useMemo(
    () => [...standardsFilters, ...additionalsFilters],
    [additionalsFilters, standardsFilters]
  );

  const { aggregations: filterAggs } = filtersQuery.data;

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

  const dateRangeProps = useMemo(() => ({ component: DateRangePreview }), []);
  const checkboxProps = useMemo(() => ({ component: MultiChoicePreview }), []);
  const radioProps = useMemo(() => ({ component: MultiChoicePreview }), []);

  return (
    <Filters
      filters={filters}
      disabled={isFetching || filtersQuery.isFetching}
      dateRangeComponent={DateRangeFilter.Preview}
      dateRangeProps={dateRangeProps}
      checkboxComponent={MultiChoiceFilter.Preview}
      checkboxProps={checkboxProps}
      radioComponent={MultiChoiceFilter.Preview}
      radioProps={radioProps}
      // getTotal={getTotal}
      getOptions={getOptions}
    />
  );
}

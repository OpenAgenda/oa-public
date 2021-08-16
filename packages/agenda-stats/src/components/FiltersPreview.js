import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { useApiClient } from '@openagenda/react-shared';
import {
  Filters,
  DateRangeFilter,
  ChoiceFilter,
  ValueBadge,
  useFilterTitle,
} from '@openagenda/react-filters';
import getEvents from '../api/getEvents';

function DateRangePreview({
  name,
  filter,
  label,
  onRemove,
  disabled,
  className,
}) {
  const title = useFilterTitle(name, filter.fieldSchema);

  return (
    <span className={className} title={title}>
      <ValueBadge label={label} onRemove={onRemove} disabled={disabled} />
    </span>
  );
}

function ChoicePreview({
  name,
  filter,
  valueOptions,
  onRemove,
  disabled,
  className,
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

export default function FilterPreview({ agenda, isFetching, filters }) {
  const apiClient = useApiClient();
  const res = useSelector(state => state.res);

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
      enabled: false,
    }
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
  const choiceProps = useMemo(() => ({ component: ChoicePreview }), []);

  return (
    <Filters
      filters={filters}
      disabled={isFetching || filtersQuery.isFetching}
      dateRangeComponent={DateRangeFilter.Preview}
      dateRangeProps={dateRangeProps}
      choiceComponent={ChoiceFilter.Preview}
      choiceProps={choiceProps}
      // getTotal={getTotal}
      getOptions={getOptions}
    />
  );
}

import React from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { useApiClient } from '@openagenda/react-shared';
import {
  Filters,
  DateRangeFilter,
  MultiChoiceFilter,
  MapFilter,
  ValueBadge,
  useFilterTitle,
} from '@openagenda/react-filters';
import getEvents from '../api/getEvents';
import useFilterOptions from '../hooks/useFilterOptions';

function BadgePreview({
  name, filter, label, onRemove, disabled, className
}) {
  const title = useFilterTitle(name, filter.fieldSchema);

  return (
    <span className={className} title={title}>
      <ValueBadge label={label} onRemove={onRemove} disabled={disabled} />
    </span>
  );
}

function MultiChoicePreview({
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

function DateRangePreviewer(props) {
  return <DateRangeFilter.Preview component={BadgePreview} {...props} />;
}

function MultiChoicePreviewer(props) {
  return (
    <MultiChoiceFilter.Preview component={MultiChoicePreview} {...props} />
  );
}

function MapPreviewer(props) {
  return <MapFilter.Preview component={BadgePreview} {...props} />;
}

export default function FiltersPreview({
  agenda, query, page, filters
}) {
  const apiClient = useApiClient();
  const res = useSelector(state => state.res);

  const filtersQuery = useQuery(
    ['event-admin-apps', 'filtersBase', agenda.slug],
    () => getEvents(apiClient, res.jsonExport, agenda, filters, { size: 0 }),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isFetching'],
      enabled: false,
    }
  );

  const { isFetching } = useQuery(
    ['event-admin-apps', 'events', agenda.slug, { query, page }],
    () => getEvents(
      apiClient,
      res.jsonExport,
      agenda,
      filters,
      {
        sort: 'updatedAt.desc',
        ...query,
        detailed: true,
      },
      page
    ),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['isFetching'],
      keepPreviousData: true, // because query and page change
    }
  );

  const { aggregations: filterAggs } = filtersQuery.data;

  const getOptions = useFilterOptions(filterAggs);

  return (
    <Filters
      filters={filters}
      disabled={isFetching || filtersQuery.isFetching}
      dateRangeComponent={DateRangePreviewer}
      checkboxComponent={MultiChoicePreviewer}
      radioComponent={MultiChoicePreviewer}
      mapComponent={MapPreviewer}
      // getTotal={getTotal}
      getOptions={getOptions}
    />
  );
}

import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import {
  getEvents,
  DateRangeFilter,
  Filters,
  MultiChoiceFilter,
  MapFilter,
} from '@openagenda/react-filters';
import { useApiClient } from '@openagenda/react-shared';
import useFilterOptions from '../hooks/useFilterOptions';

// TODO apiKey from config

function FiltersPart({
  agenda, filters, query, page, loadGeoData
}) {
  const apiClient = useApiClient();
  const res = useSelector(state => state.res);

  const filtersQuery = useQuery(
    ['event-admin-apps', 'filtersBase', agenda.slug],
    () => getEvents(apiClient, res.jsonExport, agenda, filters, { size: 0 }),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isFetching'],
    }
  );

  const { data, isFetching } = useQuery(
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
      notifyOnChangeProps: ['data', 'isFetching'],
      keepPreviousData: true, // because query and page change
    }
  );

  const { aggregations: filterAggs } = filtersQuery.data;
  const { aggregations } = data;

  const getTotal = useCallback(
    (filter, option) => {
      const aggregation = aggregations[filter.name];

      if (!aggregation) return null;

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

  const getOptions = useFilterOptions(filterAggs);
  const [initialViewport] = useState(() => aggregations.viewport);

  const mapProps = useMemo(
    () => ({
      query,
      tileAttribution:
        '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      tileUrl:
        'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f486f281abbe690750',
    }),
    [query]
  );

  return (
    <>
      <div className="oa-collapse">
        <Filters
          filters={filters}
          disabled={isFetching || filtersQuery.isFetching}
          dateRangeComponent={DateRangeFilter}
          checkboxComponent={MultiChoiceFilter.Collapsable}
          radioComponent={MultiChoiceFilter.Collapsable}
          mapComponent={MapFilter}
          mapProps={mapProps}
          getTotal={getTotal}
          getOptions={getOptions}
          initialViewport={initialViewport}
          loadGeoData={loadGeoData}
          withRef
        />
      </div>
    </>
  );
}

export default FiltersPart;

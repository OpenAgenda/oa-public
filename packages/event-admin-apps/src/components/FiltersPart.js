import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { css } from '@emotion/react';
import {
  getEvents,
  DateRangeFilter,
  Filters,
  ChoiceFilter,
  MapFilter,
} from '@openagenda/react-filters';
import { useApiClient } from '@openagenda/react-shared';
import useFilterOptions from '../hooks/useFilterOptions';

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

  const mapProps = useMemo(() => ({ query }), [query]);

  return (
    <>
      <div
        className="oa-collapse"
        css={css`
          .leaflet-container {
            height: 300px;
          }
        `}
      >
        <Filters
          filters={filters}
          disabled={isFetching || filtersQuery.isFetching}
          dateRangeComponent={DateRangeFilter.Collapsable}
          choiceComponent={ChoiceFilter.Collapsable}
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

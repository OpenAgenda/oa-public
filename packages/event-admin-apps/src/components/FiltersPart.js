import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';
import { css } from '@emotion/react';
import {
  getEvents,
  DateRangeFilter,
  Filters,
  ChoiceFilter,
  MapFilter,
  useGetFilterOptions,
  useGetTotal,
  useLoadGeoData,
} from '@openagenda/react-filters';
import { useApiClient } from '@openagenda/react-shared';

function FiltersPart({
  agenda, filters, query, page
}) {
  const apiClient = useApiClient();
  const intl = useIntl();
  const res = useSelector(state => state.res);

  const geoRes = useMemo(
    () => res.jsonExport.replace(':slug', agenda.slug).replace(':uid', agenda.uid),
    [agenda.slug, agenda.uid]
  );

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

  const getOptions = useGetFilterOptions(intl, filterAggs, aggregations);
  const getTotal = useGetTotal(aggregations);
  const loadGeoData = useLoadGeoData(apiClient, geoRes, query);

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

          .oa-choice-option-label {
            min-height: 20px;
            line-height: 20px;
            padding-left: 20px;
            margin-bottom: 0;
            font-weight: normal;
            cursor: pointer;
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

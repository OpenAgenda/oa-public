import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { css } from '@emotion/react';
import {
  DateRangeFilter,
  Filters,
  ChoiceFilter,
  MapFilter,
  useGetFilterOptions,
  useGetTotal,
  useLoadGeoData,
} from '@openagenda/react-filters';
import { useApiClient } from '@openagenda/react-shared';

function FiltersPart({ agenda, filters, query, filtersQuery, eventsQuery }) {
  const apiClient = useApiClient();
  const intl = useIntl();
  const res = useSelector(state => state.res);

  const geoRes = useMemo(
    () => res.search.replace(':slug', agenda.slug).replace(':uid', agenda.uid),
    [agenda.slug, agenda.uid],
  );

  const { data, isFetching } = eventsQuery;

  const { aggregations: filterAggs } = filtersQuery.data ?? {};
  const { aggregations } = data ?? { aggregations: {} };

  const getOptions = useGetFilterOptions(intl, filterAggs, aggregations);
  const getTotal = useGetTotal(aggregations);
  const loadGeoData = useLoadGeoData(
    apiClient,
    geoRes,
    { state: null, ...query },
    {
      searchMethod: 'post',
    },
  );

  const [initialViewport] = useState(() => aggregations.viewport);

  const mapProps = useMemo(() => ({ query }), [query]);

  return (
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
  );
}

export default FiltersPart;

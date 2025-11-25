import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  DateRangeFilter,
  Filters,
  ChoiceFilter,
  MapFilter,
  NumberRangeFilter,
  useGetFilterOptions,
  useGetTotal,
  useLoadGeoData,
} from '@openagenda/react-filters';

function FiltersPart({ agenda, filters, query, filtersQuery, eventsQuery }) {
  const intl = useIntl();
  const res = useSelector((state) => state.res);

  const geoRes = useMemo(
    () => res.search.replace(':slug', agenda.slug).replace(':uid', agenda.uid),
    [agenda.slug, agenda.uid, res.search],
  );

  const { data, isFetching } = eventsQuery;

  const { aggregations: filterAggs } = filtersQuery.data ?? {};
  const { aggregations } = data ?? { aggregations: {} };

  const getOptions = useGetFilterOptions(intl, filterAggs, aggregations);
  const getTotal = useGetTotal(aggregations);
  const loadGeoData = useLoadGeoData(
    null,
    geoRes,
    { state: null, ...query },
    { searchMethod: 'post' },
  );

  const [initialViewport] = useState(() => aggregations.viewport);

  const mapProps = useMemo(() => ({ query }), [query]);

  return (
    <div className="oa-collapse">
      <Filters
        filters={filters}
        disabled={isFetching || filtersQuery.isFetching}
        dateRangeComponent={DateRangeFilter.Collapsable}
        choiceComponent={ChoiceFilter.Collapsable}
        numberRangeComponent={NumberRangeFilter.Collapsable}
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

import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
  Filters,
  useGetTotal,
  useLoadGeoData,
} from '@openagenda/react-filters';
import { chakra, Box, SimpleGrid } from '@openagenda/uikit';
import useFiltersBaseQuery from 'views/AgendaShow/hooks/useFiltersBaseQuery';
import useEventsQuery from 'views/AgendaShow/hooks/useEventsQuery';
import { useEmbedLayoutData } from 'components/EmbedLayout';
import isUpcomingOnlyQuery from 'utils/isUpcomingOnlyQuery';
import { omitParams } from 'utils/embedParams';
import AgendaShowMapFilter from 'views/AgendaShow/components/MapFilter';
import wrapFilter from 'views/AgendaShow/wrapFilter';
import useGetFilterOptions from '../hooks/useGetFilterOptions';
import getPrefilteredQuery from '../utils/getPrefilteredQuery';
import DateRangeFilter from './DateRangeFilter';
import ChoiceFilter from './ChoiceFilter';
import SearchFilter from './SearchFilter';
import { FiltersSkeleton } from './LoadingPage';

const StyledAgendaShowMapFilter = wrapFilter(AgendaShowMapFilter);

const MapFilter = React.forwardRef<any, any>(function MapFilter(props, ref) {
  const { mapSize } = useEmbedLayoutData();

  const mapHeight = mapSize ? mapSize.height || 'auto' : '250px';

  return (
    <Box gridColumn="1 / -1" zIndex="5">
      <StyledAgendaShowMapFilter
        ref={ref}
        mx="auto"
        h={mapHeight}
        maxH={mapSize?.maxHeight}
        aspectRatio={mapSize?.aspectRatio}
        {...props}
        forwardedFilter={props.filter}
        filter={null}
      />
    </Box>
  );
});

const StyledSearchfilter = chakra(SearchFilter);

export default function FiltersPart({
  agenda,
  filters,
  query,
  includeFields,
  filtersToInclude,
  prefilter,
  referrer,
}) {
  const intl = useIntl();

  const { sort, pageSize } = useEmbedLayoutData();

  const { data: filtersBaseData } = useFiltersBaseQuery({
    suspense: true,
    agenda,
    filters,
    query,
    prefilter: omitParams({
      ...prefilter,
      cms: 'embed',
      host: referrer,
    }),
  });
  const { data: pages, error } = useEventsQuery({
    suspense: true,
    agenda,
    filters,
    query: omitParams({
      ...getPrefilteredQuery({ query, prefilter, filters }),
      cms: 'embed',
      host: referrer,
    }),
    includeFields,
    pageSize,
    sort,
  });

  const aggregations = pages?.[0].aggregations ?? {};

  const getOptions = useGetFilterOptions({
    intl,
    filtersBase: filtersBaseData?.aggregations,
    aggregations,
    prefilter,
  });

  const getTotal = useGetTotal(aggregations);

  const loadGeoData = useLoadGeoData(
    null, // apiClient
    `/api/agendas/slug/${agenda.slug}/events`,
    omitParams({
      ...isUpcomingOnlyQuery(query)
        ? {
            relative: ['current', 'upcoming'],
          }
        : null,
      ...getPrefilteredQuery({ prefilter, query, filters }),
      passed: undefined, // omit passed,
      cms: 'embed',
      host: referrer,
    }),
  );

  const isLoadingInitialData = !pages && !error;

  const orderedFilters = useMemo(
    () =>
      filters
        .filter((filter) => filtersToInclude.includes(filter.name))
        .sort((a, b) => {
          // Last
          if (a.name === 'geo') return 1;
          if (b.name === 'geo') return -1;
          // Second to last
          if (a.name === 'search') return 1;
          if (b.name === 'search') return -1;
          return (
            filtersToInclude.indexOf(a.name) - filtersToInclude.indexOf(b.name)
          );
        }),
    [filters, filtersToInclude],
  );

  if (isLoadingInitialData) {
    return (
      <FiltersSkeleton filters={filters} filtersToInclude={filtersToInclude} />
    );
  }

  return (
    <SimpleGrid
      as="form"
      templateColumns="repeat(auto-fill, minmax(min(290px, 100%), 1fr))"
      columnGap="10"
      rowGap="6"
    >
      <Filters
        filters={orderedFilters}
        // disabled={isFetching || filtersQuery.isFetching}
        mapComponent={MapFilter as any}
        dateRangeComponent={DateRangeFilter as any}
        searchComponent={StyledSearchfilter as any}
        searchProps={{
          h: '10',
          gridColumn: '1 / -1',
        }}
        choiceComponent={ChoiceFilter as any}
        getTotal={getTotal}
        getOptions={getOptions}
        initialViewport={aggregations.viewport}
        loadGeoData={loadGeoData}
        withRef
      />
    </SimpleGrid>
  );
}

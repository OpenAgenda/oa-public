import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import { useLatest } from 'react-use';
import qs from 'qs';
import { Box, Button, Container, Flex, useConst } from '@openagenda/uikit';
import {
  FiltersProvider,
  Filters,
  // ChoiceFilter,
  getEvents,
  useFilters,
  useLoadGeoData,
  useGetFilterOptions,
  useGetTotal,
} from '@openagenda/react-filters';
import { useApiClient } from '@openagenda/react-shared';
import fetchCommonLocale from '@openagenda/common-labels/fetchLocale';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useLocationQuery from 'hooks/useLocationQuery';
import useRouteParams from 'hooks/useRouteParams';
import swrLaggyMiddleware from 'utils/swrLaggyMiddleware';
import EventItem from './components/EventItem';
import Form from './components/Form';
import FiltersPreview from './components/FiltersPreview';
import Search from './components/Search';
import MapFilter from './components/MapFilter';
import DateRangeFilter from './components/DateRangeFilter';
import ChoiceFilter from './components/ChoiceFilter';
import AgendaHeader from './components/AgendaHeader';
import fetchLocale from './locales';

export type AgendaShowProps = {
  agenda: {
    slug: string,
    uid: number,
    title: string,
    schema: any,
  },
};

const PAGE_SIZE = 20;

function EventList({ events, agenda }) {
  return (
    <>
      {events.map(event => <EventItem key={event.uid} event={event} agenda={agenda} />)}
    </>
  );
}

function AgendaShow({ agenda }: AgendaShowProps) {
  const intl = useIntl();
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale();
  const apiClient = useApiClient();

  const filtersFormRef = useRef<any>();

  const routeParams = useRouteParams();
  const urlQuery = useLocationQuery();
  const initialValues = useConst(() => urlQuery);

  const [query, setQuery] = useState(() => urlQuery);

  const filtersToInclude = useMemo(() => {
    const additionalFilters = agenda.schema.fields
      .filter(fieldSchema => fieldSchema.schemaId && ['checkbox', 'radio', 'multiselect', 'boolean'].includes(fieldSchema.fieldType))
      .map(fieldSchema => fieldSchema.field);

    return ['geo', 'timings', ...additionalFilters];
  }, [agenda.schema.fields]);

  const filters = useFilters(intl, agenda.schema.fields, {
    dateFnsLocale,
    missingValue: 'null',
    mapTiles: 'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f486f281abbe690750',
    // exclude: adminFilters,
    include: filtersToInclude,
  });

  const mapFilter = useMemo(
    () => filters.find(v => v.name === 'geo'),
    [filters],
  );

  const { data: filtersBaseData } = useSWRImmutable(
    ['agendaShow', 'filtersBase', agenda.slug],
    () => getEvents(
      apiClient,
      `/api/agendas/slug/${agenda.slug}/events`,
      agenda,
      filters,
      { size: 0 },
    ),
  );

  const {
    data: pages,
    error,
    size,
    setSize,
    // isValidating,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.events) return null;

      // first page, we don't have `previousPageData`
      if (pageIndex === 0) return ['agendaShow', 'events', agenda.slug, query];

      // add the cursor to the API endpoint
      return ['agendaShow', 'events', agenda.slug, query, previousPageData.after];
    },
    (_page, _requestId, _slug, _query, after) => getEvents(
      apiClient,
      `/api/agendas/slug/${agenda.slug}/events`,
      agenda,
      !after ? filters : [], // need aggs only for first page
      {
        // sort: 'lastTimingWithFeatured.asc',
        after,
        ...query,
        detailed: true,
      },
    ),
    {
      revalidateFirstPage: false,
      revalidateOnMount: false,
      // revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      use: [swrLaggyMiddleware],
      onSuccess(newData) {
        // Update map markers
        const mapElem = mapFilter?.elemRef.current;

        if (mapElem) {
          mapElem.onQueryChange(newData[0].aggregations.viewport);
        }

        router.push({
          pathname: router.pathname,
          query: routeParams,
        }, `${qs.stringify(query, { addQueryPrefix: true })}`, { shallow: true });
      },
    },
  );

  const { aggregations } = pages[0];
  const [initialViewport] = useState(() => aggregations.viewport);

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore = isLoadingInitialData
    || (size > 0 && pages && typeof pages[size - 1] === 'undefined');
  const isEmpty = pages?.[0]?.events?.length === 0;
  const isReachingEnd = isEmpty || (pages && pages[pages.length - 1]?.events?.length < PAGE_SIZE);
  // const isRefreshing = isValidating && pages && pages.length === size;

  const getOptions = useGetFilterOptions(
    intl,
    filtersBaseData?.aggregations,
    pages?.[0]?.aggregations,
  );

  const getTotal = useGetTotal(pages?.[0]?.aggregations);

  const onFilterChange = useCallback((values: Record<string, string | string[]>) => {
    setQuery(values);
  }, []);

  const { ref } = useInView({
    onChange: inView => {
      if (inView && !isReachingEnd && !isLoadingMore) {
        setSize(size + 1).catch(() => null);
      }
    },
  });

  const loadGeoData = useLoadGeoData(
    apiClient,
    `/api/agendas/slug/${agenda.slug}/events`,
    query,
  );

  // Update filters if location change (back)
  const latestQuery = useLatest(query);
  useEffect(() => {
    if (qs.stringify(latestQuery.current) !== qs.stringify(urlQuery)) {
      const form = filtersFormRef.current;

      form.initialize(urlQuery);
      form.submit();
    }
  }, [latestQuery, urlQuery]);

  return (
    <main>
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css"
          integrity="sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI="
          crossOrigin=""
        />
      </Head>

      <Box as="header" w="full" bg="#413a42" px="4" py="8">
        <Container maxW="container.xl" color="white">
          <AgendaHeader agenda={agenda} />
        </Container>
      </Box>

      <FiltersProvider
        onSubmit={onFilterChange}
        initialValues={initialValues}
        intl={intl}
        dateFnsLocale={dateFnsLocale}
        ref={filtersFormRef}
        filters={filters}
      >
        <Flex
          m="auto"
          maxW={['full', null, null, 'container.xl']}
          h="auto"
          direction={['column', null, null, 'row-reverse']}
          alignItems={['center', null, null, 'start']}
          gap="6"
        >
          <Box
            flex="1"
            alignSelf="start"
            w="full"
            minW="380px"
            display={{ base: 'none', lg: 'block' }}
          />
          <Box flex="2">
            <Box ml={{ lg: '25%' }}>
              <FiltersPreview
                filters={filters}
                getOptions={getOptions}
                disabled={isLoadingMore}
              />
            </Box>
          </Box>
        </Flex>

        <Flex
          as="section"
          m="auto"
          maxW={['full', null, null, 'container.xl']}
          h="auto"
          direction={['column', null, null, 'row-reverse']}
          alignItems={['center', null, null, 'start']}
          gap="6"
        >
          <Box
            as="aside"
            // display="flex"
            // flexDirection="column"
            flex="1"
            alignSelf="start"
            mt="8"
            w="full"
            minW="380px"
          >
            <Form>
              <Search disabled={false} isLoading={false} />

              <Filters
                filters={filters}
                // disabled={isFetching || filtersQuery.isFetching}
                dateRangeComponent={DateRangeFilter as any}
                choiceComponent={ChoiceFilter as any}
                mapComponent={MapFilter as any}
                // mapProps={{}}
                getTotal={getTotal}
                getOptions={getOptions}
                initialViewport={initialViewport}
                loadGeoData={loadGeoData}
                withRef
              />
            </Form>
          </Box>

          <Flex direction="column" flex="2" mt="8" gap="10">
            {pages?.map(page => (
              <EventList key={page.after} events={page.events} agenda={agenda} />
            ))}

            <Flex ml="25%" justify="space-around">
              <Button
                ref={ref}
                onClick={() => setSize(size + 1)}
                disabled={isLoadingMore || isReachingEnd}
                variant="link"
                colorScheme="primary"
              >
                Load more
                {/* isLoadingMore
                  ? 'Loading more...'
                  : isReachingEnd
                    ? 'Nothing more to load'
                    : 'Load Newer' */}
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </FiltersProvider>
    </main>
  );

  /* return (
    <Link href="/n/bordeaux-metropole/events/visite-des-arbres-remarquables-du-parc-de-bourran">
      Go to event
    </Link>
      <pre>
      <code>{JSON.stringify(agenda, null, 2)}</code>
      </pre>
      <pre>
      <code>{JSON.stringify(events, null, 2)}</code>
      </pre>
  ); */
}

AgendaShow.fetchLocale = async locale => ({
  ...await fetchLocale(locale),
  ...await fetchCommonLocale('event/attendanceModes', locale),
  ...await import(`@openagenda/react-filters/locales-compiled/${locale}.json`).then(mod => mod.default),
});

export default AgendaShow;

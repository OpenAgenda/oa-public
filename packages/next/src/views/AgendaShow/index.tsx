import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import Head from 'next/head';
import { defineMessages, useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import { useLatest } from 'react-use';
import qs from 'qs';
import { formatInTimeZone } from 'date-fns-tz';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/pro-solid-svg-icons';
import {
  chakra,
  Box,
  Button,
  CloseButton,
  Container,
  Flex,
  Text,
  Grid,
  GridItem,
  NoBreak,
  Link,
  useConst,
  useDisclosure,
} from '@openagenda/uikit';
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
import { toEventSchema } from '@openagenda/sdk-js';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useLocationQuery from 'hooks/useLocationQuery';
import useUser from 'hooks/useUser';
import addGoogleAnalyticsTracker from 'utils/addGoogleAnalyticsTracker';
import swrLaggyMiddleware from 'utils/swrLaggyMiddleware';
import ConsentBanner from 'components/ConsentBanner';
import { SUPPORTED_LOCALES } from 'config/constants';
import EventItem from './components/EventItem';
import Form from './components/Form';
import FiltersPreview from './components/FiltersPreview';
import Search from './components/Search';
import MapFilter from './components/MapFilter';
import DateRangeFilter from './components/DateRangeFilter';
import ChoiceFilter from './components/ChoiceFilter';
import FavoritesFilter from './components/FavoritesFilter';
import AgendaHeader from './components/AgendaHeader';
import ContextBar from './components/ContextBar';
import ResponsiveDrawer from './components/Drawer';
import fetchLocale from './locales';

import 'leaflet/dist/leaflet.css';

export type AgendaShowProps = {
  agenda: {
    slug: string,
    uid: number,
    title: string,
    description: string,
    schema: any,
    settings: any,
    summary: any,
    indexed: boolean | number,
    image?: string,
  },
};

const PAGE_SIZE = 20;

const messages = defineMessages({
  totalEvents: {
    id: 'next.views.AgendaShow.totalEvents',
    defaultMessage: '{count, plural, =0 {No event} one {1 event} other {# events}}',
  },
  totalUpcomingEvents: {
    id: 'next.views.AgendaShow.totalUpcomingEvents',
    defaultMessage: '{count, plural, =0 {No upcoming event} one {1 upcoming event} other {# upcoming events}}',
  },
  showUpcomingEventsOnly: {
    id: 'next.views.AgendaShow.showUpcomingEventsOnly',
    defaultMessage: 'Show upcoming events only',
  },
  includePassedEvents: {
    id: 'next.views.AgendaShow.includePassedEvents',
    defaultMessage: 'Include past events',
  },
  seeMore: {
    id: 'next.views.AgendaShow.seeMore',
    defaultMessage: 'See more',
  },
  filter: {
    id: 'next.views.AgendaShow.filter',
    defaultMessage: 'Filter',
  },
  filters: {
    id: 'next.views.AgendaShow.filters',
    defaultMessage: 'Filters',
  },
  seeEvents: {
    id: 'next.views.AgendaShow.seeEvents',
    defaultMessage: 'Show the {count} events',
  },
  help: {
    id: 'next.views.AgendaShow.help',
    defaultMessage: 'Help',
  },
  termsOfUse: {
    id: 'next.views.AgendaShow.termsOfUse',
    defaultMessage: 'Terms of use',
  },
});

function Total({ total, upcomingOnly, passed, disabled }) {
  const intl = useIntl();
  const router = useRouter();

  const togglePassed = useCallback(() => {
    if (disabled) return;

    const url = new URL(router.asPath, 'http://n');

    if (passed) {
      url.searchParams.delete('passed');
    } else {
      url.searchParams.set('passed', '1');
    }

    router.push(`${url.pathname}${url.search}`, null, { shallow: true });
  }, [disabled, passed, router]);

  return (
    <Text
      align="center"
      display={{ base: 'flex', sm: 'block' }}
      flexDirection="column"
    >
      <chakra.span _after={{ content: { base: 'none', sm: '" - "' } }}>
        {intl.formatMessage(messages[upcomingOnly ? 'totalUpcomingEvents' : 'totalEvents'], { count: total })}
      </chakra.span>
      <Button
        variant="link"
        colorScheme="primary"
        onClick={togglePassed}
        disabled={disabled}
      >
        {intl.formatMessage(messages[passed ? 'showUpcomingEventsOnly' : 'includePassedEvents'])}
      </Button>
    </Text>
  );
}

function AgendaShow({ agenda }: AgendaShowProps) {
  const intl = useIntl();
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale();
  const apiClient = useApiClient();
  const { user } = useUser();

  const filtersFormRef = useRef<any>();

  const urlQuery = useLocationQuery();
  const initialValues = useConst(() => urlQuery);

  const [query, setQuery] = useState(() => urlQuery);

  const [cookies, setCookie] = useCookies();

  useEffect(() => {
    if (agenda?.settings?.tracking?.googleAnalytics && cookies.CookieConsent === 'true') {
      addGoogleAnalyticsTracker({ googleAnalyticsID: agenda.settings.tracking.googleAnalytics });
    }
  }, [cookies.CookieConsent, agenda?.settings?.tracking?.googleAnalytics]);

  const upcomingOnly = !query.timings && query.passed !== '1';

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
    ['agendaShow', 'filtersBase', agenda.slug, { passed: query.passed }],
    () => getEvents(
      apiClient,
      `/api/agendas/slug/${agenda.slug}/events`,
      agenda,
      filters,
      {
        size: 0,
        relative: upcomingOnly ? ['current', 'upcoming'] : undefined,
      },
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
        sort: 'lastTimingWithFeatured.asc',
        after,
        ...upcomingOnly ? {
          relative: ['current', 'upcoming'],
        } : null,
        ...query,
        passed: undefined, // omit passed
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

        router.push(
          new URL(router.asPath, 'http://n').pathname + qs.stringify(query, { addQueryPrefix: true }),
          null,
          { shallow: true },
        );
      },
    },
  );

  const { aggregations } = pages[0];
  const [initialViewport] = useState(() => aggregations.viewport);

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && pages && pages[size - 1] === undefined);
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
    {
      ...upcomingOnly ? {
        relative: ['current', 'upcoming'],
      } : null,
      ...query,
      passed: undefined, // omit passed
    },
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

  const {
    isOpen: isOpenFilters,
    onToggle: onToggleFilters,
  } = useDisclosure();

  const eventsLdJSON = useMemo(() => {
    const eventSchemas = pages
      .flatMap(p => p.events)
      .map(event => toEventSchema(event, {
        locale: intl.locale,
        formatDate: (date, tz = 'Europe/Paris') => formatInTimeZone(date, tz, 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
        url: `${process.env.NEXT_PUBLIC_SITE_ROOT}/${agenda.slug}/events/${event.slug}`,
      }));
    return JSON.stringify(eventSchemas);
  }, [pages]);

  const url = new URL(router.asPath, process.env.NEXT_PUBLIC_SITE_ROOT);

  const pageTitle = `${agenda.title} | OpenAgenda`;

  return (
    <>
      <main>
        <Head>
          <title>{pageTitle}</title>
          {agenda.indexed ? (
            <meta name="robots" content="index, follow" />
          ) : (
            <meta name="robots" content="noindex" />
          )}

          <link rel="canonical" href={url.origin + url.pathname} />
          {Object.keys(agenda.summary.languages).map(key => (key === intl.locale ? null : (
            <link
              key={`alternate:${key}`}
              rel="alternate"
              hrefLang={key}
              href={SUPPORTED_LOCALES.includes(key)
                ? `${url.origin}/${key}${url.pathname}`
                : `${url.origin}${url.pathname}?lang=${key}`}
            />
          )))}
          <link rel="alternate" hrefLang="x-default" href={url.origin + url.pathname} />

          <meta property="og:site_name" content="OpenAgenda" />
          <meta property="og:title" content={`${agenda.title} | OpenAgenda`} />
          <meta property="og:description" content={agenda.description} />
          {/* <meta property="og:type" content="website" /> */}
          <meta property="og:locale" content={intl.locale} />
          {Object.keys(agenda.summary.languages).map(key => (key === intl.locale ? null : (
            <meta key={`ogLocale:${key}`} property="og:locale:alternate" content={key} />
          )))}
          <meta property="og:url" content={url.origin + url.pathname} />
          {agenda.image ? (
            <meta property="og:image" content={agenda.image} />
          ) : null}

          <meta property="twitter:card" content="summary" />
          <meta property="twitter:site" content={process.env.NEXT_PUBLIC_SITE_DOMAIN} />
          <meta property="twitter:title" content={`${agenda.title} | OpenAgenda`} />
          <meta property="twitter:description" content={agenda.description} />
          <meta property="twitter:domain" content="@oagenda" />
          <meta property="twitter:url" content={url.origin + url.pathname} />
          {agenda.image ? (
            <meta property="twitter:image" content={agenda.image} />
          ) : null}
        </Head>

        {user ? <ContextBar agenda={agenda} /> : null}

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
          <Grid
            templateAreas={{
              base: `"filters"
                   "total"
                   "events"`,
              lg: `"total ."
                 "events filters"`,
            }}
            gridTemplateColumns={{
              base: '1fr',
              lg: '2fr minmax(380px, 1fr)',
            }}
            rowGap="8"
            columnGap={{ xl: '24' }}
            pt="8"
            m="auto"
            maxW="container.xl"
          >
            <GridItem area="total">
              <Flex direction="row" gap="8">
                <chakra.div
                  w={{ base: 'full', xl: '25%' }}
                  display={{ base: 'none', xl: 'block' }}
                />
                <Flex
                  gap="6"
                  direction="column"
                  w={{ base: 'full', xl: '75%' }}
                  px={{ base: '4', xl: '0' }}
                >
                  <FiltersPreview
                    agenda={agenda}
                    filters={filters}
                    getOptions={getOptions}
                    disabled={isLoadingMore}
                  />

                  <Total
                    total={pages[0].total}
                    upcomingOnly={upcomingOnly}
                    passed={query.passed === '1'}
                    disabled={isLoadingMore || query.timings}
                  />
                </Flex>
              </Flex>
            </GridItem>

            <GridItem area="filters">
              <Form gap="8">
                <Search
                  disabled={false}
                  isLoading={false}
                  mx={{ base: '4', lg: '0' }}
                />

                <div>{/* Useful to remove gap for the drawer on mobile */}
                  <Flex>
                    <Button
                      colorScheme="primary"
                      onClick={onToggleFilters}
                      leftIcon={<FontAwesomeIcon icon={faSliders} />}
                      display={{ base: 'flex', lg: 'none' }}
                      mx="4"
                      w="full"
                    >
                      {intl.formatMessage(messages.filter)}
                    </Button>
                  </Flex>

                  <ResponsiveDrawer isOpen={isOpenFilters} onClose={onToggleFilters}>
                    <Flex direction="column" h="full">
                      <Flex
                        display={{ base: 'flex', lg: 'none' }}
                        justify="space-between"
                        align="center"
                        p="4"
                      >
                        <Text fontWeight="bold" fontSize="lg">
                          {intl.formatMessage(messages.filters)}
                        </Text>
                        <CloseButton onClick={onToggleFilters} />
                      </Flex>

                      <Flex direction="column" gap="8" grow="1" overflow="auto" px={{ base: '4', lg: '0' }}>
                        <Filters
                          filters={filters}
                          // disabled={isFetching || filtersQuery.isFetching}
                          dateRangeComponent={DateRangeFilter as any}
                          choiceComponent={ChoiceFilter as any}
                          mapComponent={MapFilter as any}
                          // mapProps={{
                          //   displayed: mapDisplayed,
                          //   defaultPaused: true, // TODO defaultPaused because default hidden
                          // }}
                          getTotal={getTotal}
                          getOptions={getOptions}
                          initialViewport={initialViewport}
                          loadGeoData={loadGeoData}
                          withRef
                        />
                        <FavoritesFilter agenda={agenda} />
                      </Flex>

                      <Box display={{ base: 'block', lg: 'none' }} p="4">
                        <Button
                          variant="solid"
                          colorScheme="primary"
                          onClick={onToggleFilters}
                          w="full"
                        >
                          {intl.formatMessage(messages.seeEvents, { count: pages[0].total })}
                        </Button>
                      </Box>

                      <Box display={{ base: 'none', lg: 'block' }} pt="8" wordBreak="normal">
                        <Link href="/" color="primary.500">
                          OpenAgenda
                        </Link>
                        <NoBreak>&nbsp;·</NoBreak>{' '}
                        <Link href="https://doc.openagenda.com/" isExternal color="primary.500">
                          {intl.formatMessage(messages.help)}
                        </Link>
                        <NoBreak>&nbsp;·</NoBreak>{' '}
                        <Link href="https://doc.openagenda.com/conditions/" isExternal color="primary.500">
                          {intl.formatMessage(messages.termsOfUse)}
                        </Link>

                        <br />
                        <chakra.span color="oaGray.300" wordBreak="normal">&lt;uid:{agenda.uid}&gt;</chakra.span>
                      </Box>
                    </Flex>
                  </ResponsiveDrawer>
                </div>
              </Form>
            </GridItem>

            <GridItem area="events">
              <Flex direction="column" flex="2" gap="10">
                {pages?.map((page, pageIndex) => page.events.map((event, eventIndex) => (
                  <EventItem
                    key={event.uid}
                    event={event}
                    agenda={agenda}
                    imagePriority={pageIndex === 0 && eventIndex <= 1}
                  />
                )))}

                {!isReachingEnd ? (
                  <Flex ml="25%" justify="space-around">
                    <Button
                      ref={ref}
                      onClick={() => setSize(size + 1)}
                      variant="link"
                      colorScheme="primary"
                      isLoading={isLoadingMore}
                    >
                      {intl.formatMessage(messages.seeMore)}
                    </Button>
                  </Flex>
                ) : null}
              </Flex>
            </GridItem>
          </Grid>
        </FiltersProvider>
        {agenda?.settings?.tracking?.googleAnalytics && cookies.CookieConsent === undefined ? (
          <ConsentBanner
            setCookie={setCookie}
          />
        ) : null}
      </main>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: eventsLdJSON }}
      />
    </>
  );
}

AgendaShow.fetchLocale = locale => Promise.all([
  fetchLocale(locale),
  fetchCommonLocale('event/attendanceModes', locale),
  import(`@openagenda/react-filters/locales-compiled/${locale}.json`).then(mod => mod.default),
]).then(results => Object.assign({}, ...results));

export default AgendaShow;

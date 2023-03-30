import { Suspense, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useCookies } from 'react-cookie';
import { useIntl } from 'react-intl';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useLatest, usePrevious } from 'react-use';
import qs from 'qs';
import { Box, Container, useConst } from '@openagenda/uikit';
import { FiltersProvider, useFilters } from '@openagenda/react-filters';
import fetchCommonLocale from '@openagenda/common-labels/fetchLocale';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useLocationQuery from 'hooks/useLocationQuery';
import useUser from 'hooks/useUser';
import addGoogleAnalyticsTracker from 'utils/addGoogleAnalyticsTracker';
import fetchErrorLocale from 'components/ErrorDisplay/locales';
import ConsentBanner from 'components/ConsentBanner';
import useIsMounted from 'hooks/useIsMounted';
import useEventsQuery from './hooks/useEventsQuery';
import Metas from './components/Metas';
import AgendaHeader from './components/AgendaHeader';
import ContextBar from './components/ContextBar';
import { EventsSkeleton, TotalSkeleton, FiltersSkeleton } from './components/LoadingPage';
import ContentGrid from './components/ContentGrid';
import fetchLocale from './locales';

import 'leaflet/dist/leaflet.css';

const DynamicEventsPart = dynamic(() => import('./components/EventsPart'), {
  // ssr: false,
  suspense: true,
});

const DynamicTotalPart = dynamic(() => import('./components/TotalPart'), {
  // ssr: false,
  suspense: true,
});

const DynamicFiltersPart = dynamic(() => import('./components/FiltersPart'), {
  // ssr: false,
  suspense: true,
});

const DynamicLdJson = dynamic(() => import('./components/LdJson'), {
  // ssr: false,
  suspense: true,
});

// @ts-ignore
DynamicEventsPart.render.preload();

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
  preload?: string[]
};

const includeFields = [
  'uid',
  'slug',
  'title',
  'image',
  'featured',
  'description',
  'dateRange',
  'timings',
  'onlineAccessLink',
  'attendanceMode',
  'status',
  'location.name',
  'location.address',
  'location.city',
  'location.region',
  'location.postalCode',
  'location.countryCode',
  'location.latitude',
  'location.longitude',
];

function AgendaShow({ agenda, preload }: AgendaShowProps) {
  const intl = useIntl();
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale();
  const { user } = useUser();

  const filtersFormRef = useRef<any>();

  const urlQuery = useLocationQuery();
  const initialValues = useConst(() => urlQuery);

  const [query, setQuery] = useState(() => urlQuery);
  const latestQuery = useLatest(query);

  const isMounted = useIsMounted();

  const [cookies, setCookie] = useCookies();

  useEffect(() => {
    if (agenda?.settings?.tracking?.googleAnalytics && cookies.CookieConsent === 'true') {
      addGoogleAnalyticsTracker({ googleAnalyticsID: agenda.settings.tracking.googleAnalytics });
    }
  }, [cookies.CookieConsent, agenda?.settings?.tracking?.googleAnalytics]);

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

  const { data: pages } = useEventsQuery({ agenda, filters, query, includeFields });

  const [_isPending, startTransition] = useTransition();

  const onFilterChange = useCallback((values: Record<string, string | string[]>) => {
    startTransition(() => {
      setQuery(values);
    });
  }, []);

  // Update filters if location change (back)
  useEffect(() => {
    const beforeHistoryChange = (href, { shallow }) => {
      const currentUrl = new URL(router.asPath, 'http://n');
      const url = new URL(href, 'http://n');

      // change route
      if (currentUrl.pathname !== url.pathname || !shallow) return;

      const form = filtersFormRef.current;
      const newUrlQuery = qs.parse(url.search, { ignoreQueryPrefix: true });

      form.initialize(newUrlQuery);
      form.submit();
    };
    router.events.on('beforeHistoryChange', beforeHistoryChange);

    return () => {
      router.events.off('beforeHistoryChange', beforeHistoryChange);
    };
  }, [router]);

  // SWR onSuccess
  // https://github.com/vercel/swr/issues/1733
  const latestRouter = useLatest(router);
  const previousPages = usePrevious(pages);
  useEffect(() => {
    if (pages?.length > 0 && previousPages !== pages) {
      // Update map markers
      const mapFilter = filters.find(v => v.name === 'geo');
      const mapElem = mapFilter?.elemRef.current;

      if (mapElem) {
        mapElem.onQueryChange(pages[0].aggregations.viewport);
      }

      const url = new URL(latestRouter.current.asPath, 'http://n').pathname
        + qs.stringify(latestQuery.current, { addQueryPrefix: true });

      if (url !== latestRouter.current.asPath) {
        latestRouter.current.push(url, null, { shallow: true });
      }
    }
    // deps: on `pages` change, useEffectEvent from react when possible
  }, [pages, previousPages, filters, latestQuery, latestRouter, urlQuery]);

  return (
    <>
      <main>
        <Metas agenda={agenda} query={query} preload={preload} />

        {user ? (
          <Box pos="sticky" top="0" zIndex="sticky">
            <ContextBar agenda={agenda} />
          </Box>
        ) : null}

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
          <ContentGrid
            total={(
              isMounted ? (
                <Suspense fallback={<TotalSkeleton />}>
                  <DynamicTotalPart
                    agenda={agenda}
                    filters={filters}
                    query={query}
                    includeFields={includeFields}
                  />
                </Suspense>
              ) : null
            )}
            events={(
              isMounted ? (
                <Suspense fallback={<EventsSkeleton />}>
                  <DynamicEventsPart
                    agenda={agenda}
                    filters={filters}
                    query={query}
                    includeFields={includeFields}
                  />
                </Suspense>
              ) : null
            )}
            filters={(
              isMounted ? (
                <Suspense fallback={<FiltersSkeleton />}>
                  <DynamicFiltersPart
                    agenda={agenda}
                    filters={filters}
                    query={query}
                    includeFields={includeFields}
                  />
                </Suspense>
              ) : null
            )}
          />
        </FiltersProvider>
      </main>

      {agenda.settings?.tracking?.googleAnalytics && cookies.CookieConsent === undefined ? (
        <ConsentBanner setCookie={setCookie} />
      ) : null}

      {isMounted ? (
        <Suspense>
          <DynamicLdJson
            agenda={agenda}
            filters={filters}
            query={query}
            includeFields={includeFields}
          />
        </Suspense>
      ) : null}
    </>
  );
}

AgendaShow.fetchLocale = locale => Promise.all([
  fetchLocale(locale),
  fetchErrorLocale(locale),
  fetchCommonLocale('event/attendanceModes', locale),
  import(`@openagenda/react-filters/locales-compiled/${locale}.json`).then(mod => mod.default),
]).then(results => Object.assign({}, ...results));

AgendaShow.includeFields = includeFields;

export default AgendaShow;

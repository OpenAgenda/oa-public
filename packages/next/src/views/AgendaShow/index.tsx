import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useIntl } from 'react-intl';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useLatest, usePrevious } from 'react-use';
import qs from 'qs';
import { Box, Container, useConst } from '@openagenda/uikit';
import {
  FiltersProvider,
  useFilters,
  fetchLocale as fetchFiltersLocales,
} from '@openagenda/react-filters';
import fetchCommonLocale from '@openagenda/common-labels/fetchLocale';
import fetchReactLocale from '@openagenda/react/fetchLocale';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useLocationQuery from 'hooks/useLocationQuery';
import useUser from 'hooks/useUser';
import fetchErrorLocale from 'components/ErrorDisplay/locales';
import NotificationModal from 'components/NotificationModal';
import ConsentBanner from 'components/ConsentBanner';
import NetworkErrorBoundary from 'components/NetworkErrorBoundary';
import useIsMounted from 'hooks/useIsMounted';
import useClientAnalytics from 'hooks/useClientAnalytics';
import type { Agenda } from 'types';

import listFiltersToInclude from 'utils/listFiltersToInclude';

import useEventsQuery from './hooks/useEventsQuery';
import Metas from './components/Metas';
import AgendaHeader from './components/AgendaHeader';
import ContextBar from './components/ContextBar';
import {
  EventsSkeleton,
  FiltersSkeleton,
  TotalSkeleton,
} from './components/LoadingPage';
import ContentGrid from './components/ContentGrid';
import includeFields from './includeFields';
import fetchLocale from './locales';
import messages from './messages';

import 'leaflet/dist/leaflet.css';

const DynamicEventsPart = dynamic(() => import('./components/EventsPart'));
const DynamicTotalPart = dynamic(() => import('./components/TotalPart'));
const DynamicFiltersPart = dynamic(() => import('./components/FiltersPart'));
const DynamicLdJson = dynamic(() => import('./components/LdJson'));

// @ts-ignore
DynamicEventsPart.render.preload();

export type AgendaShowProps = {
  agenda: Agenda;
  preload?: string[];
};

const stripLangPrefix = (pathname) => pathname.replace(/^\/[a-z][a-z]\//, '/');
const isDifferentPathname = (pathname1, pathname2) =>
  stripLangPrefix(pathname1) !== stripLangPrefix(pathname2);

function AgendaShow({ agenda, preload }: AgendaShowProps) {
  const intl = useIntl();
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale();
  const { user } = useUser();

  const filtersFormRef = useRef<any>(undefined);

  const urlQuery = useLocationQuery();
  const initialValues = useConst(() => urlQuery);

  const [query, setQuery] = useState(() => urlQuery);

  const latestQuery = useLatest(query);

  const isMounted = useIsMounted();

  const needConsentFor = useClientAnalytics(agenda.settings?.tracking);

  const filtersToInclude = useMemo(
    () => listFiltersToInclude(agenda),
    [agenda],
  );

  const filters = useFilters(intl, agenda.schema.fields, {
    dateFnsLocale,
    missingValue: 'null',
    mapTiles:
      'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f486f281abbe690750',
    // exclude: adminFilters,
    include: filtersToInclude,
  });

  const { data: pages } = useEventsQuery({
    agenda,
    filters,
    query,
    includeFields,
  });

  const [_isPending, startTransition] = useTransition();

  const onFilterChange = useCallback(
    (values: Record<string, string | string[]>) => {
      startTransition(() => {
        setQuery(values);
      });
    },
    [],
  );

  // Update filters if location change (back)
  useEffect(() => {
    const beforeHistoryChange = (href, { shallow }) => {
      const currentUrl = new URL(router.asPath, 'https://n');
      const url = new URL(href, 'https://n');

      if (isDifferentPathname(currentUrl.pathname, url.pathname) || !shallow)
        return;

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
      const mapFilter = filters.find((v) => v.name === 'geo');
      const mapElem = mapFilter?.elemRef.current;

      if (mapElem) {
        mapElem.onQueryChange(pages[0].aggregations.viewport);
      }
      const timingsFilter = filters.find((v) => v.name === 'timings');
      const timingsElem = timingsFilter?.elemRef?.current;

      if (timingsElem) {
        timingsElem.onQueryChange();
      }

      const url =
        new URL(latestRouter.current.asPath, 'https://n').pathname +
        qs.stringify(latestQuery.current, { addQueryPrefix: true });

      if (url !== latestRouter.current.asPath) {
        latestRouter.current.push(url, null, { shallow: true });
      }
    }
    // deps: on `pages` change, useEffectEvent from react when possible
  }, [pages, previousPages, filters, latestQuery, latestRouter, urlQuery]);

  return (
    <NetworkErrorBoundary
      fallback={() => (
        <>
          <ContentGrid
            total={<TotalSkeleton />}
            events={<EventsSkeleton />}
            filters={<FiltersSkeleton />}
          />
          <NotificationModal
            onClose={() => {}}
            title={intl.formatMessage(messages.networkErrorTitle)}
            message={intl.formatMessage(messages.networkErrorMessage)}
            action={intl.formatMessage(messages.retryButton)}
            onAction={() => window.location.reload()}
            showCloseButton={false}
          />
        </>
      )}
    >
      <main>
        <Metas agenda={agenda} query={query} preload={preload} />

        {user ? (
          <Box pos="sticky" top="0" zIndex="sticky">
            <ContextBar agenda={agenda} />
          </Box>
        ) : null}

        <Box as="header" w="full" bg="#413a42" px="4" py="8">
          <Container maxW="7xl" color="white">
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
          res={`/api/agendas/slug/${agenda.slug}/events`}
        >
          <ContentGrid
            total={
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
            }
            events={
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
            }
            filters={
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
            }
          />
        </FiltersProvider>
      </main>

      {needConsentFor ? <ConsentBanner consentFor={needConsentFor} /> : null}

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
    </NetworkErrorBoundary>
  );
}

AgendaShow.fetchLocale = (locale: string) =>
  Promise.all([
    fetchLocale(locale),
    fetchErrorLocale(locale),
    fetchCommonLocale('geo', locale),
    fetchCommonLocale('event/attendanceModes', locale),
    fetchCommonLocale('event/statuses', locale),
    fetchFiltersLocales(locale),
    fetchReactLocale(locale),
  ]).then((results) => Object.assign({}, ...results));

AgendaShow.includeFields = includeFields;

export default AgendaShow;

'use client';

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
import { usePathname, useSearchParams } from 'next/navigation';
import { useLatest, usePrevious } from 'react-use';
import qs from 'qs';
import { Box, Container, useConst } from '@openagenda/uikit';
import { FiltersProvider, useFilters } from '@openagenda/react-filters';
import useDateFnsLocale from '@/src/hooks/useDateFnsLocale';
import useUser from '@/src/hooks/useUser';
import NotificationModal from '@/src/components/NotificationModal';
import ConsentBanner from '@/src/components/ConsentBanner';
import NetworkErrorBoundary from '@/src/components/NetworkErrorBoundary';
import useIsMounted from '@/src/hooks/useIsMounted';
import useClientAnalytics from '@/src/hooks/useClientAnalytics';
import type { Agenda } from '@/src/types';

import listFiltersToInclude from '@/src/utils/listFiltersToInclude';

import useEventsQuery from '../_hooks/useEventsQuery';
import messages from '../messages';
import AgendaHeader from './AgendaHeader';
import ContextBar from './ContextBar';
import { EventsSkeleton, FiltersSkeleton, TotalSkeleton } from './LoadingPage';
import ContentGrid from './ContentGrid';

import 'leaflet/dist/leaflet.css';

const DynamicEventsPart = dynamic(() => import('./EventsPart'));
const DynamicTotalPart = dynamic(() => import('./TotalPart'));
const DynamicFiltersPart = dynamic(() => import('./FiltersPart'));
const DynamicLdJson = dynamic(() => import('./LdJson'));

export type AgendaShowProps = {
  agenda: Agenda;
  initialQuery?: import('qs').ParsedQs;
};

function AgendaShow({ agenda, initialQuery = {} }: AgendaShowProps) {
  const intl = useIntl();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dateFnsLocale = useDateFnsLocale();
  const { user } = useUser();

  const filtersFormRef = useRef<any>(undefined);

  const initialValues = useConst(() => initialQuery);

  const [query, setQuery] = useState(() => initialQuery);

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
    include: filtersToInclude,
  });

  const { data: pages } = useEventsQuery({
    agenda,
    filters,
    query,
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

  // Re-sync filters form when the URL changes externally (back/forward, link
  // click). App Router has no "beforeHistoryChange" hook, so we react after
  // navigation completes by comparing search params with the form state.
  const previousSearch = useRef(searchParams.toString());
  useEffect(() => {
    const currentSearch = searchParams.toString();
    if (currentSearch === previousSearch.current) return;
    previousSearch.current = currentSearch;

    const form = filtersFormRef.current;
    if (!form) return;

    const newUrlQuery = qs.parse(currentSearch);
    form.initialize(newUrlQuery);
    form.submit();
  }, [searchParams]);

  // Push current query into the URL after pages update so that the address bar
  // reflects the active filters (kept from the Pages Router behavior).
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

      const nextSearch = qs.stringify(latestQuery.current);
      const currentSearch = searchParams.toString();

      if (nextSearch !== currentSearch) {
        // Use history API instead of router.push: filter state only needs to
        // be reflected in the URL for bookmarkability, we don't want Next.js
        // to treat this as a real navigation (which would trigger RSC fetch
        // and scroll-to-top).
        previousSearch.current = nextSearch;
        const nextUrl = nextSearch ? `${pathname}?${nextSearch}` : pathname;
        window.history.replaceState(null, '', nextUrl);
      }
    }
  }, [pages, previousPages, filters, latestQuery, pathname, searchParams]);

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
          <DynamicLdJson agenda={agenda} filters={filters} query={query} />
        </Suspense>
      ) : null}
    </NetworkErrorBoundary>
  );
}

export default AgendaShow;

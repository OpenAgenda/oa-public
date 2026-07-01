'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useIntl } from 'react-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import qs from 'qs';
import {
  chakra,
  useConst,
  Button,
  Flex,
  Spacer,
  Link,
} from '@openagenda/uikit';
import {
  FiltersProvider,
  getFilters,
  useFilters,
} from '@openagenda/react-filters';
import { useLatest, usePrevious } from 'react-use';
import useDateFnsLocale from '@/src/hooks/useDateFnsLocale';
import useIsMounted from '@/src/hooks/useIsMounted';
import useClientAnalytics from '@/src/hooks/useClientAnalytics';
import { useEmbedLayoutData } from '@/src/app/[locale]/embed/_components/EmbedLayoutShell';
import ConsentBanner from '@/src/components/ConsentBanner';
import OAAttribution from '@/src/components/OAAttribution';
import { omitParams } from '@/src/utils/embedParams';
import useEventsQuery from '@/src/app/[locale]/(app)/[agendaSlug]/_hooks/useEventsQuery';
import { TotalSkeleton } from '@/src/app/[locale]/(app)/[agendaSlug]/_components/LoadingPage';
import applyPrefilterToEventsQuery from '@/src/utils/applyPrefilterToEventsQuery';
import { FaIcon } from '@/src/icons';
import { faShareNodes } from '@/src/icons/regular';
import { faPlus } from '@/src/icons/solid';
import type { Agenda } from '@/src/types';
import messages from '../messages';
import { EventsSkeleton, FiltersSkeleton } from './LoadingPage';

import 'leaflet/dist/leaflet.css';

const DynamicEventsPart = dynamic(() => import('./EventsPart'));
const DynamicTotalPart = dynamic(() => import('./TotalPart'));
const DynamicFiltersPart = dynamic(() => import('./FiltersPart'));

export type EmbedAgendaShowProps = {
  agenda: Agenda;
  referrer?: string;
};

export default function EmbedAgendaShow({
  agenda,
  referrer: referrerProps,
}: EmbedAgendaShowProps) {
  const intl = useIntl();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const asPath = useMemo(() => {
    const s = searchParams.toString();
    return s ? `${pathname}?${s}` : pathname;
  }, [pathname, searchParams]);
  const dateFnsLocale = useDateFnsLocale();

  const {
    query,
    setQuery,
    prefilter,
    sort,
    displayTotal,
    exportModal,
    contributionButton,
    pageSize,
    itemLayout,
    logo,
    referrer: layoutDataReferrer,
    setReferrer,
    themeConfig,
  } = useEmbedLayoutData();

  const referrer = layoutDataReferrer || referrerProps;
  const isHorizontal = itemLayout === 'horizontal';

  const filtersFormRef = useRef<any>(undefined);

  const initialValues = useConst(() => omitParams(query));

  const latestQuery = useLatest(query);

  const isMounted = useIsMounted();

  const needConsentFor = useClientAnalytics(
    agenda.settings?.tracking,
    'localStorage',
  );

  const filtersToInclude = useMemo(() => {
    const requiredFilters = (prefilter.filters as string)?.split(',') ?? [];

    return getFilters(intl, agenda.schema.fields)
      .map(({ name, fieldSchema }) => fieldSchema?.field || name)
      .filter((filter) => requiredFilters.includes(filter))
      .sort((a, b) => {
        // Last
        if (a === 'geo') return 1;
        if (b === 'geo') return -1;
        // Second to last
        if (a === 'search') return 1;
        if (b === 'search') return -1;
        return requiredFilters.indexOf(a) - requiredFilters.indexOf(b);
      });
  }, [agenda.schema.fields, prefilter.filters]);

  const filters = useFilters(intl, agenda.schema.fields, {
    dateFnsLocale,
    missingValue: 'null',
    mapTiles:
      'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f486f281abbe690750',
    // exclude: adminFilters,
    include: filtersToInclude,
  });

  const [isExportLoading, setIsExportLoading] = useState(false);

  const handleExportClick = useCallback(async () => {
    setIsExportLoading(true);
    try {
      await window.oaIFrame.callParent('openAgendaExportModal', {
        agenda,
        query: omitParams(
          applyPrefilterToEventsQuery({
            query,
            prefilter,
            filters,
          }),
        ),
        locale: intl.locale,
        themeConfig,
      });
    } catch (error) {
      console.error('Export modal error:', error);
    } finally {
      setIsExportLoading(false);
    }
  }, [agenda, query, prefilter, filters, intl.locale, themeConfig]);

  const { data: pages } = useEventsQuery({
    agenda,
    filters,
    query: omitParams({
      ...applyPrefilterToEventsQuery({ query, prefilter, filters }),
      cms: 'embed',
      host: referrer,
    }),
    pageSize,
    sort,
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

  // Update filters if location change (back/forward). App Router has no
  // router.events equivalent — watch searchParams instead. Skip the first
  // render so we don't resubmit the initial form state on mount.
  const previousSearch = useRef<string | null>(null);
  useEffect(() => {
    const currentSearch = searchParams.toString();
    if (previousSearch.current === null) {
      previousSearch.current = currentSearch;
      return;
    }
    if (previousSearch.current === currentSearch) return;
    previousSearch.current = currentSearch;

    const form = filtersFormRef.current;
    if (!form) return;

    const newUrlQuery = qs.parse(currentSearch);
    form.initialize(newUrlQuery);
    form.submit();
  }, [searchParams]);

  // SWR onSuccess
  // https://github.com/vercel/swr/issues/1733
  const latestAsPath = useLatest(asPath);
  const latestPathname = useLatest(pathname);
  const previousPages = usePrevious(pages);
  useEffect(() => {
    if (pages?.length > 0 && previousPages !== pages) {
      // Update map markers
      const mapFilter = filters.find((v) => v.name === 'geo');
      const mapElem = mapFilter?.elemRef.current;

      if (mapElem) {
        mapElem.onQueryChange(pages[0].aggregations.viewport);
      }

      const url =
        latestPathname.current +
        qs.stringify(latestQuery.current, { addQueryPrefix: true });

      if (url !== latestAsPath.current) {
        // history.pushState vs router.push to mirror Pages Router shallow
        // routing and skip the RSC refetch on every filter change.
        // useSearchParams observes history changes since Next 14.1.
        window.history.pushState(null, '', url);
      }
    }
    // deps: on `pages` change, useEffectEvent from react when possible
  }, [
    pages,
    previousPages,
    filters,
    latestQuery,
    latestPathname,
    latestAsPath,
  ]);

  useLayoutEffect(() => {
    if (layoutDataReferrer === undefined) {
      setReferrer(referrerProps || null);
    }
  }, []);

  return (
    <>
      <chakra.main display="flex" flexDir="column" gap="8">
        <FiltersProvider
          onSubmit={onFilterChange}
          initialValues={initialValues}
          intl={intl}
          dateFnsLocale={dateFnsLocale}
          ref={filtersFormRef}
          filters={filters}
          res={`/api/agendas/slug/${agenda.slug}/events`}
        >
          {isMounted ? (
            <>
              {filters.length ? (
                <Suspense
                  fallback={
                    <FiltersSkeleton
                      filters={filters}
                      filtersToInclude={filtersToInclude}
                    />
                  }
                >
                  <DynamicFiltersPart
                    agenda={agenda}
                    filters={filters}
                    query={query}
                    filtersToInclude={filtersToInclude}
                    prefilter={prefilter}
                    referrer={referrer}
                  />
                </Suspense>
              ) : null}

              {displayTotal !== false || exportModal || contributionButton ? (
                <Suspense fallback={<TotalSkeleton />}>
                  <Flex alignItems="center" wrap="wrap" gap="2">
                    {displayTotal !== false ? (
                      <DynamicTotalPart
                        agenda={agenda}
                        filters={filters}
                        query={query}
                        prefilter={prefilter}
                        referrer={referrer}
                      />
                    ) : null}

                    <Spacer />

                    {exportModal || contributionButton ? (
                      <Flex wrap="wrap" gap="2">
                        {exportModal ? (
                          <Button
                            alignSelf="center"
                            variant="outline"
                            onClick={handleExportClick}
                            disabled={isExportLoading}
                            loading={isExportLoading}
                          >
                            <FaIcon icon={faShareNodes} />
                            {intl.formatMessage(messages.export)}
                          </Button>
                        ) : null}

                        {contributionButton ? (
                          <Button asChild alignSelf="center" variant="outline">
                            <Link
                              unstyled
                              href={`${process.env.NEXT_PUBLIC_ROOT}/${agenda.slug}/contribute`}
                              target="_blank"
                              rel="noopener nofollow"
                            >
                              <FaIcon icon={faPlus} />
                              {intl.formatMessage(messages.addEvent)}
                            </Link>
                          </Button>
                        ) : null}
                      </Flex>
                    ) : null}
                  </Flex>
                </Suspense>
              ) : null}

              <Suspense
                fallback={<EventsSkeleton isHorizontal={isHorizontal} />}
              >
                <DynamicEventsPart
                  agenda={agenda}
                  filters={filters}
                  query={query}
                  prefilter={prefilter}
                  referrer={referrer}
                />
              </Suspense>
            </>
          ) : null}
        </FiltersProvider>
      </chakra.main>

      {needConsentFor ? (
        <ConsentBanner
          consentFor={needConsentFor}
          consentSource="localStorage"
          display="overlay"
        />
      ) : null}

      {logo !== 'hide' ? <OAAttribution source="agenda" /> : null}
    </>
  );
}

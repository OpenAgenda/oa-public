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
import { useRouter } from 'next/router';
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
  fetchLocale as fetchFiltersLocales,
} from '@openagenda/react-filters';
import fetchCommonLocale from '@openagenda/common-labels/fetchLocale';
import { useLatest, usePrevious } from 'react-use';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useIsMounted from 'hooks/useIsMounted';
import useClientAnalytics from 'hooks/useClientAnalytics';
import { useEmbedLayoutData } from 'components/EmbedLayout';
import ConsentBanner from 'components/ConsentBanner';
import OAAttribution from 'components/OAAttribution';
import { omitParams } from 'utils/embedParams';
import useEventsQuery from 'views/AgendaShow/hooks/useEventsQuery';
import includeFields from 'views/AgendaShow/includeFields';
import { TotalSkeleton } from 'views/AgendaShow/components/LoadingPage';
import { FaIcon } from 'icons';
import { faShareNodes } from 'icons/regular';
import { faPlus } from 'icons/solid';
import type { Agenda } from 'types';
import Metas from './components/Metas';
import { EventsSkeleton, FiltersSkeleton } from './components/LoadingPage';
import getPrefilteredQuery from './utils/getPrefilteredQuery';
import messages from './messages';
import fetchLocale from './locales';

import 'leaflet/dist/leaflet.css';

const DynamicEventsPart = dynamic(() => import('./components/EventsPart'));
const DynamicTotalPart = dynamic(() => import('./components/TotalPart'));
const DynamicFiltersPart = dynamic(() => import('./components/FiltersPart'));

export type EmbedAgendaShowProps = {
  agenda: Agenda;
  preload?: string[];
  referrer?: string;
};

const stripLangPrefix = (pathname) => pathname.replace(/^\/[a-z][a-z]\//, '/');
const isDifferentPathname = (pathname1, pathname2) =>
  stripLangPrefix(pathname1) !== stripLangPrefix(pathname2);

function EmbedAgendaShow({
  agenda,
  preload,
  referrer: referrerProps,
}: EmbedAgendaShowProps) {
  const intl = useIntl();
  const router = useRouter();
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
    logo,
    referrer: layoutDataReferrer,
    setReferrer,
    themeConfig,
  } = useEmbedLayoutData();

  const referrer = layoutDataReferrer || referrerProps;

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
          getPrefilteredQuery({
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
      ...getPrefilteredQuery({ query, prefilter, filters }),
      cms: 'embed',
      host: referrer,
    }),
    includeFields,
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

      const url =
        new URL(latestRouter.current.asPath, 'https://n').pathname +
        qs.stringify(latestQuery.current, { addQueryPrefix: true });

      if (url !== latestRouter.current.asPath) {
        latestRouter.current.push(url, null, { shallow: true });
      }
    }
    // deps: on `pages` change, useEffectEvent from react when possible
  }, [pages, previousPages, filters, latestQuery, latestRouter]);

  useLayoutEffect(() => {
    if (layoutDataReferrer === undefined) {
      setReferrer(referrerProps || null);
    }
  }, []);

  return (
    <>
      <chakra.main display="flex" flexDir="column" gap="8">
        <Metas agenda={agenda} preload={preload} />

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
                    includeFields={includeFields}
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
                        includeFields={includeFields}
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

              <Suspense fallback={<EventsSkeleton />}>
                <DynamicEventsPart
                  agenda={agenda}
                  filters={filters}
                  query={query}
                  includeFields={includeFields}
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

EmbedAgendaShow.fetchLocale = (locale: string) =>
  Promise.all([
    fetchLocale(locale),
    fetchCommonLocale('event/attendanceModes', locale),
    fetchCommonLocale('event/statuses', locale),
    fetchFiltersLocales(locale),
  ]).then((results) => Object.assign({}, ...results));

export default EmbedAgendaShow;

import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import qs from 'qs';
import { chakra, useConst } from '@openagenda/uikit';
import { FiltersProvider, useFilters } from '@openagenda/react-filters';
import { useLatest, usePrevious } from 'react-use';
import useSessionStorageState from 'use-session-storage-state';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useIsMounted from 'hooks/useIsMounted';
import useClientAnalytics from 'hooks/useClientAnalytics';
import useIsFirstRender from 'hooks/useIsFirstRender';
import ConsentBanner from 'components/ConsentBanner';
// import useLocationQuery from 'hooks/useLocationQuery';
import useEventsQuery from 'views/AgendaShow/hooks/useEventsQuery';
import includeFields from 'views/AgendaShow/includeFields';
import { TotalSkeleton } from 'views/AgendaShow/components/LoadingPage';
import type { Agenda } from 'types';
import Metas from './components/Metas';
import { EventsSkeleton, FiltersSkeleton } from './components/LoadingPage';

import fetchLocale from './locales';
import 'leaflet/dist/leaflet.css';
import getPrefilteredQuery from './utils/getPrefilteredQuery';

if (typeof window !== 'undefined') {
  import('@iframe-resizer/child');
}

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

export type EmbedAgendaShowProps = {
  agenda: Agenda;
  preload?: string[];
  referrer: string;
  filtersToInclude?: string[];
  prefilter?: Record<string, any>;
};

function EmbedAgendaShow({
  agenda,
  preload,
  referrer,
  filtersToInclude,
  prefilter: originalPrefilter,
}: EmbedAgendaShowProps) {
  const intl = useIntl();
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale();

  const filtersFormRef = useRef<any>();

  const [prefilter, setStoredPrefilter] = useSessionStorageState('prefilter', {
    defaultValue: originalPrefilter,
  });

  const isFirstRender = useIsFirstRender();

  useLayoutEffect(() => {
    if (isFirstRender) {
      setStoredPrefilter(originalPrefilter);
      // router.replace(new URL(router.asPath, 'https://n').pathname, null, { shallow: true });
    }
  }, [isFirstRender, originalPrefilter, setStoredPrefilter]);

  // TODO filter query before to give that to the Filters form, only more "contraignantes" parts of the urlQUery ?
  const initialValues = useConst(() => ({}));

  const [query, setQuery] = useState(() => ({}));

  const latestQuery = useLatest(query);

  const isMounted = useIsMounted();

  const needConsentFor = useClientAnalytics(agenda.settings?.tracking);

  const filters = useFilters(intl, agenda.schema.fields, {
    dateFnsLocale,
    missingValue: 'null',
    mapTiles: 'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f486f281abbe690750',
    // exclude: adminFilters,
    include: filtersToInclude,
  });

  console.log('PREFILTER', prefilter, filters);

  const { data: pages } = useEventsQuery({
    agenda,
    filters,
    query: {
      ...getPrefilteredQuery({ query, prefilter, filters }),
      cms: 'embed',
      host: typeof document !== 'undefined' ? document.referrer : referrer,
    },
    includeFields,
    pageSize: 12,
  });

  const [_isPending, startTransition] = useTransition();

  const onFilterChange = useCallback((values: Record<string, string | string[]>) => {
    startTransition(() => {
      // TODO setQuery with only more "contraignantes" values
      setQuery(values);
    });
  }, []);

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

      const url = new URL(latestRouter.current.asPath, 'https://n').pathname
        + qs.stringify(latestQuery.current, { addQueryPrefix: true });

      if (url !== latestRouter.current.asPath) {
        latestRouter.current.push(url, null, { shallow: true });
      }
    }
    // deps: on `pages` change, useEffectEvent from react when possible
  }, [pages, previousPages, filters, latestQuery, latestRouter]);

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
        >
          {isMounted ? (
            <>
              <Suspense fallback={<FiltersSkeleton filters={filters} filtersToInclude={filtersToInclude} />}>
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

              <Suspense fallback={<TotalSkeleton />}>
                <DynamicTotalPart
                  agenda={agenda}
                  filters={filters}
                  query={query}
                  includeFields={includeFields}
                  prefilter={prefilter}
                  referrer={referrer}
                />
              </Suspense>

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

      {needConsentFor ? <ConsentBanner consentFor={needConsentFor} /> : null}
    </>
  );
}

EmbedAgendaShow.fetchLocale = (locale: string) =>
  Promise.all([
    fetchLocale(locale),
    import(`@openagenda/react-filters/locales-compiled/${locale}.json`).then(mod => mod.default),
  ]).then(results => Object.assign({}, ...results));

export default EmbedAgendaShow;

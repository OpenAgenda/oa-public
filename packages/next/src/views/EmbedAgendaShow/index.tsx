import { Suspense, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import qs from 'qs';
import { chakra, useConst } from '@openagenda/uikit';
import { FiltersProvider, getAdditionalFilters, useFilters } from '@openagenda/react-filters';
import { useLatest, usePrevious } from 'react-use';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useIsMounted from 'hooks/useIsMounted';
import useClientAnalytics from 'hooks/useClientAnalytics';
import ConsentBanner from 'components/ConsentBanner';
import useLocationQuery from 'hooks/useLocationQuery';
import useEventsQuery from 'views/AgendaShow/hooks/useEventsQuery';
import includeFields from 'views/AgendaShow/includeFields';
import type { Agenda } from 'types';
import Metas from './components/Metas';
import { EventsSkeleton } from './components/LoadingPage';
import fetchLocale from './locales';

if (typeof window !== 'undefined') {
  import('@iframe-resizer/child');
}

const DynamicEventsPart = dynamic(() => import('./components/EventsPart'), {
  // ssr: false,
  suspense: true,
});

export type EmbedAgendaShowProps = {
  agenda: Agenda;
  preload?: string[];
  referrer: string;
};

function EmbedAgendaShow({ agenda, preload, referrer }: EmbedAgendaShowProps) {
  const intl = useIntl();
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale();

  const filtersFormRef = useRef<any>();

  const urlQuery = useLocationQuery();
  const initialValues = useConst(() => urlQuery);

  const [query, setQuery] = useState(() => urlQuery);

  const latestQuery = useLatest(query);

  const isMounted = useIsMounted();

  const needConsentFor = useClientAnalytics(agenda.settings?.tracking);

  const filtersToInclude = useMemo(() => {
    const additionalFilters = getAdditionalFilters(agenda.schema.fields).map(({ fieldSchema }) => fieldSchema.field);

    return ['geo', 'timings', ...additionalFilters];
  }, [agenda.schema.fields]);

  const filters = useFilters(intl, agenda.schema.fields, {
    dateFnsLocale,
    missingValue: 'null',
    mapTiles: 'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f486f281abbe690750',
    // exclude: adminFilters,
    include: filtersToInclude,
  });

  const { data: pages } = useEventsQuery({
    agenda,
    filters,
    query: {
      ...query,
      cms: 'embed',
      host: typeof document !== 'undefined' ? document.referrer : referrer,
    },
    includeFields,
    pageSize: 12,
  });

  const [_isPending, startTransition] = useTransition();

  const onFilterChange = useCallback((values: Record<string, string | string[]>) => {
    startTransition(() => {
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
  }, [pages, previousPages, filters, latestQuery, latestRouter, urlQuery]);

  return (
    <>
      <chakra.main display="flex" flexDir="column">
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
            <Suspense fallback={<EventsSkeleton />}>
              <DynamicEventsPart
                agenda={agenda}
                filters={filters}
                query={query}
                includeFields={includeFields}
                referrer={referrer}
              />
            </Suspense>
          ) : null}
        </FiltersProvider>
      </chakra.main>

      {needConsentFor ? <ConsentBanner consentFor={needConsentFor} /> : null}
    </>
  );
}

EmbedAgendaShow.fetchLocale = (locale: string) =>
  Promise.all([fetchLocale(locale)]).then(results => Object.assign({}, ...results));

export default EmbedAgendaShow;

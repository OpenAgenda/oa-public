import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useIntl } from 'react-intl';
import dynamic from 'next/dynamic';
import { useLatest } from 'react-use';
import qs from 'qs';
import { formatInTimeZone } from 'date-fns-tz';
import stringify from 'fast-json-stable-stringify';
import { Box, Container, useConst } from '@openagenda/uikit';
import { FiltersProvider, useFilters } from '@openagenda/react-filters';
import fetchCommonLocale from '@openagenda/common-labels/fetchLocale';
import { toEventSchema } from '@openagenda/sdk-js';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useLocationQuery from 'hooks/useLocationQuery';
import useUser from 'hooks/useUser';
import addGoogleAnalyticsTracker from 'utils/addGoogleAnalyticsTracker';
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
  const dateFnsLocale = useDateFnsLocale();
  const { user } = useUser();

  const filtersFormRef = useRef<any>();

  const urlQuery = useLocationQuery();
  const initialValues = useConst(() => urlQuery);

  const [query, setQuery] = useState(() => urlQuery);

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

  const {
    data: pages,
    // error,
    // size,
    // setSize,
  } = useEventsQuery({ agenda, filters, query, includeFields });

  const onFilterChange = useCallback((values: Record<string, string | string[]>) => {
    setQuery(values);
  }, []);

  // Update filters if location change (back)
  const latestQuery = useLatest(query);
  useEffect(() => {
    if (qs.stringify(latestQuery.current) !== qs.stringify(urlQuery)) {
      const form = filtersFormRef.current;

      form.initialize(urlQuery);
      form.submit();
    }
  }, [latestQuery, urlQuery]);

  const eventsLdJSON = useMemo(() => {
    const eventSchemas = pages
      ?.flatMap(p => p.events)
      .map(event => toEventSchema(event, {
        locale: intl.locale,
        formatDate: (date, tz = 'Europe/Paris') => formatInTimeZone(date, tz, 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
        url: `${process.env.NEXT_PUBLIC_SITE_ROOT}/${agenda.slug}/events/${event.slug}`,
      }));
    return stringify(eventSchemas);
  }, [agenda.slug, intl.locale, pages]);

  return (
    <>
      <main>
        <Metas agenda={agenda} query={query} preload={preload} />

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

AgendaShow.includeFields = includeFields;

export default AgendaShow;

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { createIntl, createIntlCache } from 'react-intl/server';
import { unstable_serialize } from 'swr';
import { unstable_serialize as unstable_serialize_infinite } from 'swr/infinite';
import { getSupportedLocale } from '@openagenda/intl';
import {
  filtersToAggregations,
  getAdditionalFilters,
  getFilters,
} from '@openagenda/react-filters';
import getLocale from '@/src/utils/getLocale';
import getDateFnsLocale from '@/src/utils/getDateFnsLocale';
import parseLocationQuery from '@/src/utils/parseLocationQuery';
import parseServerSearchParams from '@/src/utils/parseServerSearchParams';
import { extractParams, omitParams } from '@/src/utils/embedParams';
import isUpcomingOnlyQuery from '@/src/utils/isUpcomingOnlyQuery';
import { errorToJSON } from '@/src/utils/errorToJSON';
import kyErrorToVError from '@/src/utils/kyErrorToVError';
import { logError } from '@/src/utils/sentry';
import applyPrefilterToEventsQuery from '@/src/utils/applyPrefilterToEventsQuery';
import { includeFields } from '@/src/app/[locale]/(app)/[agendaSlug]/_utils/includeFields';
import {
  eventsKey,
  filtersBaseKey,
} from '@/src/app/[locale]/(app)/[agendaSlug]/_utils/swrKeys';
import fetchAppLocale from '@/src/app/locales';
import fetchExternalLocale from '@/src/app/locales/external';
import { fetchEmbedAgenda, fetchEmbedAgendaEvents } from './_api';
import EmbedAgendaShowClient from './_components/EmbedAgendaShowClient';
import EmbedAgendaError from './_components/EmbedAgendaError';

type Params = Promise<{ locale: string; agendaUid: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { agendaUid } = await params;
  try {
    const agenda = await fetchEmbedAgenda(agendaUid);
    return {
      title: `${agenda.title} | OpenAgenda Embed`,
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: 'OpenAgenda Embed',
      robots: { index: false, follow: false },
    };
  }
}

export default async function EmbedAgendaPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { agendaUid } = await params;
  const sp = await searchParams;
  const locale = await getLocale();
  const headersList = await headers();

  let agenda;
  try {
    agenda = await fetchEmbedAgenda(agendaUid);
  } catch (e) {
    const error = await kyErrorToVError(e);
    const statusCode = error.statusCode ?? 500;
    if (statusCode !== 401 && statusCode !== 403 && statusCode !== 404) {
      logError(error);
    }
    return (
      <EmbedAgendaError statusCode={statusCode} error={errorToJSON(error)} />
    );
  }

  // `createIntl` is server-safe (from `react-intl/server`). We reuse the same
  // merged message bundle the root layout passes to the client IntlProvider,
  // so server-side filter labels match what the client renders after hydration.
  const [appMessages, externalMessages] = await Promise.all([
    fetchAppLocale(locale),
    fetchExternalLocale(locale),
  ]);
  const intlMessages = { ...externalMessages, ...appMessages };
  const cache = createIntlCache();
  const intl = createIntl(
    {
      locale,
      messages: intlMessages,
      defaultLocale: getSupportedLocale(locale),
      onError() {
        /* swallow MISSING_* noise from optional filter labels */
      },
    },
    cache,
  );

  const dateFnsLocale = await getDateFnsLocale(locale);

  const query = parseServerSearchParams(sp);

  const additionalFilters = getAdditionalFilters(agenda.schema.fields).map(
    ({ fieldSchema }: any) => fieldSchema.field,
  );

  const initQuery = query.initPath
    ? parseLocationQuery(query.initPath as string)
    : null;
  const prefilter = initQuery ?? query;

  const requiredFilters = (prefilter.filters as string)?.split(',') ?? [];

  const filtersToInclude = ['search', 'geo', 'timings', ...additionalFilters]
    .filter((filter) => requiredFilters.includes(filter))
    .sort((a, b) => {
      if (a === 'geo') return 1;
      if (b === 'geo') return -1;
      if (a === 'search') return 1;
      if (b === 'search') return -1;
      return requiredFilters.indexOf(a) - requiredFilters.indexOf(b);
    });

  const filters = getFilters(intl, agenda.schema.fields, {
    dateFnsLocale,
    missingValue: 'null',
    include: filtersToInclude,
  });

  // `EmbedAgendaShowClient` normalizes its `referrer` prop via `referrer ?? undefined`
  // before forwarding to `EmbedAgendaShow`. Use `undefined` here so the
  // `host: referrer` entry in the prefilter object hashes the same on server
  // and client first-render (where the state is still `undefined`).
  const referrer =
    (query.host as string) || headersList.get('referer') || undefined;

  // Mirror the client `EmbedLayoutShell` → `EmbedAgendaShow` wiring so the
  // SWR keys computed here match the ones the hooks will serialize on mount.
  // `embedParams.sort` / `pageSize` come from the same source (initPath or
  // current query) the client uses via `extractParams`.
  const embedParams = extractParams(
    (initQuery ?? query) as Record<string, string>,
  );
  const pageSize = embedParams.pageSize ?? 12;
  const sort = embedParams.sort;

  // Embed `TotalPart` passes an augmented prefilter (with cms/host) to
  // `useFiltersBaseQuery`, not a raw null. So the filtersBase SWR key and its
  // URL params both carry the embedPrefilter.
  const embedPrefilter = omitParams({
    ...prefilter,
    cms: 'embed',
    host: referrer,
  });

  const clientQuery = omitParams({
    ...applyPrefilterToEventsQuery({ query, prefilter, filters }),
    cms: 'embed',
    host: referrer,
  });

  const baseUpcomingOnly = isUpcomingOnlyQuery(
    applyPrefilterToEventsQuery({
      prefilter: embedPrefilter,
      query,
      filters,
    }),
  );
  const eventsUpcomingOnly = isUpcomingOnlyQuery(clientQuery);

  const filtersBaseFetchParams = {
    aggsSizeLimit: 1500,
    aggs: filtersToAggregations(filters, true),
    size: 0,
    relative: baseUpcomingOnly ? ['current', 'upcoming'] : undefined,
    ...embedPrefilter,
    passed: undefined,
  };

  const eventsFetchParams = {
    aggsSizeLimit: 1500,
    aggs: filtersToAggregations(filters, false),
    sort: (clientQuery.search as string)?.length
      ? 'score'
      : sort || 'lastTimingWithFeatured.asc',
    size: pageSize,
    ...eventsUpcomingOnly ? { relative: ['current', 'upcoming'] } : {},
    ...clientQuery,
    from: 0,
    passed: undefined,
    includeFields,
    includeImageTimestamps: true,
  };

  const [filtersBaseRes, eventsRes] = await Promise.allSettled([
    fetchEmbedAgendaEvents(agenda.slug, filtersBaseFetchParams),
    fetchEmbedAgendaEvents(agenda.slug, eventsFetchParams),
  ]);

  const fallback: Record<string, any> = {};

  if (filtersBaseRes.status === 'fulfilled') {
    fallback[
      unstable_serialize(
        filtersBaseKey(agenda.slug, {
          upcomingOnly: baseUpcomingOnly,
          ...embedPrefilter,
        }),
      )
    ] = filtersBaseRes.value;
  }

  if (eventsRes.status === 'fulfilled') {
    fallback[unstable_serialize_infinite(eventsKey(agenda.slug, clientQuery))] =
      [eventsRes.value];
  }

  return (
    <EmbedAgendaShowClient
      agenda={agenda}
      fallback={fallback}
      referrer={referrer}
    />
  );
}

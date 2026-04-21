import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { createIntl, createIntlCache } from 'react-intl/server';
import qs from 'qs';
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
import { omitParams, validateSort } from '@/src/utils/embedParams';
import isUpcomingOnlyQuery from '@/src/utils/isUpcomingOnlyQuery';
import { errorToJSON } from '@/src/utils/errorToJSON';
import kyErrorToVError from '@/src/utils/kyErrorToVError';
import { logError } from '@/src/utils/sentry';
import applyPrefilterToEventsQuery from '@/src/utils/applyPrefilterToEventsQuery';
import { includeFields } from '@/src/app/[locale]/(app)/[agendaSlug]/_utils/includeFields';
import fetchAppLocale from '@/src/app/locales';
import fetchExternalLocale from '@/src/app/locales/external';
import { fetchEmbedAgenda } from './_api';
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

  const prefilter = query.initPath
    ? parseLocationQuery(query.initPath as string)
    : query;

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

  const prefilteredQuery = applyPrefilterToEventsQuery({
    query,
    prefilter,
    filters,
  });
  const timingsPrefilter = isUpcomingOnlyQuery(prefilteredQuery)
    ? { relative: ['current', 'upcoming'] }
    : null;

  const referrer = (query.host as string) || headersList.get('referer') || null;

  const paramsBase = omitParams({
    aggsSizeLimit: 1500,
    aggs: filtersToAggregations(filters, true),
    size: 0,
    ...timingsPrefilter,
    ...prefilter,
    cms: 'embed',
    host: referrer,
    passed: undefined,
  });

  const paramsFull = {
    aggsSizeLimit: 1500,
    aggs: filtersToAggregations(filters, false),
    from: 0,
    sort: (query.search as string)?.length
      ? 'score'
      : validateSort(prefilteredQuery.sort) || 'lastTimingWithFeatured.asc',
    size: 12,
    ...timingsPrefilter,
    ...omitParams(prefilteredQuery),
    cms: 'embed',
    host: referrer,
    passed: undefined,
    includeFields,
    includeImageTimestamps: true,
  };

  const preload = [
    `/api/agendas/slug/${agenda.slug}/events?${qs.stringify(paramsBase, { skipNulls: true })}`,
    `/api/agendas/slug/${agenda.slug}/events?${qs.stringify(paramsFull, { skipNulls: true })}`,
  ];

  return (
    <>
      {preload.map((href) => (
        <link
          key={href}
          rel="preload"
          href={href}
          as="fetch"
          crossOrigin="anonymous"
        />
      ))}
      <EmbedAgendaShowClient agenda={agenda} referrer={referrer} />
    </>
  );
}

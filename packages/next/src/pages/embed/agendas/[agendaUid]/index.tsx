import { GetServerSideProps } from 'next';
import ky from 'ky';
import qs from 'qs';
import { SWRConfig } from 'swr';
import { createIntl, createIntlCache } from 'react-intl';
import { getSupportedLocale } from '@openagenda/intl';
import {
  filtersToAggregations,
  getAdditionalFilters,
  getFilters,
} from '@openagenda/react-filters';
import { NextPageWithLayout } from 'pages/_app';
import EmbedAgendaShow, { EmbedAgendaShowProps } from 'views/EmbedAgendaShow';
import includeFields from 'views/AgendaShow/includeFields';
import getPrefilteredQuery from 'views/EmbedAgendaShow/utils/getPrefilteredQuery';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';
import EmbedLayout from 'components/EmbedLayout';
import parseLocationQuery from 'utils/parseLocationQuery';
import getDateFnsLocale from 'utils/getDateFnsLocale';
import { normalizeUrl as normalizeMatomoUrl } from 'utils/addMatomoTracker';
import generateNonce from 'utils/generateNonce';
import CSP, { DEFAULT_DIRECTIVES } from 'utils/contentSecurityPolicy';
import { omitParams } from 'utils/embedParams';
import { Agenda } from 'types';

type CommonProps = {
  intlMessages?: Record<string, string>;
  fallback?: any;
};
type ShowPageProps = EmbedAgendaShowProps & CommonProps;
type PageProps = ShowPageProps;

const intlCache = createIntlCache();

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  locale,
  query: queryWithParams,
  resolvedUrl,
}) => {
  const agendaUid = queryWithParams.agendaUid as string;

  const query = parseLocationQuery(resolvedUrl);

  const api = ky.create({
    prefixUrl: process.env.NEXT_API_INTERNAL_BASE_URL,
    headers: {
      Cookie: req.headers.cookie,
      Authorization: req.headers.authorization,
    },
  });

  try {
    const [intlMessages, dateFnsLocale, agenda] = await Promise.all([
      EmbedAgendaShow.fetchLocale(locale),
      getDateFnsLocale(locale),
      api(`api/agendas/${agendaUid}?detailed=1`).json<Agenda>(),
    ]);

    const googleAnalytics = agenda.settings?.tracking?.googleAnalytics;
    const matomoUrl = agenda.settings?.tracking?.matomoUrl;

    if (googleAnalytics || matomoUrl) {
      const matomoDomain = matomoUrl ? normalizeMatomoUrl(matomoUrl) : null;

      const nonce = generateNonce();
      res.setHeader('X-Nonce', nonce);
      res.setHeader(
        'Content-Security-Policy-Report-Only',
        CSP({
          props: { nonce },
          directives: {
            ...DEFAULT_DIRECTIVES,
            connectSrc: [
              ...DEFAULT_DIRECTIVES.connectSrc,
              ...matomoDomain ? [`https://${matomoDomain}`] : [],
              ...googleAnalytics
                ? [
                    'https://*.google-analytics.com',
                    'https://*.analytics.google.com',
                    'https://*.googletagmanager.com',
                    'https://*.g.doubleclick.net',
                    'https://*.google.com',
                  ]
                : [],
            ],
            imgSrc: [
              ...DEFAULT_DIRECTIVES.imgSrc,
              ...matomoDomain ? [`https://${matomoDomain}`] : [],
              ...googleAnalytics
                ? [
                    'https://*.google-analytics.com',
                    'https://*.analytics.google.com',
                    'https://*.googletagmanager.com',
                    'https://*.g.doubleclick.net',
                    'https://*.google.com',
                  ]
                : [],
            ],
          },
        }),
      );
    }

    const intl = createIntl(
      {
        locale,
        messages: intlMessages,
        defaultLocale: getSupportedLocale(locale),
        onError(e) {
          if (e.code !== 'MISSING_DATA') {
            // console.error(e);
          }
        },
      },
      intlCache,
    );

    const additionalFilters = getAdditionalFilters(agenda.schema.fields).map(
      ({ fieldSchema }) => fieldSchema.field,
    );

    const prefilter = query.initPath
      ? parseLocationQuery(query.initPath as string)
      : query;

    const requiredFilters = (prefilter.filters as string)?.split(',') ?? [];

    const filtersToInclude = ['search', 'geo', 'timings', ...additionalFilters]
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

    const filters = getFilters(intl, agenda.schema.fields, {
      dateFnsLocale,
      missingValue: 'null',
      include: filtersToInclude,
    });

    const prefilteredQuery = getPrefilteredQuery({
      query,
      prefilter,
      filters,
    });
    const timingsPrefilter =
      !prefilteredQuery.timings && prefilteredQuery.passed !== '1'
        ? {
            relative: ['current', 'upcoming'],
          }
        : null;

    const referrer = (query.host as string) || req.headers.referer || null;

    const paramsBase = omitParams({
      aggsSizeLimit: 1500,
      aggs: filtersToAggregations(filters, true),
      size: 0,
      ...timingsPrefilter,
      ...prefilter,
      cms: 'embed',
      host: referrer,
      passed: undefined, // omit passed
    });

    const params = omitParams({
      aggsSizeLimit: 1500,
      aggs: filtersToAggregations(filters, false),
      from: 0,
      sort: query.search?.length ? 'score' : 'lastTimingWithFeatured.asc',
      size: 12,
      ...timingsPrefilter,
      ...prefilteredQuery,
      cms: 'embed',
      host: referrer,
      passed: undefined, // omit passed
      includeFields,
      includeImageTimestamps: true,
    });

    const props: ShowPageProps = {
      agenda,
      intlMessages,
      preload: [
        `/api/agendas/slug/${agenda.slug}/events?${qs.stringify(paramsBase, { skipNulls: true })}`,
        `/api/agendas/slug/${agenda.slug}/events?${qs.stringify(params, { skipNulls: true })}`,
      ],
      referrer: referrer || null,
    };

    return { props };
  } catch (e) {
    console.log(e);

    return {
      props: {},
    };
  }
};

const EmbedAgendaPage: NextPageWithLayout<PageProps> = (props) => {
  const { fallback = {} } = props;

  return (
    <DateFnsLocaleProvider>
      <SWRConfig value={{ fallback }}>
        <EmbedAgendaShow {...props} />
      </SWRConfig>
    </DateFnsLocaleProvider>
  );
};

EmbedAgendaPage.Layout = EmbedLayout;

EmbedAgendaPage.theme = null;

export default EmbedAgendaPage;

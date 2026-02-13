import { GetServerSideProps } from 'next';
import { SWRConfig } from 'swr';
import qs from 'qs';
import ky from 'ky';
import { createIntlCache, createIntl } from 'react-intl';
import { getFilters, filtersToAggregations } from '@openagenda/react-filters';
import { getSupportedLocale } from '@openagenda/intl';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';
import AgendaShow, { AgendaShowProps } from 'views/AgendaShow';
import includeFields from 'views/AgendaShow/includeFields';
import AgendaError, { AgendaErrorProps } from 'views/AgendaError';
import getDateFnsLocale from 'utils/getDateFnsLocale';
import parseLocationQuery from 'utils/parseLocationQuery';
import { errorToJSON } from 'utils/errorToJSON';
import kyErrorToVError from 'utils/kyErrorToVError';
import { logError } from 'utils/sentry';
import generateNonce from 'utils/generateNonce';
import listFiltersToInclude from 'utils/listFiltersToInclude';
import CSP, { DEFAULT_DIRECTIVES } from 'utils/contentSecurityPolicy';
import { normalizeUrl as normalizeMatomoUrl } from 'utils/addMatomoTracker';
import { Agenda } from 'types';

type CommonProps = {
  intlMessages?: Record<string, string>;
  fallback?: any;
};
type ShowPageProps = AgendaShowProps & CommonProps;
type ErrorPageProps = AgendaErrorProps & CommonProps;
type PageProps = ShowPageProps | ErrorPageProps;

const intlCache = createIntlCache();

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  locale,
  query: queryWithParams,
  resolvedUrl,
}) => {
  const agendaSlug = queryWithParams.agendaSlug as string;

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
      AgendaShow.fetchLocale(locale),
      getDateFnsLocale(locale),
      api(`api/agendas/slug/${agendaSlug}?detailed=1`).json<Agenda>(),
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

    const filters = getFilters(intl, agenda.schema.fields, {
      dateFnsLocale,
      missingValue: 'null',
      include: listFiltersToInclude(agenda),
    });

    const prefilter =
      !query.timings && query.passed !== '1'
        ? {
            relative: ['current', 'upcoming'],
          }
        : null;

    const paramsBase = {
      aggsSizeLimit: 1500,
      aggs: filtersToAggregations(filters, true),
      size: 0,
      ...prefilter,
    };

    const params = {
      aggsSizeLimit: 1500,
      aggs: filtersToAggregations(filters, false),
      from: 0,
      sort: query.search?.length ? 'score' : 'lastTimingWithFeatured.asc',
      size: 10,
      ...prefilter,
      ...query,
      passed: undefined, // omit passed
      includeFields,
      includeImageTimestamps: true,
    };

    const props: ShowPageProps = {
      agenda,
      intlMessages,
      preload: [
        `/api/agendas/slug/${agenda.slug}/events?${qs.stringify(paramsBase)}`,
        `/api/agendas/slug/${agenda.slug}/events?${qs.stringify(params)}`,
      ],
    };

    return { props };
  } catch (e: any) {
    const error = await kyErrorToVError(e);

    const intlMessages = await AgendaError.fetchLocale(locale).catch(
      () => ({}),
    );

    const statusCode = error.statusCode ?? 500;
    res.statusCode = statusCode;

    const props: ErrorPageProps = {
      statusCode,
      agendaSlug,
      intlMessages,
    };

    props.error = errorToJSON(error);

    if (statusCode !== 401 && statusCode !== 403 && statusCode !== 404) {
      logError(error);
    }

    return { props };
  }
};

const AgendaPage: NextPageWithLayout<PageProps> = (props) => {
  const { fallback = {} } = props;

  if ('statusCode' in props) {
    return <AgendaError {...props} />;
  }

  return (
    <DateFnsLocaleProvider>
      <SWRConfig value={{ fallback }}>
        <AgendaShow {...props} />
      </SWRConfig>
    </DateFnsLocaleProvider>
  );
};

AgendaPage.Layout = Layout;

export default AgendaPage;

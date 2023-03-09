import { GetServerSideProps } from 'next';
import { SWRConfig } from 'swr';
import qs from 'qs';
import { useIntl, createIntlCache, createIntl } from 'react-intl';
import { getFilters, filtersToAggregations } from '@openagenda/react-filters';
import { getSupportedLocale } from '@openagenda/intl';
import VError from '@openagenda/verror';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';
import AgendaShow, { AgendaShowProps } from 'views/AgendaShow';
import AgendaError, { AgendaErrorProps } from 'views/AgendaError';
import getDateFnsLocale from 'utils/getDateFnsLocale';
import parseLocationQuery from 'utils/parseLocationQuery';
import getPreferredLocale from 'utils/getPreferredLocale';
import { isChoiceField, isAdditionalField } from 'utils/schemaFields';
import getSession from '../../utils/getSession';

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
  locale: nextLocale,
  query: queryWithParams,
  resolvedUrl,
}) => {
  const agendaSlug = queryWithParams.agendaSlug as string;
  const query = parseLocationQuery(resolvedUrl);

  const locale = getPreferredLocale(query.lang, nextLocale, getSession(req.cookies)?.user?.culture);

  try {
    const [
      intlMessages,
      dateFnsLocale,
      agenda,
    ] = await Promise.all([
      AgendaShow.fetchLocale(locale),
      getDateFnsLocale(locale),
      fetch(`${process.env.NEXT_API_INTERNAL_BASE_URL}/api/agendas/slug/${agendaSlug}?detailed=1`, {
        headers: new Headers({
          Cookie: req.headers.cookie,
          Authorization: req.headers.authorization,
        }),
      }).then(r => {
        if (r.ok) return r.json();
        throw new VError[r.status](r.statusText);
      }),
    ]);

    const intl = createIntl({
      locale,
      messages: intlMessages,
      defaultLocale: getSupportedLocale(locale),
      onError(e) {
        if (e.code !== 'MISSING_DATA') {
          // console.error(e);
        }
      },
    }, intlCache);

    const additionalFilters = agenda.schema.fields
      .filter(fieldSchema => isAdditionalField(fieldSchema) && isChoiceField(fieldSchema))
      .map(fieldSchema => fieldSchema.field);

    const filtersToInclude = ['geo', 'timings', ...additionalFilters];

    const filters = getFilters(intl, agenda.schema.fields, {
      dateFnsLocale,
      missingValue: 'null',
      include: filtersToInclude,
    });

    const prefilter = !query.timings && query.passed !== '1' ? {
      relative: ['current', 'upcoming'],
    } : null;

    const paramsBase = {
      aggsSizeLimit: 2000,
      aggs: filtersToAggregations(filters, true),
      size: 0,
      ...prefilter,
    };

    const params = {
      aggsSizeLimit: 2000,
      aggs: filtersToAggregations(filters, false),
      sort: query.search?.length ? 'score' : 'lastTimingWithFeatured.asc',
      size: 10,
      ...prefilter,
      ...query,
      passed: undefined, // omit passed
      includeFields: AgendaShow.includeFields,
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
    const intlMessages = await AgendaError.fetchLocale(locale)
      .catch(() => ({}));

    const statusCode = e.code || 500;
    res.statusCode = statusCode;

    const props: ErrorPageProps = {
      errorStatusCode: statusCode,
      agendaSlug,
      intlMessages,
    };

    if (statusCode !== 401 && statusCode !== 403 && statusCode !== 404) {
      if (process.env.NODE_ENV === 'development') {
        console.error(e);
        props.errorStack = VError.fullStack(e);
      }
    }

    return { props };
  }
};

const AgendaPage: NextPageWithLayout<PageProps> = props => {
  const intl = useIntl();
  const { fallback = {} } = props;

  if ('errorStatusCode' in props) {
    return (
      <AgendaError {...props} />
    );
  }

  return (
    <DateFnsLocaleProvider locale={intl.locale}>
      <SWRConfig value={{ fallback }}>
        <AgendaShow {...props} />
      </SWRConfig>
    </DateFnsLocaleProvider>
  );
};

AgendaPage.Layout = Layout;

export default AgendaPage;

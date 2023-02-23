import { GetServerSideProps } from 'next';
import { SWRConfig, unstable_serialize as unstableSerialize } from 'swr';
import { getFilters, getEvents } from '@openagenda/react-filters';
import { getSupportedLocale } from '@openagenda/intl';
import VError from '@openagenda/verror';
import { useIntl, createIntlCache, createIntl } from 'react-intl';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';
import AgendaShow, { AgendaShowProps } from 'views/AgendaShow';
import AgendaError, { AgendaErrorProps } from 'views/AgendaError';
import getSSRApiClient from 'utils/getSSRApiClient';
import getDateFnsLocale from 'utils/getDateFnsLocale';
import parseLocationQuery from 'utils/parseLocationQuery';
import getPreferredLocale from 'utils/getPreferredLocale';
import { isChoiceField, isAdditionalField } from 'utils/schemaFields';

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
  const api = getSSRApiClient(req);

  const agendaSlug = queryWithParams.agendaSlug as string;
  const query = parseLocationQuery(resolvedUrl);

  const locale = getPreferredLocale(nextLocale, query.lang);

  try {
    const [
      intlMessages,
      dateFnsLocale,
      { data: agenda },
    ] = await Promise.all([
      AgendaShow.fetchLocale(locale),
      getDateFnsLocale(locale),
      api.get(`/api/agendas/slug/${agendaSlug}?detailed=1`),
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

    // const filtersBase = getFiltersBase(agenda.schema.fields, { exclude: adminFilters });

    const additionalFilters = agenda.schema.fields
      .filter(fieldSchema => fieldSchema.schemaId && ['checkbox', 'radio', 'multiselect', 'boolean'].includes(fieldSchema.fieldType))
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

    const [
      filtersBaseResult,
      filtersResult,
    ] = await Promise.all([
      getEvents(
        api,
        '/api/agendas/:slug/events',
        agenda,
        filters,
        {
          ...prefilter,
          passed: undefined, // omit passed
          size: 0,
        },
        null,
        true,
      ),
      getEvents(
        api,
        '/api/agendas/:slug/events',
        agenda,
        filters,
        {
          sort: 'lastTimingWithFeatured.asc',
          ...prefilter,
          ...query,
          passed: undefined, // omit passed
          detailed: true,
        },
        // 1, // page
      ),
    ]);

    const props: ShowPageProps = {
      agenda,
      intlMessages,
      fallback: {
        [unstableSerialize(['agendaShow', 'filtersBase', agenda.slug])]: filtersBaseResult,
        [`$inf$${unstableSerialize(['agendaShow', 'events', agenda.slug, query])}`]: [filtersResult],
      },
    };

    return { props };
  } catch (e: any) {
    const intlMessages = await AgendaError.fetchLocale(locale)
      .catch(() => ({}));

    const statusCode = e?.response?.status || 500;
    res.statusCode = statusCode;

    const props: ErrorPageProps = {
      errorStatusCode: statusCode,
      agendaSlug,
      intlMessages,
    };

    if (statusCode !== 401 && statusCode !== 403 && statusCode !== 404) {
      console.error(e);
      if (process.env.NODE_ENV === 'development') {
        props.errorStack = VError.fullStack(e);
      }
    }

    return { props };
  }
<<<<<<< HEAD
=======

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

  const [
    filtersBaseResult,
    filtersResult,
  ] = await Promise.all([
    getEvents(
      api,
      '/api/agendas/:slug/events',
      agenda,
      filters,
      {
        ...prefilter,
        size: 0,
      },
      null,
      true,
    ),
    getEvents(
      api,
      '/api/agendas/:slug/events',
      agenda,
      filters,
      {
        sort: (query.search ?? '').length ? 'score' : 'lastTimingWithFeatured.asc',
        ...prefilter,
        ...query,
        passed: undefined, // omit passed
        includeFields: [
          'uid',
          'slug',
          'title',
          'image',
          'featured',
          'description',
          'dateRange',
          'location.name',
          'location.city',
          'timings',
          'onlineAccessLink',
        ],
        detailed: true,
      },
      // 1, // page
    ),
  ]);

  const props: PageProps = {
    agenda,
    intlMessages,
    fallback: {
      [unstableSerialize(['agendaShow', 'filtersBase', agenda.slug])]: filtersBaseResult,
      [`$inf$${unstableSerialize(['agendaShow', 'events', agenda.slug, query])}`]: [filtersResult],
    },
  };

  return { props };
>>>>>>> 8c51214dccfc4fee24a35b31f5f65d8af5133481
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

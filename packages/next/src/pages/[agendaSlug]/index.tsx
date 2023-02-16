import { GetServerSideProps } from 'next';
import { SWRConfig, unstable_serialize as unstableSerialize } from 'swr';
import { getFilters, getEvents } from '@openagenda/react-filters';
import { getSupportedLocale } from '@openagenda/intl';
import { useIntl, createIntlCache, createIntl } from 'react-intl';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';
import AgendaShow, { AgendaShowProps } from 'views/AgendaShow';
import getSSRApiClient from 'utils/getSSRApiClient';
import getDateFnsLocale from 'utils/getDateFnsLocale';
import parseLocationQuery from 'utils/parseLocationQuery';
import getPreferredLocale from 'utils/getPreferredLocale';

type PageProps = AgendaShowProps & {
  intlMessages: Record<string, string>,
  fallback?: any,
};

const intlCache = createIntlCache();

export const getServerSideProps: GetServerSideProps = async ({
  req,
  locale: nextLocale,
  query: queryWithParams,
  resolvedUrl,
}) => {
  const api = getSSRApiClient(req);

  const { agendaSlug } = queryWithParams;
  const query = parseLocationQuery(resolvedUrl);

  const locale = getPreferredLocale(nextLocale, query.lang);

  let agenda;
  let intlMessages;
  let dateFnsLocale;

  try {
    [
      { data: agenda },
      intlMessages,
      dateFnsLocale,
    ] = await Promise.all([
      api.get(`/api/agendas/slug/${agendaSlug}?detailed=1`),
      AgendaShow.fetchLocale(locale),
      getDateFnsLocale(locale),
    ]);
  } catch (e: any) {
    if (e.response.status === 401 || e.response.status === 403 || e.response.status === 404) {
      return { notFound: true };
    }

    throw e;

    // TODO better error handling
    // https://ironeko.com/posts/how-to-return-a-404-error-in-getserversideprops-with-next-js
    // https://github.com/vercel/next.js/discussions/12652

    // res.statusCode = 404;
    // return {
    //   props: {},
    // };
  }

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

  const props: PageProps = {
    agenda,
    intlMessages,
    fallback: {
      [unstableSerialize(['agendaShow', 'filtersBase', agenda.slug])]: filtersBaseResult,
      [`$inf$${unstableSerialize(['agendaShow', 'events', agenda.slug, query])}`]: [filtersResult],
    },
  };

  return { props };
};

const AgendaPage: NextPageWithLayout<PageProps> = props => {
  const intl = useIntl();
  const { fallback = {} } = props;

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

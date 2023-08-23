import { GetServerSideProps } from 'next';
import VError from '@openagenda/verror';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';
import EventShow, { EventShowProps } from 'views/EventShow';
import EventError, { EventErrorProps } from 'views/EventError';
import parseLocationQuery from 'utils/parseLocationQuery';
import getPreferredLocale from 'utils/getPreferredLocale';
import getSession from 'utils/getSession';
import { errorToJSON } from 'utils/errorToJSON';
import { logError } from 'utils/sentry';

type CommonProps = {
  intlMessages?: Record<string, string>;
  fallback?: any;
};

type ShowPageProps = EventShowProps & CommonProps;
type ErrorPageProps = EventErrorProps & CommonProps;
type PageProps = ShowPageProps | ErrorPageProps;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  locale: nextLocale,
  query: queryWithParams,
  // params,
  resolvedUrl,
}) => {
  const agendaSlug = queryWithParams.agendaSlug as string;
  const eventSlug = queryWithParams.eventSlug as string;

  // console.log({ params, queryWithParams });

  const query = parseLocationQuery(resolvedUrl);
  const locale = getPreferredLocale(query.lang, nextLocale, getSession(req.cookies)?.user?.culture);

  try {
    const [
      intlMessages,
      agenda,
      { event },
    ] = await Promise.all([
      EventShow.fetchLocale(locale),
      fetch(`${process.env.NEXT_API_INTERNAL_BASE_URL}/api/agendas/slug/${agendaSlug}?detailed=1`)
        .then(r => {
          if (r.ok) return r.json();
          throw new VError[r.status](r.statusText);
        }),
      fetch(`${process.env.NEXT_API_INTERNAL_BASE_URL}/api/agendas/slug/${agendaSlug}/events/slug/${eventSlug}?longDescriptionFormat=HTMLWithEmbeds`)
        .then(r => {
          if (r.ok) return r.json();
          throw new VError[r.status](r.statusText);
        }),
    ]);

    const props: PageProps = {
      intlMessages,
      agenda,
      event,
    };

    return { props };
  } catch (e: any) {
    const intlMessages = await EventError.fetchLocale(locale)
      .catch(() => ({}));

    const statusCode = Number.isInteger(e.code) ? e.code : 500;
    res.statusCode = statusCode;

    const props: ErrorPageProps = {
      statusCode,
      agendaSlug,
      eventSlug,
      intlMessages,
    };

    props.error = errorToJSON(e);

    if (statusCode !== 401 && statusCode !== 403 && statusCode !== 404) {
      logError(e);
    }

    return { props };
  }
};

// export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
//   try {
//     const [
//       agendaResult,
//       eventResult,
//       intlMessagesResult,
//     ] = await Promise.allSettled([
//       fetch(`${process.env.NEXT_API_INTERNAL_BASE_URL}/api/agendas/slug/${params.agendaSlug}`)
//         .then(r => {
//           if (r.ok) return r.json();
//           throw new VError[r.status](r.statusText);
//         }),
//       fetch(`${process.env.NEXT_API_INTERNAL_BASE_URL}/api/agendas/slug/${params.agendaSlug}/events/slug/${params.eventSlug}?longDescriptionFormat=HTMLWithEmbeds`)
//         .then(r => {
//           if (r.ok) return r.json();
//           throw new VError[r.status](r.statusText);
//         }),
//       EventShow.fetchLocale(locale),
//     ]);
//
//     if (agendaResult.status === '') {
//     }
//
//     const props: PageProps = { agenda, event, intlMessages };
//
//     return {
//       props,
//       revalidate: 10,
//     };
//   } catch (e: any) {
//     console.log(e);
//
//     if (e.statusCode === 401 || e.statusCode === 403) {
//       console.log('FALLBACK');
//     }
//
//     return {
//       props: {},
//       revalidate: 10,
//     };
//
//     return {
//       notFound: true,
//     };
//   }
// };
//
// export const getStaticPaths = () => ({
//   paths: [],
//   fallback: 'blocking',
// });

const EventPage: NextPageWithLayout<PageProps> = props => {
  if ('statusCode' in props) {
    return (
      <EventError {...props} />
    );
  }

  return (
    <DateFnsLocaleProvider>
      <EventShow {...props} />
    </DateFnsLocaleProvider>
  );
};

EventPage.Layout = Layout;

export default EventPage;

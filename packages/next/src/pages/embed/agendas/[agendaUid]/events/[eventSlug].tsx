import { GetServerSideProps } from 'next';
import ky from 'ky';
import { SWRConfig } from 'swr';
import qs from 'qs';
import { NextPageWithLayout } from 'pages/_app';
import EmbedEventShow, { EmbedEventShowProps } from 'views/EmbedEventShow';
import EmbedEventError, { EmbedEventErrorProps } from 'views/EmbedEventError';
import { AgendaProvider } from 'views/EventShow/contexts/agenda';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';
import EmbedLayout from 'components/EmbedLayout';
import { errorToJSON } from 'utils/errorToJSON';
import kyErrorToVError from '@/src/utils/kyErrorToVError';
import { logError } from 'utils/sentry';
import { Agenda } from 'types';

type CommonProps = {
  intlMessages?: Record<string, string>;
  fallback?: any;
};

type ShowPageProps = EmbedEventShowProps &
  CommonProps & {
    agenda: Agenda;
  };
type ErrorPageProps = EmbedEventErrorProps & CommonProps;
type PageProps = ShowPageProps | ErrorPageProps;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  locale,
  query: queryWithParams,
}) => {
  const agendaUid = queryWithParams.agendaUid as string;
  const eventSlug = queryWithParams.eventSlug as string;

  const referrer =
    (queryWithParams.host as string) || req.headers.referer || null;

  // const eventUrl = `api/agendas/${agendaUid}/events/slug/${eventSlug}`;
  const eventUrl = `api/agendas/${agendaUid}/events/slug/${eventSlug}?${qs.stringify(
    {
      longDescriptionFormat: 'HTMLWithEmbeds',
      cms: 'embed',
      host: referrer,
    },
  )}`;

  let agenda = null;

  const api = ky.create({
    prefixUrl: process.env.NEXT_API_INTERNAL_BASE_URL,
    headers: {
      Cookie: req.headers.cookie,
      Authorization: req.headers.authorization,
    },
  });

  try {
    const results = await Promise.allSettled([
      EmbedEventShow.fetchLocale(locale),
      api(
        `api/agendas/${agendaUid}?detailed=1&includeMemberSchema=1`,
      ).json<Agenda>(),
      api(eventUrl).json<any>(),
    ]);

    if (results[0].status === 'rejected') throw results[0].reason;
    const intlMessages = results[0].value;

    if (results[1].status === 'rejected') throw results[1].reason;
    agenda = results[1].value;

    if (results[2].status === 'rejected') throw results[2].reason;
    const eventResponse = results[2].value;

    const props: PageProps = {
      intlMessages,
      agenda,
      preload: [],
      fallback: {
        [`/${eventUrl}`]: eventResponse,
      },
      referrer,
    };

    return { props };
  } catch (e: any) {
    const error = await kyErrorToVError(e);

    const intlMessages = await EmbedEventError.fetchLocale(locale).catch(
      () => ({}),
    );

    const statusCode = error.statusCode ?? 500;
    res.statusCode = statusCode;

    const props: ErrorPageProps = {
      statusCode,
      intlMessages,
    };

    props.error = errorToJSON(error);

    if (statusCode !== 401 && statusCode !== 403 && statusCode !== 404) {
      logError(error);
    }

    return { props };
  }
};

const EmbedEventPage: NextPageWithLayout<PageProps> = (props) => {
  const { fallback = {} } = props;

  if ('statusCode' in props) {
    return <EmbedEventError {...props} />;
  }

  const { agenda } = props;

  return (
    <DateFnsLocaleProvider>
      <SWRConfig value={{ fallback }}>
        <AgendaProvider agenda={agenda}>
          <EmbedEventShow {...props} />
        </AgendaProvider>
      </SWRConfig>
    </DateFnsLocaleProvider>
  );
};

EmbedEventPage.Layout = EmbedLayout;

EmbedEventPage.theme = null;

export default EmbedEventPage;

import { GetServerSideProps } from 'next';
import { SWRConfig } from 'swr';
import ky from 'ky';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';
import EventShow, { EventShowProps } from 'views/EventShow';
import EventError, { EventErrorProps } from 'views/EventError';
import { AgendaProvider } from 'views/EventShow/contexts/agenda';
import type { Agenda } from 'types';
import { errorToJSON } from 'utils/errorToJSON';
import kyErrorToVError from 'utils/kyErrorToVError';
import { logError } from 'utils/sentry';
import { normalizeUrl as normalizeMatomoUrl } from 'utils/addMatomoTracker';
import generateNonce from 'utils/generateNonce';
import CSP, { DEFAULT_DIRECTIVES } from 'utils/contentSecurityPolicy';

type CommonProps = {
  intlMessages?: Record<string, string>;
  fallback?: any;
};

type ShowPageProps = EventShowProps &
  CommonProps & {
    agenda: Agenda;
  };
type ErrorPageProps = EventErrorProps &
  CommonProps & {
    agenda?: Agenda;
  };
type PageProps = ShowPageProps | ErrorPageProps;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  locale,
  query: queryWithParams,
  // params,
}) => {
  const agendaSlug = queryWithParams.agendaSlug as string;
  const eventSlug = queryWithParams.eventSlug as string;

  const api = ky.create({
    prefixUrl: process.env.NEXT_API_INTERNAL_BASE_URL,
    headers: {
      Cookie: req.headers.cookie,
      Authorization: req.headers.authorization,
    },
  });

  const eventUrl = `api/agendas/slug/${agendaSlug}/events/slug/${eventSlug}?longDescriptionFormat=HTMLWithEmbeds`;

  let agenda = null;

  try {
    const results = await Promise.allSettled([
      EventShow.fetchLocale(locale),
      api(
        `api/agendas/slug/${agendaSlug}?detailed=1&includeMemberSchema=1`,
      ).json<any>(),
      api(eventUrl).json<any>(),
    ]);

    if (results[0].status === 'rejected') throw results[0].reason;
    const intlMessages = results[0].value;

    if (results[1].status === 'rejected') throw results[1].reason;
    agenda = results[1].value;

    if (results[2].status === 'rejected') throw results[2].reason;
    const eventResponse = results[2].value;

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

    const { event } = eventResponse;

    const props: PageProps = {
      intlMessages,
      agenda,
      // event,
      preload: [
        `/api/me/agendas/${agenda.uid}/events/${event.uid}`,
        `/api/agendas/${agenda.uid}/events/${event.uid}/references`,
      ],
      fallback: {
        [`/${eventUrl}`]: eventResponse,
      },
    };

    return { props };
  } catch (e: any) {
    const error = await kyErrorToVError(e);

    const intlMessages = await EventError.fetchLocale(locale).catch(() => ({}));

    const statusCode = error.statusCode ?? 500;
    res.statusCode = statusCode;

    const props: ErrorPageProps = {
      statusCode,
      agendaSlug,
      eventSlug,
      intlMessages,
      agenda,
    };

    props.error = errorToJSON(error);

    if (statusCode !== 401 && statusCode !== 403 && statusCode !== 404) {
      logError(error);
    }

    return { props };
  }
};

const EventPage: NextPageWithLayout<PageProps> = (props) => {
  const { fallback = {}, agenda } = props;

  if ('statusCode' in props) {
    return (
      <AgendaProvider agenda={agenda}>
        <EventError {...props} />
      </AgendaProvider>
    );
  }

  return (
    <DateFnsLocaleProvider>
      <SWRConfig value={{ fallback }}>
        <AgendaProvider agenda={agenda}>
          <EventShow {...props} />
        </AgendaProvider>
      </SWRConfig>
    </DateFnsLocaleProvider>
  );
};

EventPage.Layout = Layout;

export default EventPage;

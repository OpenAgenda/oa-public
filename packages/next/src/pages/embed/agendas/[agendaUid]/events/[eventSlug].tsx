import { GetServerSideProps } from 'next';
import ky from 'ky';
import { SWRConfig } from 'swr';
import { extendTheme, theme as defaultTheme } from '@openagenda/uikit';
import { NextPageWithLayout } from 'pages/_app';
import EmbedEventShow, { EmbedEventShowProps } from 'views/EmbedEventShow';
import { AgendaProvider } from 'views/EventShow/contexts/agenda';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';
import EmbedLayout from 'components/EmbedLayout';
import { Agenda } from 'types';

type CommonProps = {
  intlMessages?: Record<string, string>;
  fallback?: any;
};

type ShowPageProps = EmbedEventShowProps &
  CommonProps & {
    agenda: Agenda;
  };
type PageProps = ShowPageProps;

const theme = extendTheme(defaultTheme, {
  styles: {
    global: {
      body: {
        bg: null,
      },
    },
  },
});

export const getServerSideProps: GetServerSideProps = async ({
  req,
  locale,
  query: queryWithParams,
}) => {
  const agendaUid = queryWithParams.agendaUid as string;
  const eventSlug = queryWithParams.eventSlug as string;

  const eventUrl = `api/agendas/${agendaUid}/events/slug/${eventSlug}?longDescriptionFormat=HTMLWithEmbeds`;

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
    };

    return { props };
  } catch (e: any) {
    return {
      props: {},
    };
  }
};

const EmbedEventPage: NextPageWithLayout<PageProps> = (props) => {
  const { fallback = {}, agenda } = props;

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

EmbedEventPage.theme = theme;

export default EmbedEventPage;

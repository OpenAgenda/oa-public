import getConfig from 'next/config';
import { GetStaticProps } from 'next';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';
import EventShow, { EventShowProps } from 'views/EventShow';

type PageProps = EventShowProps & {
  intlMessages: {
    [key: string]: string
  }
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const {
    serverRuntimeConfig: { api },
  } = getConfig();

  const [
    { data: agenda },
    { data: { event } },
    intlMessages,
  ] = await Promise.all([
    api(null, 'get', `/api/agendas/slug/${params.agendaSlug}`),
    api(null, 'get', `/api/agendas/slug/${params.agendaSlug}/events/slug/${params.eventSlug}`),
    EventShow.fetchLocale(locale),
  ]);

  const props: PageProps = { agenda, event, intlMessages };

  return {
    props,
    revalidate: 10,
  };
};

export const getStaticPaths = () => ({
  paths: [],
  fallback: 'blocking',
});

const Event: NextPageWithLayout<PageProps> = EventShow;

Event.Layout = Layout;

export default Event;

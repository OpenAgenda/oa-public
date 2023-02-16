import { GetStaticProps } from 'next';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';
import EventShow, { EventShowProps } from 'views/EventShow';
import getSSRApiClient from 'utils/getSSRApiClient';

type PageProps = EventShowProps & {
  intlMessages: Record<string, string>
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const api = getSSRApiClient();

  const [
    { data: agenda },
    { data: { event } },
    intlMessages,
  ] = await Promise.all([
    api.get(`/api/agendas/slug/${params.agendaSlug}`),
    api.get(`/api/agendas/slug/${params.agendaSlug}/events/slug/${params.eventSlug}`),
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

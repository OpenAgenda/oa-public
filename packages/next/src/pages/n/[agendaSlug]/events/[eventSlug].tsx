import { GetStaticProps } from 'next';
import VError from '@openagenda/verror';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';
import EventShow, { EventShowProps } from 'views/EventShow';

type PageProps = EventShowProps & {
  intlMessages: Record<string, string>
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const [
    agenda,
    event,
    intlMessages,
  ] = await Promise.all([
    fetch(`${process.env.NEXT_API_INTERNAL_BASE_URL}/api/agendas/slug/${params.agendaSlug}`)
      .then(r => {
        if (r.ok) return r.json();
        throw new VError[r.status](r.statusText);
      }),
    fetch(`${process.env.NEXT_API_INTERNAL_BASE_URL}/api/agendas/slug/${params.agendaSlug}/events/slug/${params.eventSlug}`)
      .then(r => {
        if (r.ok) return r.json();
        throw new VError[r.status](r.statusText);
      }),
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

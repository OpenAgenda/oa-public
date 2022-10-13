import getConfig from 'next/config';
import { GetServerSideProps } from 'next';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';

const flatten = (value = {}, preferredLang = 'fr') => value[preferredLang] ?? value[Object.keys(value).shift()];

export const getServerSideProps: GetServerSideProps = async ({ query, req }) => {
  const {
    serverRuntimeConfig: { api },
  } = getConfig();

  const [{ data: agenda }, { data: { event } }] = await Promise.all([
    api(req, 'get', `/api/agendas/slug/${query.agendaSlug}`),
    api(req, 'get', `/api/agendas/slug/${query.agendaSlug}/events/slug/${query.eventSlug}`),
  ]);

  return {
    props: {
      agenda,
      event,
    },
  };
};

type PageProps = {
  agenda: {
    title: string
  };
  event: {
    title: Record<string, string>
  };
};

const Event: NextPageWithLayout<PageProps> = ({ agenda, event }) => (
  <div>
    <h1>Une autre page NextJs</h1>
    <h2>L&apos;événement: {flatten(event.title)}</h2>
    <h3>L&apos;agenda: {agenda.title}</h3>
  </div>
);

Event.Layout = Layout;

export default Event;

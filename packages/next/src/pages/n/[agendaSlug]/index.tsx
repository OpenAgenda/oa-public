import Link from 'next/link';
import getConfig from 'next/config';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';

type Props = {
  agenda: {
    title: string
  },
  events: any,
  user?: any
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const {
    serverRuntimeConfig: { api },
  } = getConfig();

  const [{ data: agenda }, { data: events }] = await Promise.all([
    api(null, 'get', `/api/agendas/slug/${params.agendaSlug}`),
    api(null, 'get', `/api/agendas/slug/${params.agendaSlug}/events`),
  ]);

  const props: Props = { agenda, events };

  return {
    props,
    revalidate: 10,
  };
};

export const getStaticPaths = () => ({
  paths: [],
  fallback: 'blocking',
});

const AgendaPage: NextPageWithLayout<InferGetStaticPropsType<typeof getStaticProps>> = ({ agenda, events }) => (
  <div>
    <h1>Une page NextJs - {agenda.title}</h1>
    <Link href="/n/bordeaux-metropole/events/visite-des-arbres-remarquables-du-parc-de-bourran">
      Go to event
    </Link>
    <pre>
      <code>{JSON.stringify(agenda, null, 2)}</code>
    </pre>
    <pre>
      <code>{JSON.stringify(events, null, 2)}</code>
    </pre>
  </div>
);

AgendaPage.Layout = Layout;

export default AgendaPage;

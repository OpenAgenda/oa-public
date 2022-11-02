import getConfig from 'next/config';
import { GetStaticProps } from 'next';
import { NextPageWithLayout } from 'pages/_app';
import Layout from 'components/Layout';
import AgendaShow, { AgendaShowProps } from 'views/AgendaShow';

type PageProps = AgendaShowProps & {
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
    { data: events },
    intlMessages,
  ] = await Promise.all([
    api(null, 'get', `/api/agendas/slug/${params.agendaSlug}`),
    api(null, 'get', `/api/agendas/slug/${params.agendaSlug}/events`),
    AgendaShow.fetchLocale(locale),
  ]);

  const props: PageProps = { agenda, events, intlMessages };

  return {
    props,
    revalidate: 10,
  };
};

export const getStaticPaths = () => ({
  paths: [],
  fallback: 'blocking',
});

const AgendaPage: NextPageWithLayout<PageProps> = AgendaShow;

AgendaPage.Layout = Layout;

export default AgendaPage;

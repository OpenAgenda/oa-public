import { Fragment } from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Providers from 'Providers';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  // Layout?: (props: { children: ReactNode }) => ReactElement<typeof props>
  Layout?: React.FC<{ children: React.ReactNode }>
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
  intlMessages: {
    [key:string]: string
  }
}

function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const Layout = Component.Layout || Fragment;

  const { intlMessages } = pageProps;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1, viewport-fit=cover"
        />
        <meta
          name="description"
          content="Communicate efficiently on your events"
        />
        <meta
          name="keywords"
          content="openagenda, agendas, events, opendata, open data, network, networked"
        />
        <meta name="theme-color" content="#41ACDD" />
        <title>OpenAgenda</title>
      </Head>
      <Providers intlMessages={intlMessages}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Providers>
    </>
  );
}

export default App;

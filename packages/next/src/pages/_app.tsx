import { Fragment } from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { Cookies } from 'react-cookie';
import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';
import Providers from 'Providers';
import '@fortawesome/fontawesome-svg-core/styles.css';

fontAwesomeConfig.autoAddCss = false;

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  // Layout?: (props: { children: ReactNode }) => ReactElement<typeof props>
  Layout?: React.FC<{ children: React.ReactNode }>
  universalCookies?: Cookies
}

type AppPropsWithLayout<P = {}> = AppProps<P> & {
  Component: NextPageWithLayout<P>
}

interface PageProps {
  intlMessages: Record<string, string>
}

function MyApp({ Component, pageProps, router }: AppPropsWithLayout<PageProps>) {
  // Use the layout defined at the page level, if available
  const Layout = Component.Layout || Fragment;
  const universalCookies = Component.universalCookies || new Cookies();

  const { locale } = router;
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
      <Providers locale={locale} intlMessages={intlMessages} cookies={universalCookies}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Providers>
    </>
  );
}

export default MyApp;

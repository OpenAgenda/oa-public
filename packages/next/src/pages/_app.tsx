import { Fragment, useEffect } from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { Cookies } from 'react-cookie';
import Providers from 'Providers';
import getPreferredLocale from '../utils/getPreferredLocale';

import '@fortawesome/fontawesome-svg-core/styles.css';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  // Layout?: (props: { children: ReactNode }) => ReactElement<typeof props>
  Layout?: React.FC<{ children: React.ReactNode }>
}

type AppPropsWithLayout<P = {}> = AppProps<P> & {
  Component: NextPageWithLayout<P>
  universalCookies?: Cookies
}

interface PageProps {
  intlMessages: Record<string, string>
}

const useForceHtmlLangAttribute = preferredLocale => {
  useEffect(() => {
    document.documentElement.lang = preferredLocale;

    const langObserver = new MutationObserver(() => {
      if (document.documentElement.lang !== preferredLocale) {
        document.documentElement.lang = preferredLocale;
      }
    });
    langObserver.observe(document.documentElement, {
      attributeFilter: ['lang'],
    });

    return () => {
      langObserver.disconnect();
    };
  }, [preferredLocale]);
};

function MyApp({ Component, pageProps, router, universalCookies }: AppPropsWithLayout<PageProps>) {
  // Use the layout defined at the page level, if available
  const Layout = Component.Layout || Fragment;

  const { intlMessages } = pageProps;

  const locale = getPreferredLocale(router.locale, router.query.lang);

  useForceHtmlLangAttribute(locale);

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

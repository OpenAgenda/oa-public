import '../polyfills';

import { Fragment } from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { Cookies } from 'react-cookie';
import { getLocaleValue } from '@openagenda/intl';
import { EmotionCache } from '@openagenda/uikit';
import Providers from 'Providers';
import SentryErrorBoundary from 'components/SentryErrorBoundary';
import useMatomoTracker from 'hooks/useMatomoTracker';
import * as metas from 'config/metas';

import '@fortawesome/fontawesome-svg-core/styles.css';

interface PageProps {
  intlMessages: Record<string, string>;
}

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  // Layout?: (props: { children: ReactNode }) => ReactElement<typeof props>
  Layout?: React.FC<{ children: React.ReactNode; emotionCache?: EmotionCache }>;
  theme?: Record<string, any>;
};

type AppPropsWithLayout<P = {}> = AppProps<P> & {
  Component: NextPageWithLayout<P>;
  universalCookies?: Cookies;
  cache?: EmotionCache;
};

function MyApp({
  Component,
  pageProps,
  router,
  universalCookies,
  cache,
}: AppPropsWithLayout<PageProps>) {
  // Use the layout defined at the page level, if available
  const Layout = Component.Layout || Fragment;
  const { theme } = Component;

  const { intlMessages } = pageProps;

  useMatomoTracker();

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1, viewport-fit=cover"
        />
        <meta
          name="description"
          content={getLocaleValue(metas.description, router.locale)}
        />
        <meta
          name="keywords"
          content={getLocaleValue(metas.keywords, router.locale)}
        />
        <meta name="theme-color" content="#41ACDD" />
        <title>OpenAgenda</title>
      </Head>
      <Providers
        locale={router.locale}
        intlMessages={intlMessages}
        theme={theme}
        cache={cache}
        cookies={universalCookies}
      >
        <SentryErrorBoundary>
          <Layout emotionCache={cache}>
            <SentryErrorBoundary>
              <Component {...pageProps} />
            </SentryErrorBoundary>
          </Layout>
        </SentryErrorBoundary>
      </Providers>
    </>
  );
}

export default MyApp;

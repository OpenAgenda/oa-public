import '../polyfills';

import { Fragment } from 'react';
import { NextPage } from 'next';
import App, { AppProps, AppContext } from 'next/app';
import Head from 'next/head';
import { Cookies as UniversalCookies } from 'react-cookie';
import Cookies from 'cookies';
import { trace } from '@opentelemetry/api';
import { getLocaleValue } from '@openagenda/intl';
import { EmotionCache } from '@openagenda/uikit';
import Providers from 'Providers';
import SentryErrorBoundary from 'components/SentryErrorBoundary';
import useMatomoTracker from 'hooks/useMatomoTracker';
import useMatomoPageTracker from 'hooks/useMatomoPageTracker';
import base64 from 'utils/base64';
import * as metas from 'config/metas';

import '@fortawesome/fontawesome-svg-core/styles.css';

// Because of packages from monorepo are detected
// as first-party by turbopack from Next 16
// See more: https://nextjs.org/docs/messages/css-global
import '@openagenda/react-shared/css/react-date-range.css';

const logRequest =
  typeof window === 'undefined'
    ? await import('utils/logRequest').then((mod) => mod.default)
    : null;

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
  universalCookies?: UniversalCookies;
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
  const layoutProps = Component.Layout ? { emotionCache: cache } : null;
  const { theme } = Component;

  const { intlMessages } = pageProps;

  useMatomoTracker();
  useMatomoPageTracker({
    debug: process.env.NODE_ENV === 'development',
  });

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
        <meta name="theme-color" content="#1D77CE" />
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
          <Layout {...layoutProps}>
            <SentryErrorBoundary>
              <Component {...pageProps} />
            </SentryErrorBoundary>
          </Layout>
        </SentryErrorBoundary>
      </Providers>
    </>
  );
}

MyApp.getInitialProps = async (context: AppContext) => {
  const { req, res } = context.ctx;

  if (req) {
    const span = trace.getActiveSpan();

    const cookies = new Cookies(req, res, {
      keys: process.env.NEXT_SESSION_KEYS?.split(','),
    });

    const cookie = cookies.get('oa', { signed: true });
    let session;
    try {
      session = cookie ? JSON.parse(base64.decode(cookie)) : null;
    } catch {
      session = null;
    }

    req.otelAttributes = req.otelAttributes ?? {};

    span?.setAttribute('session.id', session?.sessionId);
    req.otelAttributes['session.id'] = session?.sessionId;

    if (session?.user?.uid) {
      span?.setAttribute('user.uid', session.user.uid);
      req.otelAttributes['user.uid'] = session.user.uid;
    }

    if (typeof logRequest === 'function') {
      logRequest(req, res, () => {});
    }
  }

  const ctx = await App.getInitialProps(context);
  return ctx;
};

export default MyApp;

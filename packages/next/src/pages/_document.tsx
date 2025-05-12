import { useState } from 'react';
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
  DocumentProps,
} from 'next/document';
import { useServerInsertedHTML } from 'next/navigation';
import { Cookies } from 'react-cookie';
import { ResponseCookies } from '@edge-runtime/cookies';
import { createCache, CacheProvider } from '@openagenda/uikit';
import generateNonce from 'utils/generateNonce';
import CSP from 'utils/contentSecurityPolicy';

type CustomDocumentProps = {
  outdatedBrowser?: boolean;
  nonce: string;
};
type MyDocumentProps = DocumentProps & CustomDocumentProps;
type MyDocumentInitialProps = DocumentInitialProps & CustomDocumentProps;

function RootStyleRegistry({ children }: { children: JSX.Element }) {
  const [cache] = useState(() => {
    // Key `css` is needed because of a bug with turbopack and chakra
    const emotionCache = createCache({ key: 'css' });
    emotionCache.compat = true;
    return emotionCache;
  });

  useServerInsertedHTML(() => (
    <style
      data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
      dangerouslySetInnerHTML={{
        __html: Object.values(cache.inserted).join(' '),
      }}
    />
  ));

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

function wrapApp({ cookies }) {
  return (App) => {
    const Wrapped = (props) => (
      <RootStyleRegistry>
        <App universalCookies={cookies} {...props} />
      </RootStyleRegistry>
    );
    return Wrapped;
  };
}

function OutdatedStyle({ nonce }) {
  return (
    <link rel="stylesheet" href="/css/outdated-browser.css" nonce={nonce} />
  );
}

function OutdatedScript({ nonce, locale }) {
  return (
    <>
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `window.outdatedBrowserOptions = ${JSON.stringify({ locale })};`,
        }}
        nonce={nonce}
      />
      <script src="/js/outdated-browser.js" defer nonce={nonce} />
    </>
  );
}

function MyDocument({ locale, outdatedBrowser, nonce }: MyDocumentProps) {
  return (
    <Html lang={locale} style={{ colorScheme: 'light' }} data-theme="light">
      <Head nonce={nonce}>
        {process.env.NEXT_PUBLIC_ASSET_PREFIX ? (
          <>
            <link
              rel="preconnect"
              href={new URL(process.env.NEXT_PUBLIC_ASSET_PREFIX).origin}
              crossOrigin=""
            />
            <link
              rel="dns-prefetch"
              href={new URL(process.env.NEXT_PUBLIC_ASSET_PREFIX).origin}
            />
          </>
        ) : null}
        {process.env.NEXT_PUBLIC_IMAGE_PREFIX ? (
          <>
            <link
              rel="preconnect"
              href={new URL(process.env.NEXT_PUBLIC_IMAGE_PREFIX).origin}
              crossOrigin=""
            />
            <link
              rel="dns-prefetch"
              href={new URL(process.env.NEXT_PUBLIC_IMAGE_PREFIX).origin}
            />
          </>
        ) : null}
        {outdatedBrowser ? <OutdatedStyle nonce={nonce} /> : null}
      </Head>
      <body className="chakra-ui-light">
        <div id="outdated" />
        <Main />
        <NextScript nonce={nonce} />
        {outdatedBrowser ? (
          <OutdatedScript locale={locale} nonce={nonce} />
        ) : null}
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (
  ctx: DocumentContext,
): Promise<MyDocumentInitialProps> => {
  const originalRenderPage = ctx.renderPage;

  const cookies = new Cookies(ctx.req?.headers?.cookie);
  const responseHeaders = new Headers(ctx.res?.getHeaders?.() as HeadersInit);
  const responseCookies = new ResponseCookies(responseHeaders);

  const outdatedBrowser =
    responseCookies.get('outdatedBrowser')?.value === 'true' ||
    cookies.get('outdatedBrowser') === true;

  // CSP
  let nonce = responseHeaders.get('X-Nonce');
  if (!nonce) {
    nonce = generateNonce();
    ctx.res?.setHeader(
      'Content-Security-Policy-Report-Only',
      CSP({ props: { nonce } }),
    );
  }

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: wrapApp({ cookies }) as any,
    });

  const initialProps = await Document.getInitialProps(ctx);

  return {
    ...initialProps,
    outdatedBrowser,
    nonce,
  };
};

export default MyDocument;

import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
  DocumentProps,
} from 'next/document';
import { Cookies } from 'react-cookie';
import { ResponseCookies } from '@edge-runtime/cookies';
import createEmotionServer from '@emotion/server/create-instance';
import { cache } from '@openagenda/uikit';
import getSession from 'utils/getSession';
import getPreferredLocale from 'utils/getPreferredLocale';

type CustomDocumentProps = {
  sessionLocale?: string
  outdatedBrowser?: boolean
}
type MyDocumentProps = DocumentProps & CustomDocumentProps
type MyDocumentInitialProps = DocumentInitialProps & CustomDocumentProps

const { extractCriticalToChunks } = createEmotionServer(cache);

function wrapWithCookies(cookies) {
  return App => {
    const Wrapped = props => (
      <App universalCookies={cookies} {...props} />
    );
    return Wrapped;
  };
}

function OutdatedStyle({ assetPrefix }) {
  return (
    <link rel="stylesheet" href={`${assetPrefix}/_next/static/css/outdated-browser.css`} />
  );
}

function OutdatedScript({ assetPrefix, locale }) {
  return (
    <>
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `window.outdatedBrowserOptions = ${JSON.stringify({ locale })};`,
        }}
      />
      <script src={`${assetPrefix}/_next/static/chunks/outdated-browser.js`} defer />
    </>
  );
}

function MyDocument({
  locale,
  __NEXT_DATA__,
  assetPrefix,
  sessionLocale,
  outdatedBrowser,
}: MyDocumentProps) {
  const preferredLocale = getPreferredLocale(
    __NEXT_DATA__.query.lang,
    locale,
    sessionLocale,
  );

  return (
    <Html
      lang={preferredLocale}
      style={{ colorScheme: 'light' }}
      data-theme="light"
    >
      <Head>
        {process.env.NEXT_PUBLIC_ASSET_PREFIX ? (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_ASSET_PREFIX} crossOrigin="" />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_ASSET_PREFIX} />
          </>
        ) : null}
        {process.env.NEXT_PUBLIC_IMAGE_PREFIX ? (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_IMAGE_PREFIX} crossOrigin="" />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_IMAGE_PREFIX} />
          </>
        ) : null}
        {outdatedBrowser ? (
          <OutdatedStyle assetPrefix={assetPrefix} />
        ) : null}
      </Head>
      <body className="chakra-ui-light">
        <div id="outdated" />
        <Main />
        <NextScript />
        {outdatedBrowser ? (
          <OutdatedScript assetPrefix={assetPrefix} locale={preferredLocale} />
        ) : null}
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext): Promise<MyDocumentInitialProps> => {
  const originalRenderPage = ctx.renderPage;

  const cookies = new Cookies(ctx.req?.headers?.cookie);
  const responseCookies = new ResponseCookies(new Headers(ctx.res.getHeaders() as HeadersInit));

  const outdatedBrowser = responseCookies.get('outdatedBrowser')?.value === 'true'
    || cookies.get('outdatedBrowser') === 'true';

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: wrapWithCookies(cookies),
    });

  const initialProps = await Document.getInitialProps(ctx);

  const chunks = extractCriticalToChunks(initialProps.html);

  return {
    ...initialProps,
    sessionLocale: getSession(cookies)?.user?.culture,
    outdatedBrowser,
    styles: (
      <>
        {initialProps.styles}
        {chunks.styles.map(({ key, ids, css }, i) => (
          <style
            key={i} // eslint-disable-line react/no-array-index-key
            data-emotion={`${key} ${ids.join(' ')}`}
            dangerouslySetInnerHTML={{ __html: css }} // eslint-disable-line react/no-danger
          />
        ))}
      </>
    ),
  };
};

export default MyDocument;

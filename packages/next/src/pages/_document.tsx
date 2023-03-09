import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';
import { Cookies } from 'react-cookie';
import createEmotionServer from '@emotion/server/create-instance';
import { cache } from '@openagenda/uikit';
import getSession from 'utils/getSession';
import getPreferredLocale from 'utils/getPreferredLocale';

const { extractCriticalToChunks } = createEmotionServer(cache);

function wrapWithCookies(ctx) {
  return App => {
    const cookies = new Cookies(ctx.req?.headers?.cookie);
    const sessionLocale = getSession(cookies)?.user?.culture;

    const Wrapped = props => {
      const { pageProps } = props;
      pageProps.sessionLocale = sessionLocale;

      return <App universalCookies={cookies} {...props} />;
    };
    return Wrapped;
  };
}

function MyDocument({ locale, __NEXT_DATA__ }) {
  const preferredLocale = getPreferredLocale(
    __NEXT_DATA__.query.lang,
    locale,
    __NEXT_DATA__.props.pageProps.sessionLocale,
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
      </Head>
      <body className="chakra-ui-light">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext): Promise<DocumentInitialProps> => {
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: wrapWithCookies(ctx),
    });

  const initialProps = await Document.getInitialProps(ctx);

  const chunks = extractCriticalToChunks(initialProps.html);

  return {
    ...initialProps,
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

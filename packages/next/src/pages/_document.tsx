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
import getPreferredLocale from 'utils/getPreferredLocale';

const { extractCriticalToChunks } = createEmotionServer(cache);

function wrapWithCookies(ctx) {
  return App => {
    const Wrapped = props => (
      <App
        universalCookies={new Cookies(ctx.req?.headers?.cookie)}
        {...props}
      />
    );
    return Wrapped;
  };
}

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: App => wrapWithCookies(ctx)(App),
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
  }

  render() {
    const { locale, __NEXT_DATA__ } = this.props;

    return (
      <Html
        lang={getPreferredLocale(locale, __NEXT_DATA__.query.lang)}
        style={{ colorScheme: 'light' }}
        data-theme="light"
      >
        <Head>
          {process.env.NEXT_PUBLIC_ASSET_PREFIX && (
            <>
              <link rel="preconnect" href={process.env.NEXT_PUBLIC_ASSET_PREFIX} crossOrigin="" />
              <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_ASSET_PREFIX} />
            </>
          )}
        </Head>
        <body className="chakra-ui-light">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

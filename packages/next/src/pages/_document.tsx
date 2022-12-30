import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import { cache } from '@openagenda/uikit';

const { extractCriticalToChunks } = createEmotionServer(cache);

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
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
    return (
      <Html style={{ colorScheme: 'light' }} data-theme="light">
        <Head>
          {process.env.NEXT_PUBLIC_ASSET_PREFIX && (
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_ASSET_PREFIX} />
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

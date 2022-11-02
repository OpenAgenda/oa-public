import Document, {
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {process.env.NEXT_PUBLIC_ASSET_PREFIX && (
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_ASSET_PREFIX} />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

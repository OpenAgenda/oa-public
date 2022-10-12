import { Fragment } from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Providers from 'Providers';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  // Layout?: (props: { children: ReactNode }) => ReactElement<typeof props>
  Layout?: React.FC<{ children: React.ReactNode }>
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const Layout = Component.Layout || Fragment;

  return (
    <Providers>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  );
}

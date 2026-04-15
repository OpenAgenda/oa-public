import '../polyfills';

import '@fortawesome/fontawesome-svg-core/styles.css';
import '@openagenda/react-shared/css/react-date-range.css';

import { cookies } from 'next/headers';
import type { Metadata, Viewport } from 'next';
import { getLocaleValue } from '@openagenda/intl';
import * as metas from 'config/metas';
import AppLayout from 'components/app/Layout';
import getLocale from 'utils/getLocale';
import getNonce from 'utils/getNonce';
import fetchLocale from './locales';
import fetchExternalLocale from './locales/external';
import AppProviders from './AppProviders';
import { NonceProvider } from './NonceProvider';
import OutdatedBrowser from './OutdatedBrowser';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  viewportFit: 'cover',
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: 'OpenAgenda',
    description: getLocaleValue(metas.description, locale),
    keywords: getLocaleValue(metas.keywords, locale),
    other: {
      'theme-color': '#1D77CE',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const nonce = await getNonce();
  const [appMessages, externalMessages] = await Promise.all([
    fetchLocale(locale),
    fetchExternalLocale(locale),
  ]);
  // App messages win on key conflict so project overrides take precedence.
  const intlMessages = { ...externalMessages, ...appMessages };
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  return (
    <html lang={locale} style={{ colorScheme: 'light' }} data-theme="light">
      <head>
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
      </head>
      <body className="chakra-ui-light">
        {/* <div id="outdated"> must be the first child of <body> — the
            outdated-browser CSS lays it out in document flow, so later
            placement would push it mid-page. */}
        <OutdatedBrowser />
        <NonceProvider nonce={nonce}>
          <AppProviders
            locale={locale}
            intlMessages={intlMessages}
            cookieHeader={cookieHeader}
          >
            <AppLayout>{children}</AppLayout>
          </AppProviders>
        </NonceProvider>
      </body>
    </html>
  );
}

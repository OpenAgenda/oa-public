import '../polyfills';

import '@fortawesome/fontawesome-svg-core/styles.css';
import '@openagenda/react-shared/css/react-date-range.css';

import { cookies } from 'next/headers';
import type { Metadata, Viewport } from 'next';
import { getLocaleValue } from '@openagenda/intl';
import * as metas from 'config/metas';
import AppLayout from 'components/app/Layout';
import getLocale from 'utils/getLocale';
import fetchLocale from './locales';
import AppProviders from './AppProviders';

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
  const intlMessages = await fetchLocale(locale);
  const cookieHeader = (await cookies()).toString();

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
        <AppProviders
          locale={locale}
          intlMessages={intlMessages}
          cookieHeader={cookieHeader}
        >
          <AppLayout>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  );
}

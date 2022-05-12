import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useConstant } from '@openagenda/react-shared';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';

import { locales as memberLocales } from '@openagenda/member-apps';
import appLocales from '../../src/locales-compiled';

const locales = mergeLocales(appLocales, memberLocales);

const lang = 'fr';

export default Story => {
  const queryClient = useConstant(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <Story />
        </HelmetProvider>
      </QueryClientProvider>
    </IntlProvider>
  );
};

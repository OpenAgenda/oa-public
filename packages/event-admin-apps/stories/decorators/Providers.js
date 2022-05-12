import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router';
import { getSupportedLocale } from '@openagenda/intl';
import { useConstant } from '@openagenda/react-shared';
import { IntlProvider } from 'react-intl';

import locales from '../../src/locales-compiled';

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
    <MemoryRouter>
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
    </MemoryRouter>
  );
};

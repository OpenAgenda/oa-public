import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useConstant } from '@openagenda/react-shared';
import { IntlProvider } from 'react-intl';

import locales from '../locales-compiled';

export default function LocationsProvider({ children, lang }) {
  const queryClient = useConstant(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      }
    }
  }));
  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          {children}
        </HelmetProvider>
      </QueryClientProvider>
    </IntlProvider>
  );
}

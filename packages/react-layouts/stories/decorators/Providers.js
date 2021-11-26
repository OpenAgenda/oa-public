import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  useConstant,
  ApiClientContext,
  apiClient,
} from '@openagenda/react-shared';
import appLocales from '../../src/locales-compiled';

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

  const axios = useConstant(() => apiClient());

  return (
    <IntlProvider messages={appLocales[lang]} locale={lang} key={lang}>
      <ApiClientContext.Provider value={axios}>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <Story axios={axios} />
          </HelmetProvider>
        </QueryClientProvider>
      </ApiClientContext.Provider>
    </IntlProvider>
  );
};

import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  useConstant,
  ApiClientContext,
  apiClient,
} from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import * as appLocales from '../../src/locales-compiled/index.mjs';

const lang = 'fr';

export default (Story) => {
  const queryClient = useConstant(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const axios = useConstant(() => apiClient());

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      // eslint-disable-next-line import/namespace
      messages={appLocales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
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

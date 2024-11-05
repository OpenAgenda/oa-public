import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useConstant } from '@openagenda/react-shared';
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

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      // eslint-disable-next-line import/namespace
      messages={appLocales[lang]}
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

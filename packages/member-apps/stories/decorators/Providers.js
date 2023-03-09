import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useConstant } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import { IntlProvider } from 'react-intl';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/members';

import I18nContext from '../../src/contexts/I18nContext';
import locales from '../../src/locales-compiled';

const lang = 'fr';

const i18nContextValue = {
  lang,
  getLabel: (label, values = {}) =>
    makeGetterLabel(labels)(label, values, lang),
};

export default Story => {
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
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <I18nContext.Provider value={i18nContextValue}>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <Story />
          </HelmetProvider>
        </QueryClientProvider>
      </I18nContext.Provider>
    </IntlProvider>
  );
};

import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import redial from 'redial';
import { QueryClient, QueryClientProvider, useQueryClient } from 'react-query';
import { useConstant, useLayoutData } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import * as locales from '../locales-compiled/index.js';

function App({ route }) {
  const parentQueryClient = useQueryClient();
  const queryClient = useConstant(
    () =>
      parentQueryClient
      || new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const { lang } = useLayoutData();

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      // eslint-disable-next-line import/namespace
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <QueryClientProvider client={queryClient}>
        {renderRoutes(route.routes)}
      </QueryClientProvider>
    </IntlProvider>
  );
}

export default redial.provideHooks({
  inject: ({ store }) => store.inject({}),
})(App);

import React from 'react';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useConstant, useLayoutData } from '@openagenda/react-shared';
import { mergeLocales } from '@openagenda/intl';
import { locales as reactFiltersLocales } from '@openagenda/react-filters';
import statsReducer from '../reducers/stats';
import appLocales from '../locales-compiled';

const locales = mergeLocales(appLocales, reactFiltersLocales);

function App({ route }) {
  const { lang } = useLayoutData();
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
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <QueryClientProvider client={queryClient}>
        <div className="agenda-stats">{renderRoutes(route.routes)}</div>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </IntlProvider>
  );
}

export default provideHooks({
  inject: ({ store }) => store.inject({
    stats: statsReducer,
  }),
})(App);

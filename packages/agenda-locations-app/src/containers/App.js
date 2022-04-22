import React from 'react';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import { QueryClient, QueryClientProvider, useQueryClient } from 'react-query';
import { useConstant, useLayoutData } from '@openagenda/react-shared';
import locales from '../locales-compiled';
import mergeReducer from '../reducers/merge';
import onGoingReducer from '../reducers/onGoingModal';

function App({
  route,
}) {
  const parentQueryClient = useQueryClient();
  const queryClient = useConstant(
    () => parentQueryClient
      || new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const { lang } = useLayoutData();

  return (
    <IntlProvider
      messages={locales[lang]}
      locale={lang}
      key={lang}
    >
      <QueryClientProvider client={queryClient}>
        {renderRoutes(route.routes)}
      </QueryClientProvider>
    </IntlProvider>
  );
}

export default
provideHooks({
  inject: ({ store }) => store.inject({
    merge: mergeReducer,
    onGoing: onGoingReducer
  }),
})(App);

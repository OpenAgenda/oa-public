import React from 'react';
import { hot } from 'react-hot-loader/root';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { QueryClient, QueryClientProvider, useQueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useConstant, mergeLocales } from '@openagenda/react-shared';
import { locales as reactFiltersLocales } from '@openagenda/react-filters';
import eventsReducer from '../reducers/events';
import appLocales from '../locales-compiled';

const locales = mergeLocales(appLocales, reactFiltersLocales);

function App({
  route, agenda, agendaSchema, role, lang, filtersContainerRef
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

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <QueryClientProvider client={queryClient}>
        <div className="event-admin">
          {renderRoutes(route.routes, {
            agenda,
            agendaSchema,
            role,
            filtersContainerRef,
          })}
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </IntlProvider>
  );
}

export default hot(
  provideHooks({
    inject: ({ store }) => store.inject({
      events: eventsReducer,
    }),
  })(App)
);

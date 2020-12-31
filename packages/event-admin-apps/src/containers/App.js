import React from 'react';
import { hot } from 'react-hot-loader/root';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useConstant } from '@openagenda/react-shared';
import eventsReducer from '../reducers/events';
import locales from '../locales-compiled';

function App({
  route, agenda, agendaSchema, role, lang, filtersContainerRef
}) {
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

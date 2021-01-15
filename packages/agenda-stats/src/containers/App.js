import React from 'react';
import { hot } from 'react-hot-loader/root';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { mergeLocales, useConstant } from '@openagenda/react-shared';
import { locales as reactFiltersLocales } from '@openagenda/react-filters';
import statsReducer from '../reducers/stats';
import appLocales from '../locales-compiled';

const locales = mergeLocales(appLocales, reactFiltersLocales);

function App({
  route, user, agenda, agendaSchema, role, filtersContainerRef
}) {
  const lang = useSelector(state => state.settings.lang);
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
        <div className="agenda-stats">
          {renderRoutes(route.routes, {
            user,
            lang,
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
      stats: statsReducer,
    }),
  })(App)
);

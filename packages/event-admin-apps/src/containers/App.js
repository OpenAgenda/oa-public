import React from 'react';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { QueryClient, QueryClientProvider, useQueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Helmet } from 'react-helmet-async';
import {
  useConstant,
  mergeLocales,
  useLayoutData,
} from '@openagenda/react-shared';
import { locales as reactFiltersLocales } from '@openagenda/react-filters';
import { modalLocales } from '@openagenda/react-share-menus';
import eventsReducer from '../reducers/events';
import appLocales from '../locales-compiled';

const locales = mergeLocales(appLocales, reactFiltersLocales, modalLocales);

function App({ route }) {
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
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <QueryClientProvider client={queryClient}>
        <Helmet>
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
            integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
            crossOrigin=""
          />
          <script
            src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
            integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
            crossOrigin=""
          />
        </Helmet>
        <div className="event-admin">{renderRoutes(route.routes)}</div>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </IntlProvider>
  );
}

export default provideHooks({
  inject: ({ store }) => store.inject({
    events: eventsReducer,
  }),
})(App);

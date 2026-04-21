import redial from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools/index.js';
import { Helmet } from 'react-helmet-async';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import { useConstant, useLayoutData } from '@openagenda/react-shared';
import { locales as reactFiltersLocales } from '@openagenda/react-filters';
import * as commonLocales from '@openagenda/common-labels';
import eventsReducer from '../reducers/events.js';
import * as appLocales from '../locales-compiled/index.js';

const locales = mergeLocales(appLocales, reactFiltersLocales, commonLocales);

function App({ route }) {
  // const parentQueryClient = useQueryClient();
  const queryClient = useConstant(
    () =>
      /* parentQueryClient
      || */ new QueryClient({
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
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <QueryClientProvider client={queryClient}>
        <Helmet>
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

export default redial.provideHooks({
  inject: ({ store }) =>
    store.inject({
      events: eventsReducer,
    }),
})(App);

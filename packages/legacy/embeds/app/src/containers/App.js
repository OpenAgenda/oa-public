import React from 'react';
import { IntlProvider } from 'react-intl';
import { useConstant } from '@openagenda/react-shared';
import { QueryClient, QueryClientProvider } from 'react-query';
import { renderRoutes } from 'react-router-config';
import { hot } from 'react-hot-loader/root';
import locales from '../locales-compiled';

function App({
  route,
  agenda,
  lang,
  filtersContainerRef
}) {
  const queryClient = useConstant(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      }
    }
  }));

  return (
    <IntlProvider
      messages={locales[lang]}
      locale={lang}
      key={lang}
    >
      <QueryClientProvider client={queryClient} contextSharing>
        {renderRoutes(route.routes, {
          agendaUid: agenda.uid,
          lang,
          selectionMenuContainerRef: filtersContainerRef
        })}
      </QueryClientProvider>
    </IntlProvider>
  );
}

export default hot(App);

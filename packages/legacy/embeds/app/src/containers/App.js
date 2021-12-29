import React from 'react';
import { IntlProvider } from 'react-intl';
import { useConstant, useLayoutData } from '@openagenda/react-shared';
import { QueryClient, QueryClientProvider } from 'react-query';
import { renderRoutes } from 'react-router-config';
import locales from '../locales-compiled';

function App({ route }) {
  const queryClient = useConstant(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      }
    }
  }));

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

export default App;

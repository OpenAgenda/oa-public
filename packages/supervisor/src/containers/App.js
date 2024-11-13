import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useConstant, useLayoutData } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import * as locales from '../locales-compiled/index.js';

function App({ route, user }) {
  const { lang } = useLayoutData();
  const queryClient = useConstant(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider
        key={lang}
        locale={lang}
        // eslint-disable-next-line import/namespace
        messages={locales[lang]}
        defaultLocale={getSupportedLocale(lang)}
      >
        <div className="supervisor">{renderRoutes(route.routes, { user })}</div>
      </IntlProvider>
    </QueryClientProvider>
  );
}

export default App;

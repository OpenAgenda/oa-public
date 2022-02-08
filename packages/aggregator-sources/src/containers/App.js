import React from 'react';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { useLayoutData } from '@openagenda/react-shared';
import modalsReducer from '../reducers/modals';
import sourcesReducer from '../reducers/sources';
import locales from '../locales-compiled';

function App({ route }) {
  const { lang } = useLayoutData();

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <div className="aggregator-sources">{renderRoutes(route.routes)}</div>
    </IntlProvider>
  );
}

export default provideHooks({
  inject: ({ store }) => store.inject({
    modals: modalsReducer,
    sources: sourcesReducer,
  }),
})(App);

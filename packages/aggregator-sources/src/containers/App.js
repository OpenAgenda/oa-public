import redial from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { useLayoutData } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import modalsReducer from '../reducers/modals.js';
import sourcesReducer from '../reducers/sources.js';
import * as locales from '../locales-compiled/index.js';

function App({ route }) {
  const { lang } = useLayoutData();

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      // eslint-disable-next-line import/namespace
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <div className="aggregator-sources">{renderRoutes(route.routes)}</div>
    </IntlProvider>
  );
}

export default redial.provideHooks({
  inject: ({ store }) =>
    store.inject({
      modals: modalsReducer,
      sources: sourcesReducer,
    }),
})(App);

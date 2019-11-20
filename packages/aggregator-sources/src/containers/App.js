import React, { useMemo } from 'react';
import { hot } from 'react-hot-loader/root';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import modalsReducer from '../reducers/modals';
import sourcesReducer from '../reducers/sources';
import localeFr from '../locales/fr';
import localeEn from '../locales/en';

const messages = {
  fr: localeFr,
  en: localeEn
};

function App({ route, agenda }) {
  const lang = useSelector(state => state.settings.lang);

  const children = useMemo(() => renderRoutes(route.routes, { agenda }), [
    route.routes,
    agenda
  ]);

  return (
    <IntlProvider messages={messages[lang]} locale={lang} key={lang}>
      <div className="aggregator-sources">{children}</div>
    </IntlProvider>
  );
}

export default provideHooks({
  inject: ({ store }) => store.inject({
    modals: modalsReducer,
    sources: sourcesReducer
  })
})(module.hot ? hot(App) : App);

import React, { useMemo, useEffect, useLayoutEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import { IntlProvider } from 'react-intl';
import { useStore, useSelector } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import modalsReducer from '../reducers/modals';
import sourcesReducer from '../reducers/sources';
import localeFr from '../locales/fr';
import localeEn from '../locales/en';

const messages = {
  fr: localeFr,
  en: localeEn
};

const useIsomorphicEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function App({ route, agenda }) {
  const store = useStore();

  useIsomorphicEffect(
    () => store.inject({
      modals: modalsReducer,
      sources: sourcesReducer
    }),
    []
  );

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

export default module.hot ? hot(App) : App;

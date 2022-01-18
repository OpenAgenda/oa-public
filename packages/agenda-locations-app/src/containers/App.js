import React from 'react';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import locales from '../locales-compiled';
import mergeReducer from '../reducers/merge';
import onGoinReducer from '../reducers/onGoinModal';

function App({
  route,
  agenda,
  lang
}) {
  return (
    <IntlProvider
      messages={locales[lang]}
      locale={lang}
      key={lang}
    >
      {renderRoutes(route.routes, {
        agenda
      })}
    </IntlProvider>
  );
}

export default
provideHooks({
  inject: ({ store }) => store.inject({
    merge: mergeReducer,
    onGoin: onGoinReducer
  }),
})(App);

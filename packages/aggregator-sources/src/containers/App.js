import React from 'react';
import { hot } from 'react-hot-loader/root';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import modalsReducer from '../reducers/modals';
import sourcesReducer from '../reducers/sources';
import locales from '../locales-compiled';

function App({
  route, agenda, agendaSchema, role, lang
}) {
  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <div className="aggregator-sources">
        {renderRoutes(route.routes, { agenda, agendaSchema, role })}
      </div>
    </IntlProvider>
  );
}

export default hot(
  provideHooks({
    inject: ({ store }) => store.inject({
      modals: modalsReducer,
      sources: sourcesReducer,
    }),
  })(App)
);

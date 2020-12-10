import React from 'react';
import { hot } from 'react-hot-loader/root';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import eventsReducer from '../reducers/events';
import locales from '../locales-compiled';

function App({
  route, agenda, agendaSchema, role, lang
}) {
  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <div className="event-admin">
        {renderRoutes(route.routes, { agenda, agendaSchema, role })}
      </div>
    </IntlProvider>
  );
}

export default hot(
  provideHooks({
    inject: ({ store }) => store.inject({
      events: eventsReducer,
    }),
  })(App)
);

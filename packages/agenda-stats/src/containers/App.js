import React from 'react';
import { hot } from 'react-hot-loader/root';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import statsReducer from '../reducers/stats';
import locales from '../locales';

function App({
  route, user, agenda, agendaSchema, role
}) {
  const lang = useSelector(state => state.settings.lang);

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <div className="agenda-stats">
        {renderRoutes(route.routes, {
          user,
          lang,
          agenda,
          agendaSchema,
          role
        })}
      </div>
    </IntlProvider>
  );
}

export default hot(
  provideHooks({
    inject: ({ store }) => store.inject({
      stats: statsReducer
    })
  })(App)
);

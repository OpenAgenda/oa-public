import React, { useMemo } from 'react';
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

  const children = useMemo(
    () => renderRoutes(route.routes, {
      user,
      agenda,
      agendaSchema,
      role
    }),
    [route.routes, agenda, agendaSchema, role]
  );

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <div className="aggregator-sources">{children}</div>
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

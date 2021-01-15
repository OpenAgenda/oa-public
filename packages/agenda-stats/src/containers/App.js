import React from 'react';
import { hot } from 'react-hot-loader/root';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { mergeLocales } from '@openagenda/react-shared';
import { locales as reactFiltersLocales } from '@openagenda/react-filters';
import statsReducer from '../reducers/stats';
import appLocales from '../locales-compiled';

const locales = mergeLocales(appLocales, reactFiltersLocales);

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
          role,
        })}
      </div>
    </IntlProvider>
  );
}

export default hot(
  provideHooks({
    inject: ({ store }) => store.inject({
      stats: statsReducer,
    }),
  })(App)
);

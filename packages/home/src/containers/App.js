import { useCallback, useMemo } from 'react';
import redial from 'redial';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import useIsomorphicLayoutEffectModule from 'react-use/lib/useIsomorphicLayoutEffect.js';
import { QueryClient, QueryClientProvider } from 'react-query';
import classNames from 'classnames';
import makeGetterLabel from '@openagenda/labels';
import { useLayoutData, useConstant } from '@openagenda/react-shared';
import { locales as memberAppsLocales } from '@openagenda/member-apps';
import { getSupportedLocale } from '@openagenda/intl';
import labels from '@openagenda/labels/home/index.js';
import I18nContext from '../contexts/I18nContext.js';
import MenuItem from '../components/MenuItem.js';
import menuReducer from '../reducers/menu.js';
import agendasReducer from '../reducers/agendas.js';
import eventsReducer from '../reducers/events.js';
import modalsReducer from '../reducers/modals.js';

const useIsomorphicLayoutEffect = useIsomorphicLayoutEffectModule.default || useIsomorphicLayoutEffectModule;

function App({ route }) {
  const queryClient = useConstant(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const { user, lang } = useLayoutData();

  const prefix = useSelector((state) => state.settings.prefix);
  const tab = useSelector((state) => state.menu.tab);
  const total = useSelector(
    (state) => state.agendas.homeAgendas && state.agendas.homeAgendas.total,
  );

  const getLabel = useCallback(
    (label, values = {}) => makeGetterLabel(labels)(label, values, lang),
    [lang],
  );

  const i18nContextValue = useMemo(
    () => ({
      lang,
      getLabel,
    }),
    [lang, getLabel],
  );

  const history = useHistory();

  useIsomorphicLayoutEffect(() => {
    if (!user || !user.uid) {
      const historyObj = typeof window === 'undefined' ? history : window.location;

      historyObj.replace('/');
    }
  }, [user, history]);

  if (!user || !user.uid) {
    return null;
  }

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      // eslint-disable-next-line import/namespace
      messages={memberAppsLocales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <QueryClientProvider client={queryClient}>
        <I18nContext.Provider value={i18nContextValue}>
          {!total
            ? renderRoutes(route.routes)
            : (
              <div
                className={classNames('container top-margined home', {
                  [`home-${tab}`]: tab,
                })}
              >
                <div className="row">
                  <div className="col-sm-8 col-sm-offset-2">
                    <ul className="home-nav list-inline">
                      <MenuItem linkTo={prefix || '/'} active={tab === 'agendas'}>
                        {getLabel('myAgendas')}
                      </MenuItem>
                      <MenuItem
                        linkTo={`${prefix}/events`}
                        active={tab === 'events'}
                      >
                        {getLabel('myEvents')}
                      </MenuItem>
                    </ul>
                    <div className="wsq">{renderRoutes(route.routes)}</div>
                  </div>
                </div>
              </div>
            )}
        </I18nContext.Provider>
      </QueryClientProvider>
    </IntlProvider>
  );
}

export default redial.provideHooks({
  inject: ({ store }) =>
    store.inject({
      menu: menuReducer,
      events: eventsReducer,
      agendas: agendasReducer,
      modals: modalsReducer,
    }),
})(App);

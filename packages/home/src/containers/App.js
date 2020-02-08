import React, { useCallback, useMemo } from 'react';
import { hot } from 'react-hot-loader/root';
import { provideHooks } from 'redial';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { useIsomorphicLayoutEffect } from 'react-use';
import classNames from 'classnames';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/home';
import I18nContext from '../contexts/I18nContext';
import MenuItem from '../components/MenuItem';
import menuReducer from '../reducers/menu';
import agendasReducer from '../reducers/agendas';
import eventsReducer from '../reducers/events';
import modalsReducer from '../reducers/modals';

function App({ route, user, lang }) {
  const prefix = useSelector(state => state.settings.prefix);
  const tab = useSelector(state => state.menu.tab);
  const total = useSelector(
    state => state.agendas.homeAgendas && state.agendas.homeAgendas.total
  );

  const getLabel = useCallback(
    (label, values = {}) => makeGetterLabel(labels)(label, values, lang),
    [lang]
  );

  const i18nContextValue = useMemo(
    () => ({
      lang,
      getLabel
    }),
    [lang, getLabel]
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
    <I18nContext.Provider value={i18nContextValue}>
      {user.isNew && !total ? (
        <div className="container top-margined home">
          <div className="col-sm-8 col-sm-offset-2">
            <div className="row wsq">
              <div className="content">
                {renderRoutes(route.routes, { user, lang })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={classNames('container top-margined home', {
            [`home-${tab}`]: tab
          })}
        >
          <div className="row">
            <div className="col-sm-8 col-sm-offset-2">
              <ul className="home-nav list-inline">
                <MenuItem linkTo={prefix || '/'} active={tab === 'agendas'}>
                  {getLabel('myAgendas')}
                </MenuItem>
                <MenuItem linkTo={`${prefix}/events`} active={tab === 'events'}>
                  {getLabel('myEvents')}
                </MenuItem>
              </ul>
              <div className="wsq">
                {renderRoutes(route.routes, { user, lang })}
              </div>
            </div>
          </div>
        </div>
      )}
    </I18nContext.Provider>
  );
}

export default hot(
  provideHooks({
    inject: ({ store }) => store.inject({
      menu: menuReducer,
      events: eventsReducer,
      agendas: agendasReducer,
      modals: modalsReducer
    })
  })(App)
);

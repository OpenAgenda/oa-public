import React, { useMemo } from 'react';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import { reducer as formReducer } from 'redux-form';
import makeGetterLabel from '@openagenda/labels';
import { useLayoutData } from '@openagenda/react-shared';
import labels from '@openagenda/labels/users/settings';
import * as userSettingsActions from '../reducers/userSettings';
import I18nContext from '../contexts/I18nContext';

function App({ route }) {
  const { lang } = useLayoutData();

  const i18nContextValue = useMemo(() => ({
    lang,
    labels,
    getLabel: (label, values = {}) => makeGetterLabel(labels)(label, values, lang)
  }), [lang]);

  return (
    <I18nContext.Provider value={i18nContextValue}>
      <div className="container user-settings">
        <div className="row">
          <div className="col-md-10 col-md-offset-1">
            <div className="top-margined wsq">
              <div className="content">
                <div className="header">
                  <h2>{i18nContextValue.getLabel('accountParameters', lang)}</h2>
                </div>

                {renderRoutes(route.routes)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </I18nContext.Provider>
  );
}

export default provideHooks({
  inject: ({ store }) => store.inject({
    form: formReducer,
    userSettings: userSettingsActions.default
  })
})(App);


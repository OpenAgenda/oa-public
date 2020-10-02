import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import { reducer as formReducer } from 'redux-form';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/users/settings';
import * as userSettingsActions from '../reducers/userSettings';
import I18nContext from '../contexts/I18nContext';

const getLabel = makeGetterLabel(labels);

@provideHooks({
  inject: ({ store }) => store.inject({
    form: formReducer,
    userSettings: userSettingsActions.default
  })
})
export default class App extends Component {
  static childContextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  i18nContextValue = {
    lang: this.props.lang,
    getLabel: (label, values = {}) => makeGetterLabel(labels)(label, values, this.props.lang)
  };

  getChildContext() {
    const { lang } = this.props;

    return {
      lang,
      getLabel: (label, values = {}) => getLabel( label, values, lang )
    };
  }

  render() {
    const { route, user, lang } = this.props;
    const { getLabel } = this.i18nContextValue;

    return (
      <I18nContext.Provider value={this.i18nContextValue}>
        <div className="container user-settings">
          <div className="row">
            <div className="col-md-10 col-md-offset-1">
              <div className="top-margined wsq">
                <div className="content">
                  <div className="header">
                    <h2>{getLabel('accountParameters', lang)}</h2>
                  </div>

                  {renderRoutes(route.routes, { user, lang })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </I18nContext.Provider>
    );
  }
}

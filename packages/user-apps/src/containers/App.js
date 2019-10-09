import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import { reducer as formReducer } from 'redux-form';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/users/settings';
import * as userSettingsActions from '../reducers/userSettings';

const getLabel = makeGetterLabel( labels );

@provideHooks( {
  inject: ( { store } ) => store.inject( {
    form: formReducer,
    userSettings: userSettingsActions.default
  } )
} )
@connect(
  state => ({
    lang: state.settings.lang
  })
)
export default class App extends Component {
  static childContextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  getChildContext() {
    const { lang } = this.props;

    return {
      lang,
      getLabel: (label, values = {}) => getLabel( label, values, lang )
    };
  }

  render() {
    const { lang, route } = this.props;

    return (
      <div className="container user-settings">
        <div className="row">
          <div className="col-md-10 col-md-offset-1">
            <div className="top-margined wsq">
              <div className="content">
                <div className="header">
                  <h2>{getLabel( 'accountParameters', lang )}</h2>
                </div>

                {renderRoutes( route.routes )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

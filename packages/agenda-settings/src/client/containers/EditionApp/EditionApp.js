import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import { reducer as formReducer } from 'redux-form';
import { withLayoutData, Spinner } from '@openagenda/react-shared';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-settings/agendaEdition';
import * as agendaActions from '../../reducers/agenda';
import * as keysActions from '../../reducers/keys';
import * as modalsActions from '../../reducers/modals';
import I18nContext from '../../contexts/I18nContext';

@withLayoutData('lang')
@provideHooks({
  inject: ({ store }) => store.inject({
    form: formReducer.plugin({
      agendaCreation: agendaActions.formPlugin
    }),
    agenda: agendaActions.default,
    keys: keysActions.default,
    modals: modalsActions.default
  }),
  defer: async ({ store: { dispatch, getState } }) => {
    const promises = [];

    // if ( !agendaActions.isLoaded( getState() ) ) {
    //   promises.push( dispatch( agendaActions.load() ) );
    // }

    if (!keysActions.isLoaded(getState())) {
      promises.push(dispatch(keysActions.load()));
    }

    return Promise.all(typeof window !== 'undefined' ? [] : promises);
  }
})
@connect(
  state => ({
    loading: state.agenda.loading
  })
)
export default class EditionApp extends Component {
  static childContextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  i18nContextValue = {
    lang: this.props.lang,
    getLabel: (label, values = {}) => makeGetterLabel(labels)(label, values, this.props.lang)
  };

  getChildContext() {
    return this.i18nContextValue;
  }

  render() {
    const { route, loading } = this.props;

    return (
      <I18nContext.Provider value={this.i18nContextValue}>
        <div className="agenda-settings-edit">
          {loading
            ? (
              <div style={{ margin: '150px 0' }}>
                <Spinner />
              </div>
            ) : renderRoutes(route.routes)}
        </div>
      </I18nContext.Provider>
    );
  }

}

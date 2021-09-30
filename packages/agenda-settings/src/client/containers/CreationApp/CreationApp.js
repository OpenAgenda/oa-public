import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import { reducer as formReducer } from 'redux-form';
import makeGetterLabel from '@openagenda/labels';
import { withLayoutData } from '@openagenda/react-shared';
import labels from '@openagenda/labels/agenda-settings/agendaCreation';
import * as agendaActions from '../../reducers/agenda';
import I18nContext from '../../contexts/I18nContext';

@withLayoutData('lang')
@provideHooks({
  inject: ({ store }) => store.inject({
    form: formReducer.plugin({
      agendaCreation: agendaActions.formPlugin
    }),
    agenda: agendaActions.default
  })
})
@connect(
  state => ({
    loading: state.agenda.loading
  })
)
export default class CreationApp extends Component {
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
    const { route } = this.props;

    return (
      <I18nContext.Provider value={this.i18nContextValue}>
        <div className="page">
          <div className="container agenda-settings-creation">
            {renderRoutes(route.routes)}
          </div>
        </div>
      </I18nContext.Provider>
    );
  }

}


import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import Spinner from '@openagenda/react-components/build/Spinner';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-settings/agendaEdition';
import * as agendaActions from '../../redux/modules/agenda';
import * as keysActions from '../../redux/modules/keys';


@provideHooks( {
  fetch: async ( { store: { dispatch, getState } } ) => {
    const promises = [];

    if ( !agendaActions.isLoaded( getState() ) ) {
      promises.push( dispatch( agendaActions.load() ) );
    }

    if ( !keysActions.isLoaded( getState() ) ) {
      promises.push( dispatch( keysActions.load() ) );
    }

    return Promise.all( __CLIENT__ ? [] : promises );
  }
} )
@connect(
  state => ({
    lang: state.settings.lang,
    loading: state.agenda.loading
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
      getLabel: ( label, values ) => makeGetterLabel( labels, lang )( label, values )
    };
  }

  render() {
    const { route, loading } = this.props;

    return (
      <div className="agenda-settings-edit">
        {loading
          ? (
            <div style={{ margin: '150px 0' }}>
              <Spinner />
            </div>
          ) : renderRoutes( route.routes )}
      </div>
    );
  }

}

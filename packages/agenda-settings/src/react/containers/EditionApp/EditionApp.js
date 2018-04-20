import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-settings/agendaEdition';
import * as agendaActions from '../../redux/modules/agenda';
import * as keysActions from '../../redux/modules/keys';

@asyncConnect( [ {
  promise: ( { store: { dispatch, getState } } ) => {
    const promises = [];

    if ( !agendaActions.isLoaded( getState() ) ) {
      promises.push( dispatch( agendaActions.load() ) );
    }

    if ( !keysActions.isLoaded( getState() ) ) {
      promises.push( dispatch( keysActions.load() ) );
    }

    return Promise.all( promises );
  }
} ] )
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
      getLabel: ( label, values ) => makeGetterLabel( labels, lang )( label, values )
    };
  }

  render() {
    return (
      <div className="agenda-settings-edit">
        {this.props.children}
      </div>
    );
  }

}